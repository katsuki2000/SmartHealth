"""
SmartHealth - Big Data Analysis Engine
Pathology, Demographics, Encounters and Observations analytics
powered by Apache Spark with native JDBC I/O.
"""

from config import create_spark_session, read_table, load_fhir, write_jdbc

<<<<<<< HEAD
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
=======
>>>>>>> aba39267a1077db36bb3aeb5c5077ea763eaebfe
from pyspark.sql.functions import (
    col, count, round as spark_round, avg, sum as spark_sum,
    min as spark_min, max as spark_max,
    floor, datediff, current_date, when, lit,
    get_json_object, to_timestamp, current_timestamp,
    regexp_replace, desc, row_number,
    unix_timestamp
)
from pyspark.sql.window import Window
<<<<<<< HEAD
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
=======


# ────────────────────────────────────────────────────────────
# ANALYSIS 1 : Patient Demographics (relational table)
# ────────────────────────────────────────────────────────────
def analyze_patients(spark):
    print("=== Analysis 1: Patient Demographics ===\n")
>>>>>>> aba39267a1077db36bb3aeb5c5077ea763eaebfe

    df = read_table(spark, '"Patient"')
    total = df.count()
    print(f"  {total} patients found.\n")

    if total == 0:
        print("  No patients found.\n")
        return df

    df_with_age = df.withColumn(
        "age",
        floor(datediff(current_date(), col("birthDate")) / 365.25).cast("int")
    )

    df_classified = df_with_age.withColumn(
        "age_group",
        when(col("age") < 18, lit("0-17 (Pediatrics)"))
        .when(col("age") < 30, lit("18-29 (Young Adult)"))
        .when(col("age") < 45, lit("30-44 (Adult)"))
        .when(col("age") < 60, lit("45-59 (Senior)"))
        .when(col("age") < 75, lit("60-74 (Elderly)"))
        .otherwise(lit("75+ (Geriatrics)"))
    )

    print("  Distribution by age group:")
    df_classified.groupBy("age_group").agg(
        count("*").alias("patient_count")
    ).orderBy("age_group").show(truncate=False)

    print("  Distribution by gender:")
    df_classified.groupBy("gender").agg(
        count("*").alias("patient_count")
    ).orderBy("gender").show(truncate=False)

    print("  Cross-tabulation age group x gender:")
    df_classified.groupBy("age_group", "gender").agg(
        count("*").alias("patient_count")
    ).orderBy("age_group", "gender").show(truncate=False)

    print("  Global age statistics:")
    df_classified.agg(
        spark_round(avg("age"), 1).alias("avg_age"),
        spark_min("age").alias("min_age"),
        spark_max("age").alias("max_age"),
        count("*").alias("total_patients"),
    ).show(truncate=False)

    return df_classified


