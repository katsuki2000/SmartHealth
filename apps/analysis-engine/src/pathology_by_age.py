"""
═══════════════════════════════════════════════════════════════════
SmartHealth — PySpark Big Data Analysis Engine
═══════════════════════════════════════════════════════════════════
Lit les 165K+ ressources FHIR depuis la table JSONB `fhir_resources`
et effectue des analyses croisées épidémiologiques via Spark SQL.

Analyses :
  1. Patients     — Démographie (âge, genre)
  2. Conditions   — Top pathologies, croisement pathologie × âge × genre
  3. Encounters   — Types de consultations, durée moyenne
  4. Observations — Constantes vitales (tension, poids, etc.)
  5. Summary      — Écriture du résumé analytique dans PostgreSQL
═══════════════════════════════════════════════════════════════════
"""

import os
import sys
from dotenv import load_dotenv

dotenv_loaded = load_dotenv()
if not dotenv_loaded:
    print("⚠️  Avertissement : aucun fichier .env trouvé dans apps/analysis-engine.")
    print("   Copiez .env.example en .env et configurez DB_USER/DB_PASSWORD.")

# Fix PySpark Windows — Hadoop winutils
HADOOP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "hadoop"))
os.environ["HADOOP_HOME"] = HADOOP_DIR
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import (
    col, count, round as spark_round, avg, sum as spark_sum,
    min as spark_min, max as spark_max,
    floor, datediff, current_date, when, lit,
    get_json_object, explode, from_json, to_timestamp,
    regexp_replace, dense_rank, desc, row_number,
    unix_timestamp, abs as spark_abs
)
from pyspark.sql.window import Window
from pyspark.sql.types import (
    StructType, StructField, StringType, DoubleType, TimestampType
)

# ═══════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "health_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not DB_PASSWORD:
    raise RuntimeError(
        "La variable DB_PASSWORD n'est pas définie. "
        "Copiez apps/analysis-engine/.env.example en apps/analysis-engine/.env "
        "et définissez DB_PASSWORD."
    )

JDBC_URL = f"jdbc:postgresql://{DB_HOST}:{DB_PORT}/{DB_NAME}"
POSTGRES_DRIVER = "org.postgresql.Driver"