# ────────────────────────────────────────────────────────────
# ANALYSIS 2 : Conditions / Pathologies (FHIR JSONB)
# ────────────────────────────────────────────────────────────
def analyze_conditions(spark, patients_df):
    print("=== Analysis 2: Pathologies (FHIR JSONB -> Spark) ===\n")

    raw_df = load_fhir(spark, "Condition")
    total = raw_df.count()
    print(f"  {total} Conditions loaded from JSONB.\n")

    if total == 0:
        print("  No Conditions found.\n")
        return

    conditions_df = raw_df.select(
        col("id"),
        get_json_object("content_json", "$.code.coding[0].display").alias("pathology_name"),
        get_json_object("content_json", "$.code.coding[0].code").alias("snomed_code"),
        get_json_object("content_json", "$.clinicalStatus.coding[0].code").alias("clinical_status"),
        get_json_object("content_json", "$.onsetDateTime").alias("onset_date"),
        get_json_object("content_json", "$.abatementDateTime").alias("abatement_date"),
        get_json_object("content_json", "$.subject.reference").alias("patient_ref"),
    ).withColumn(
        "fhir_patient_id",
        regexp_replace(col("patient_ref"), "urn:uuid:", "")
    )

    conditions_df.cache()

    print("  Top 20 pathologies (SNOMED):")
    conditions_df.groupBy("pathology_name", "snomed_code").agg(
        count("*").alias("case_count")
    ).orderBy(desc("case_count")).limit(20).show(truncate=False)

    print("  Distribution by clinical status:")
    conditions_df.groupBy("clinical_status").agg(
        count("*").alias("condition_count")
    ).orderBy(desc("condition_count")).show(truncate=False)

    fhir_patients = load_fhir(spark, "Patient")
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

    joined = conditions_df.join(
        patients_fhir_df,
        conditions_df["fhir_patient_id"] == patients_fhir_df["fhir_id"],
        "left"
    )

    print("  Top 5 pathologies per age group:")
    w = Window.partitionBy("age_group").orderBy(desc("case_count"))
    top_by_age = (
        joined.groupBy("age_group", "pathology_name")
        .agg(count("*").alias("case_count"))
        .withColumn("rank", row_number().over(w))
        .filter(col("rank") <= 5)
        .drop("rank")
        .orderBy("age_group", desc("case_count"))
    )
    top_by_age.show(50, truncate=False)

    print("  Top 10 pathologies per gender:")
    w2 = Window.partitionBy("gender").orderBy(desc("case_count"))
    (
        joined.groupBy("gender", "pathology_name")
        .agg(count("*").alias("case_count"))
        .withColumn("rank", row_number().over(w2))
        .filter(col("rank") <= 10)
        .drop("rank")
        .orderBy("gender", desc("case_count"))
    ).show(30, truncate=False)

    conditions_df.unpersist()


# ────────────────────────────────────────────────────────────
# ANALYSIS 3 : Encounters / Consultations (FHIR JSONB)
# ────────────────────────────────────────────────────────────
def analyze_encounters(spark):
    print("=== Analysis 3: Encounters (FHIR JSONB) ===\n")

    raw_df = load_fhir(spark, "Encounter")
    total = raw_df.count()
    print(f"  {total} Encounters loaded from JSONB.\n")

    if total == 0:
        print("  No Encounters found.\n")
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

    print("  Distribution by class (AMB/IMP/EMER):")
    encounters_df.groupBy("encounter_class").agg(
        count("*").alias("encounter_count")
    ).orderBy(desc("encounter_count")).show(truncate=False)

    print("  Top 15 encounter types:")
    encounters_df.groupBy("encounter_type").agg(
        count("*").alias("count")
    ).orderBy(desc("count")).limit(15).show(truncate=False)

    print("  Average consultation duration (minutes):")
    with_duration = encounters_df.withColumn(
        "start_ts", to_timestamp("period_start")
    ).withColumn(
        "end_ts", to_timestamp("period_end")
    ).withColumn(
        "duration_min",
        (unix_timestamp("end_ts") - unix_timestamp("start_ts")) / 60
    ).filter(col("duration_min").isNotNull() & (col("duration_min") > 0))

    with_duration.groupBy("encounter_class").agg(
        spark_round(avg("duration_min"), 1).alias("avg_duration_min"),
        spark_min("duration_min").cast("int").alias("min_min"),
        spark_max("duration_min").cast("int").alias("max_min"),
        count("*").alias("count"),
    ).orderBy(desc("count")).show(truncate=False)

    print("  Top 10 healthcare providers:")
    encounters_df.filter(col("provider").isNotNull()).groupBy("provider").agg(
        count("*").alias("visit_count")
    ).orderBy(desc("visit_count")).limit(10).show(truncate=False)

    encounters_df.unpersist()


# ────────────────────────────────────────────────────────────
# ANALYSIS 4 : Observations / Vital Signs (FHIR JSONB)
# ────────────────────────────────────────────────────────────
def analyze_observations(spark):
    print("=== Analysis 4: Observations / Vital Signs ===\n")

    raw_df = load_fhir(spark, "Observation")
    total = raw_df.count()
    print(f"  {total} Observations loaded from JSONB.\n")

    if total == 0:
        print("  No Observations found.\n")
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

    print("  Distribution by category:")
    obs_df.groupBy("category").agg(
        count("*").alias("obs_count")
    ).orderBy(desc("obs_count")).show(truncate=False)

    print("  Top 15 measured observation types:")
    obs_df.groupBy("observation_name", "loinc_code", "unit").agg(
        count("*").alias("count")
    ).orderBy(desc("count")).limit(15).show(truncate=False)

    print("  Vital signs statistics (numeric values):")
    numeric_obs = obs_df.filter(col("value").isNotNull())
    numeric_obs.groupBy("observation_name", "unit").agg(
        count("*").alias("measurement_count"),
        spark_round(avg("value"), 2).alias("avg"),
        spark_round(spark_min("value"), 2).alias("min"),
        spark_round(spark_max("value"), 2).alias("max"),
    ).orderBy(desc("measurement_count")).limit(20).show(truncate=False)

    obs_df.unpersist()


# ────────────────────────────────────────────────────────────
# SUMMARY : Compute analytics summary via Spark, write via psycopg2
# ────────────────────────────────────────────────────────────
def write_analytics_summary(spark):
    print("=== Writing Analytics Summary to PostgreSQL ===\n")

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

    fhir_total = read_table(spark, "(SELECT COUNT(*) as total FROM fhir_resources) AS cnt").collect()[0]["total"]
    total_conditions = read_table(spark, """(SELECT COUNT(*) as total FROM fhir_resources WHERE "resourceType" = 'Condition') AS cnt""").collect()[0]["total"]
    total_encounters = read_table(spark, """(SELECT COUNT(*) as total FROM fhir_resources WHERE "resourceType" = 'Encounter') AS cnt""").collect()[0]["total"]
    total_observations = read_table(spark, """(SELECT COUNT(*) as total FROM fhir_resources WHERE "resourceType" = 'Observation') AS cnt""").collect()[0]["total"]

    top_pathology_df = load_fhir(spark, "Condition")
    top_path_row = (
        top_pathology_df.select(
            get_json_object("content_json", "$.code.coding[0].display").alias("name")
        )
        .groupBy("name").agg(count("*").alias("cnt"))
        .orderBy(desc("cnt")).limit(1).collect()
    )
    top_pathology = top_path_row[0]["name"] if top_path_row else "N/A"
    top_pathology_count = int(top_path_row[0]["cnt"]) if top_path_row else 0

    print(f"  total_patients        = {total_patients}")
    print(f"  total_fhir_resources  = {fhir_total}")
    print(f"  total_conditions      = {total_conditions}")
    print(f"  total_encounters      = {total_encounters}")
    print(f"  total_observations    = {total_observations}")
    print(f"  urgent_appointments   = {urgent_appointments}")
    print(f"  total_practitioners   = {total_practitioners}")
    print(f"  average_age           = {average_age}")
    print(f"  top_pathology         = {top_pathology} ({top_pathology_count})")

    # Write via psycopg2 (reliable single-row insert, avoids Spark JDBC issues on Windows)
    import psycopg2
    from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

    conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
    cur = conn.cursor()
    cur.execute('DELETE FROM "AnalyticsSummary"')
    cur.execute("""
        INSERT INTO "AnalyticsSummary"
        (total_patients, urgent_appointments, total_practitioners, average_age,
         total_fhir_resources, total_conditions, total_encounters, total_observations,
         top_pathology, top_pathology_count, computed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """, (
        total_patients, urgent_appointments, total_practitioners, average_age,
        int(fhir_total), int(total_conditions), int(total_encounters), int(total_observations),
        top_pathology, top_pathology_count,
    ))
    conn.commit()
    cur.close()
    conn.close()

    print("\n  AnalyticsSummary written to PostgreSQL.\n")


# ────────────────────────────────────────────────────────────
# Entry point
# ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    spark = create_spark_session()

    try:
        patients_df = analyze_patients(spark)
        analyze_conditions(spark, patients_df)
        analyze_encounters(spark)
        analyze_observations(spark)
        write_analytics_summary(spark)

        print("=== Big Data Analysis Complete ===\n")

    except Exception as e:
        print(f"\nError during analysis: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        spark.stop()