def create_spark_session() -> SparkSession:
    """Crée une session Spark locale avec le driver PostgreSQL."""
    print("══════════════════════════════════════════════════")
    print("  🔬 SmartHealth — Big Data Analysis Engine")
    print("     Powered by PySpark + FHIR JSONB")
    print("══════════════════════════════════════════════════\n")

    tmp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'tmp', 'spark'))
    os.makedirs(tmp_dir, exist_ok=True)
    os.environ['TMPDIR'] = tmp_dir
    os.environ['SPARK_LOCAL_DIRS'] = tmp_dir
    os.environ['SPARK_LOCAL_IP'] = '127.0.0.1'

    spark = (
        SparkSession.builder
        .appName("SmartHealth-BigData-Analytics")
        .master("local[*]")
        .config("spark.jars.packages", "org.postgresql:postgresql:42.7.5")
        .config("spark.driver.extraJavaOptions", f"-Duser.timezone=UTC -Djava.io.tmpdir={tmp_dir}")
        .config("spark.sql.session.timeZone", "UTC")
        .config("spark.local.dir", tmp_dir)
        .config("spark.driver.memory", "2g")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")
    print("✅ Session Spark créée\n")
    return spark


def read_table(spark: SparkSession, table_name: str) -> DataFrame:
    """Lit une table PostgreSQL via JDBC."""
    return (
        spark.read.format("jdbc")
        .option("url", JDBC_URL)
        .option("dbtable", table_name)
        .option("user", DB_USER)
        .option("password", DB_PASSWORD)
        .option("driver", POSTGRES_DRIVER)
        .load()
    )


def load_fhir_by_type(spark: SparkSession, resource_type: str) -> DataFrame:
    """
    Charge les ressources FHIR d'un type donné depuis la table JSONB.
    La colonne 'content' est de type JSON PostgreSQL — Spark la lit comme String.
    On utilise get_json_object() pour extraire les champs.
    """
    query = f"""(
        SELECT id, "resourceType" as resource_type,
               content::text as content_json,
               "createdAt" as created_at
        FROM fhir_resources
        WHERE "resourceType" = '{resource_type}'
    ) AS fhir_sub"""
    return read_table(spark, query)


# ═══════════════════════════════════════════════════════════
# ANALYSE 1 : Patients (depuis la table relationnelle)
# ═══════════════════════════════════════════════════════════
def analyze_patients(spark: SparkSession) -> DataFrame:
    """Analyse démographique des patients. Retourne le DataFrame enrichi."""
    print("═══════════════════════════════════════════════════")
    print("  📈 ANALYSE 1 : Démographie des patients")
    print("═══════════════════════════════════════════════════\n")

    df = read_table(spark, '"Patient"')
    total = df.count()
    print(f"📊 {total} patients trouvés en base\n")

    if total == 0:
        print("⚠️  Aucun patient trouvé.\n")
        return df

    df_with_age = df.withColumn(
        "age",
        floor(datediff(current_date(), col("birthDate")) / 365.25).cast("int")
    )

    df_classified = df_with_age.withColumn(
        "age_group",
        when(col("age") < 18, lit("0-17 (Pédiatrie)"))
        .when(col("age") < 30, lit("18-29 (Jeune adulte)"))
        .when(col("age") < 45, lit("30-44 (Adulte)"))
        .when(col("age") < 60, lit("45-59 (Senior)"))
        .when(col("age") < 75, lit("60-74 (3ème âge)"))
        .otherwise(lit("75+ (Gériatrie)"))
    )

    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par tranche d'âge                  │")
    print("└─────────────────────────────────────────────────┘")
    df_classified.groupBy("age_group").agg(
        count("*").alias("nb_patients")
    ).orderBy("age_group").show(truncate=False)

    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par genre                          │")
    print("└─────────────────────────────────────────────────┘")
    df_classified.groupBy("gender").agg(
        count("*").alias("nb_patients")
    ).orderBy("gender").show(truncate=False)

    print("┌─────────────────────────────────────────────────┐")
    print("│  Croisement tranche d'âge × genre               │")
    print("└─────────────────────────────────────────────────┘")
    df_classified.groupBy("age_group", "gender").agg(
        count("*").alias("nb_patients")
    ).orderBy("age_group", "gender").show(truncate=False)

    print("┌─────────────────────────────────────────────────┐")
    print("│  Statistiques d'âge globales                    │")
    print("└─────────────────────────────────────────────────┘")
    df_classified.agg(
        spark_round(avg("age"), 1).alias("age_moyen"),
        spark_min("age").alias("age_min"),
        spark_max("age").alias("age_max"),
        count("*").alias("total_patients"),
    ).show(truncate=False)

    return df_classified


# ═══════════════════════════════════════════════════════════
# ANALYSE 2 : Conditions / Pathologies (depuis JSONB)
# ═══════════════════════════════════════════════════════════
def analyze_conditions(spark: SparkSession, patients_df: DataFrame):
    """
    Analyse épidémiologique des pathologies.
    Extrait les codes SNOMED depuis le JSON FHIR et croise avec l'âge/genre.
    """
    print("═══════════════════════════════════════════════════")
    print("  🦠 ANALYSE 2 : Pathologies (FHIR JSONB → Spark)")
    print("═══════════════════════════════════════════════════\n")

    raw_df = load_fhir_by_type(spark, "Condition")
    total = raw_df.count()
    print(f"📊 {total} Conditions FHIR chargées depuis JSONB\n")

    if total == 0:
        print("⚠️  Aucune Condition trouvée.\n")
        return

    # ── Extraction des champs JSON via get_json_object ──
    conditions_df = raw_df.select(
        col("id"),
        get_json_object("content_json", "$.code.coding[0].display").alias("pathology_name"),
        get_json_object("content_json", "$.code.coding[0].code").alias("snomed_code"),
        get_json_object("content_json", "$.clinicalStatus.coding[0].code").alias("clinical_status"),
        get_json_object("content_json", "$.onsetDateTime").alias("onset_date"),
        get_json_object("content_json", "$.abatementDateTime").alias("abatement_date"),
        get_json_object("content_json", "$.subject.reference").alias("patient_ref"),
    ).withColumn(
        # Extraire l'UUID patient depuis "urn:uuid:xxxx"
        "fhir_patient_id",
        regexp_replace(col("patient_ref"), "urn:uuid:", "")
    )

    conditions_df.cache()

    # ── Stat 1 : Top 20 pathologies ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Top 20 pathologies (code SNOMED)               │")
    print("└─────────────────────────────────────────────────┘")
    conditions_df.groupBy("pathology_name", "snomed_code").agg(
        count("*").alias("nb_cas")
    ).orderBy(desc("nb_cas")).limit(20).show(truncate=False)

    # ── Stat 2 : Statut clinique ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par statut clinique                │")
    print("└─────────────────────────────────────────────────┘")
    conditions_df.groupBy("clinical_status").agg(
        count("*").alias("nb_conditions")
    ).orderBy(desc("nb_conditions")).show(truncate=False)

    # ── Jointure avec Patients FHIR pour le croisement âge/genre ──
    # On charge les patients FHIR pour avoir la correspondance UUID
    fhir_patients = load_fhir_by_type(spark, "Patient")
    patients_fhir_df = fhir_patients.select(
        get_json_object("content_json", "$.id").alias("fhir_id"),
        get_json_object("content_json", "$.gender").alias("gender"),
        get_json_object("content_json", "$.birthDate").alias("birth_date_str"),
    ).withColumn(
        "birth_date", to_timestamp("birth_date_str", "yyyy-MM-dd")
    ).withColumn(
        "age", floor(datediff(current_date(), col("birth_date")) / 365.25).cast("int")
    ).withColumn(
        "age_group",
        when(col("age") < 18, lit("0-17"))
        .when(col("age") < 30, lit("18-29"))
        .when(col("age") < 45, lit("30-44"))
        .when(col("age") < 60, lit("45-59"))
        .when(col("age") < 75, lit("60-74"))
        .otherwise(lit("75+"))
    )

    # Jointure Conditions × Patients
    joined = conditions_df.join(
        patients_fhir_df,
        conditions_df["fhir_patient_id"] == patients_fhir_df["fhir_id"],
        "left"
    )

    # ── Stat 3 : Top pathologies par tranche d'âge ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Top 5 pathologies par tranche d'âge            │")
    print("└─────────────────────────────────────────────────┘")
    w = Window.partitionBy("age_group").orderBy(desc("nb_cas"))
    top_by_age = (
        joined.groupBy("age_group", "pathology_name")
        .agg(count("*").alias("nb_cas"))
        .withColumn("rank", row_number().over(w))
        .filter(col("rank") <= 5)
        .drop("rank")
        .orderBy("age_group", desc("nb_cas"))
    )
    top_by_age.show(50, truncate=False)

    # ── Stat 4 : Pathologies par genre ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Top 10 pathologies par genre                   │")
    print("└─────────────────────────────────────────────────┘")
    w2 = Window.partitionBy("gender").orderBy(desc("nb_cas"))
    (
        joined.groupBy("gender", "pathology_name")
        .agg(count("*").alias("nb_cas"))
        .withColumn("rank", row_number().over(w2))
        .filter(col("rank") <= 10)
        .drop("rank")
        .orderBy("gender", desc("nb_cas"))
    ).show(30, truncate=False)

    conditions_df.unpersist()


# ═══════════════════════════════════════════════════════════
# ANALYSE 3 : Encounters / Consultations (depuis JSONB)
# ═══════════════════════════════════════════════════════════
def analyze_encounters(spark: SparkSession):
    """Analyse des consultations : type, classe, durée."""
    print("═══════════════════════════════════════════════════")
    print("  🏥 ANALYSE 3 : Consultations (FHIR JSONB)")
    print("═══════════════════════════════════════════════════\n")

    raw_df = load_fhir_by_type(spark, "Encounter")
    total = raw_df.count()
    print(f"📊 {total} Encounters FHIR chargés depuis JSONB\n")

    if total == 0:
        print("⚠️  Aucun Encounter trouvé.\n")
        return

    encounters_df = raw_df.select(
        col("id"),
        get_json_object("content_json", "$.type[0].coding[0].display").alias("encounter_type"),
        get_json_object("content_json", "$.class.code").alias("encounter_class"),
        get_json_object("content_json", "$.status").alias("status"),
        get_json_object("content_json", "$.period.start").alias("period_start"),
        get_json_object("content_json", "$.period.end").alias("period_end"),
        get_json_object("content_json", "$.serviceProvider.display").alias("provider"),
    )

    encounters_df.cache()

    # ── Stat 1 : Par classe (AMB, IMP, EMER...) ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par classe (AMB/IMP/EMER)          │")
    print("└─────────────────────────────────────────────────┘")
    encounters_df.groupBy("encounter_class").agg(
        count("*").alias("nb_encounters")
    ).orderBy(desc("nb_encounters")).show(truncate=False)

    # ── Stat 2 : Top 15 types de consultation ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Top 15 types de consultation                   │")
    print("└─────────────────────────────────────────────────┘")
    encounters_df.groupBy("encounter_type").agg(
        count("*").alias("nb")
    ).orderBy(desc("nb")).limit(15).show(truncate=False)

    # ── Stat 3 : Durée moyenne par classe ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Durée moyenne de consultation (en minutes)     │")
    print("└─────────────────────────────────────────────────┘")
    with_duration = encounters_df.withColumn(
        "start_ts", to_timestamp("period_start")
    ).withColumn(
        "end_ts", to_timestamp("period_end")
    ).withColumn(
        "duration_min",
        (unix_timestamp("end_ts") - unix_timestamp("start_ts")) / 60
    ).filter(col("duration_min").isNotNull() & (col("duration_min") > 0))

    with_duration.groupBy("encounter_class").agg(
        spark_round(avg("duration_min"), 1).alias("duree_moy_min"),
        spark_min("duration_min").cast("int").alias("min_min"),
        spark_max("duration_min").cast("int").alias("max_min"),
        count("*").alias("nb"),
    ).orderBy(desc("nb")).show(truncate=False)

    # ── Stat 4 : Top 10 établissements ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Top 10 établissements de santé                 │")
    print("└─────────────────────────────────────────────────┘")
    encounters_df.filter(col("provider").isNotNull()).groupBy("provider").agg(
        count("*").alias("nb_visites")
    ).orderBy(desc("nb_visites")).limit(10).show(truncate=False)

    encounters_df.unpersist()


# ═══════════════════════════════════════════════════════════
# ANALYSE 4 : Observations / Constantes vitales (depuis JSONB)
# ═══════════════════════════════════════════════════════════
def analyze_observations(spark: SparkSession):
    """Analyse des constantes vitales : valeurs moyennes, min/max."""
    print("═══════════════════════════════════════════════════")
    print("  🩺 ANALYSE 4 : Observations / Constantes vitales")
    print("═══════════════════════════════════════════════════\n")

    raw_df = load_fhir_by_type(spark, "Observation")
    total = raw_df.count()
    print(f"📊 {total} Observations FHIR chargées depuis JSONB\n")

    if total == 0:
        print("⚠️  Aucune Observation trouvée.\n")
        return

    obs_df = raw_df.select(
        col("id"),
        get_json_object("content_json", "$.code.coding[0].display").alias("observation_name"),
        get_json_object("content_json", "$.code.coding[0].code").alias("loinc_code"),
        get_json_object("content_json", "$.category[0].coding[0].code").alias("category"),
        get_json_object("content_json", "$.valueQuantity.value").cast("double").alias("value"),
        get_json_object("content_json", "$.valueQuantity.unit").alias("unit"),
        get_json_object("content_json", "$.effectiveDateTime").alias("effective_date"),
    )

    obs_df.cache()

    # ── Stat 1 : Volume par catégorie ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par catégorie                      │")
    print("└─────────────────────────────────────────────────┘")
    obs_df.groupBy("category").agg(
        count("*").alias("nb_obs")
    ).orderBy(desc("nb_obs")).show(truncate=False)

    # ── Stat 2 : Top 15 types d'observations ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Top 15 types d'observations mesurées           │")
    print("└─────────────────────────────────────────────────┘")
    obs_df.groupBy("observation_name", "loinc_code", "unit").agg(
        count("*").alias("nb")
    ).orderBy(desc("nb")).limit(15).show(truncate=False)

    # ── Stat 3 : Statistiques des constantes vitales numériques ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Statistiques des constantes vitales            │")
    print("│  (valeurs numériques uniquement)                │")
    print("└─────────────────────────────────────────────────┘")
    numeric_obs = obs_df.filter(col("value").isNotNull())
    numeric_obs.groupBy("observation_name", "unit").agg(
        count("*").alias("nb_mesures"),
        spark_round(avg("value"), 2).alias("moyenne"),
        spark_round(spark_min("value"), 2).alias("min"),
        spark_round(spark_max("value"), 2).alias("max"),
    ).orderBy(desc("nb_mesures")).limit(20).show(truncate=False)

    obs_df.unpersist()


# ═══════════════════════════════════════════════════════════
# ÉCRITURE : Résumé analytique enrichi → PostgreSQL
# ═══════════════════════════════════════════════════════════
def write_analytics_summary(spark: SparkSession):
    """
    Calcule les métriques clés (incluant JSONB) et écrit dans PostgreSQL.
    Spark fait le calcul lourd → psycopg2 écrit le résultat.
    """
    print("═══════════════════════════════════════════════════")
    print("  💾 ÉCRITURE : Résumé analytique → PostgreSQL")
    print("═══════════════════════════════════════════════════\n")

    # ── Métriques relationnelles ──
    patients_df = read_table(spark, '"Patient"')
    appointments_df = read_table(spark, '"Appointment"')
    practitioners_df = read_table(spark, '"Practitioner"')

    total_patients = patients_df.count()
    total_practitioners = practitioners_df.count()
    urgent_appointments = appointments_df.filter(col("status") == "EMERGENCY").count()

    avg_age_row = (
        patients_df
        .withColumn("age", floor(datediff(current_date(), col("birthDate")) / 365.25).cast("int"))
        .agg(spark_round(avg("age"), 1).alias("avg_age"))
        .collect()
    )
    average_age = float(avg_age_row[0]["avg_age"]) if avg_age_row[0]["avg_age"] is not None else 0.0

    # ── Métriques JSONB (Big Data) ──
    fhir_total_query = """(
        SELECT COUNT(*) as total FROM fhir_resources
    ) AS cnt"""
    fhir_total = read_table(spark, fhir_total_query).collect()[0]["total"]

    conditions_count_query = """(
        SELECT COUNT(*) as total FROM fhir_resources WHERE "resourceType" = 'Condition'
    ) AS cnt"""
    total_conditions = read_table(spark, conditions_count_query).collect()[0]["total"]

    encounters_count_query = """(
        SELECT COUNT(*) as total FROM fhir_resources WHERE "resourceType" = 'Encounter'
    ) AS cnt"""
    total_encounters = read_table(spark, encounters_count_query).collect()[0]["total"]

    observations_count_query = """(
        SELECT COUNT(*) as total FROM fhir_resources WHERE "resourceType" = 'Observation'
    ) AS cnt"""
    total_observations = read_table(spark, observations_count_query).collect()[0]["total"]

    # Top pathology
    top_pathology_df = load_fhir_by_type(spark, "Condition")
    top_path_row = (
        top_pathology_df.select(
            get_json_object("content_json", "$.code.coding[0].display").alias("name")
        )
        .groupBy("name").agg(count("*").alias("cnt"))
        .orderBy(desc("cnt")).limit(1).collect()
    )
    top_pathology = top_path_row[0]["name"] if top_path_row else "N/A"
    top_pathology_count = int(top_path_row[0]["cnt"]) if top_path_row else 0

    print(f"  📊 total_patients        = {total_patients}")
    print(f"  📊 total_fhir_resources  = {fhir_total}")
    print(f"  📊 total_conditions      = {total_conditions}")
    print(f"  📊 total_encounters      = {total_encounters}")
    print(f"  📊 total_observations    = {total_observations}")
    print(f"  📊 urgent_appointments   = {urgent_appointments}")
    print(f"  📊 total_practitioners   = {total_practitioners}")
    print(f"  📊 average_age           = {average_age}")
    print(f"  📊 top_pathology         = {top_pathology} ({top_pathology_count})")

    # ── Écriture via psycopg2 ──
    import psycopg2
    from datetime import datetime

    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASSWORD
    )
    cur = conn.cursor()

    cur.execute('DROP TABLE IF EXISTS "AnalyticsSummary"')
    cur.execute('''
        CREATE TABLE "AnalyticsSummary" (
            total_patients        INTEGER NOT NULL,
            urgent_appointments   INTEGER NOT NULL,
            total_practitioners   INTEGER NOT NULL,
            average_age           DOUBLE PRECISION NOT NULL,
            total_fhir_resources  INTEGER NOT NULL,
            total_conditions      INTEGER NOT NULL,
            total_encounters      INTEGER NOT NULL,
            total_observations    INTEGER NOT NULL,
            top_pathology         TEXT,
            top_pathology_count   INTEGER,
            computed_at           TIMESTAMP NOT NULL
        )
    ''')

    cur.execute(
        'INSERT INTO "AnalyticsSummary" VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
        (
            total_patients, urgent_appointments, total_practitioners,
            average_age, fhir_total, total_conditions, total_encounters,
            total_observations, top_pathology, top_pathology_count,
            datetime.utcnow()
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    print("\n  ✅ Table \"AnalyticsSummary\" enrichie écrite dans PostgreSQL !\n")


# ═══════════════════════════════════════════════════════════
# Point d'entrée
# ═══════════════════════════════════════════════════════════
if __name__ == "__main__":
    spark = create_spark_session()

    try:
        # Analyse 1 : Patients (relationnel)
        patients_df = analyze_patients(spark)

        # Analyse 2 : Pathologies (FHIR JSONB) — LE BIG DATA
        analyze_conditions(spark, patients_df)

        # Analyse 3 : Consultations (FHIR JSONB)
        analyze_encounters(spark)

        # Analyse 4 : Constantes vitales (FHIR JSONB)
        analyze_observations(spark)

        # Écriture du résumé enrichi
        write_analytics_summary(spark)

        print("═══════════════════════════════════════════════════")
        print("  ✅ ANALYSE BIG DATA TERMINÉE AVEC SUCCÈS")
        print("     → 165K+ ressources FHIR analysées via Spark")
        print("═══════════════════════════════════════════════════\n")

    except Exception as e:
        print(f"\n❌ Erreur lors de l'analyse : {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        spark.stop()
        print("🔌 Session Spark fermée.")
     