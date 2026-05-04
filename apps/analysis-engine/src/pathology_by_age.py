"""
SmartHealth — Analysis Engine
═══════════════════════════════════════════════════════════════════
Script PySpark : Analyse des données patients et rendez-vous.

Utilise UNIQUEMENT des fonctions Spark SQL natives (pas de Python UDF)
pour garantir la compatibilité Windows + Python 3.12.

Usage : python src/pathology_by_age.py
═══════════════════════════════════════════════════════════════════
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Fix PySpark Windows — Hadoop winutils
HADOOP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "hadoop"))
os.environ["HADOOP_HOME"] = HADOOP_DIR

# Fix PySpark Windows — Python executable
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

# ─── PySpark (importé après les env vars) ─────────────────
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, count, round as spark_round, avg,
    min as spark_min, max as spark_max,
    floor, datediff, current_date, when, lit
)

# ═══════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "health_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")

JDBC_URL = f"jdbc:postgresql://{DB_HOST}:{DB_PORT}/{DB_NAME}"
POSTGRES_DRIVER = "org.postgresql.Driver"


def create_spark_session() -> SparkSession:
    """Crée une session Spark locale avec le driver PostgreSQL."""
    print("══════════════════════════════════════════════════")
    print("  🔬 SmartHealth — Analysis Engine (PySpark)")
    print("══════════════════════════════════════════════════\n")

    spark = (
        SparkSession.builder
        .appName("SmartHealth-Analytics")
        .master("local[*]")
        .config("spark.jars.packages", "org.postgresql:postgresql:42.7.5")
        .config("spark.driver.extraJavaOptions", "-Duser.timezone=UTC")
        .config("spark.sql.session.timeZone", "UTC")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")
    print("✅ Session Spark créée\n")
    return spark


def read_table(spark: SparkSession, table_name: str):
    """Lit une table PostgreSQL via JDBC."""
    return (
        spark.read
        .format("jdbc")
        .option("url", JDBC_URL)
        .option("dbtable", table_name)
        .option("user", DB_USER)
        .option("password", DB_PASSWORD)
        .option("driver", POSTGRES_DRIVER)
        .load()
    )


def analyze_patients(spark: SparkSession):
    """Analyse des patients — 100% Spark SQL natif (pas de Python UDF)."""
    print("═══════════════════════════════════════════════════")
    print("  📈 ANALYSE 1 : Répartition par âge et genre")
    print("═══════════════════════════════════════════════════\n")

    df = read_table(spark, '"Patient"')
    total = df.count()
    print(f"📊 {total} patients trouvés en base\n")

    if total == 0:
        print("⚠️  Aucun patient trouvé.\n")
        return

    # Calcul de l'âge avec des fonctions Spark SQL natives (pas de UDF Python !)
    df_with_age = df.withColumn(
        "age",
        floor(datediff(current_date(), col("birthDate")) / 365.25).cast("int")
    )

    # Classification par tranche d'âge (pure Spark SQL)
    df_classified = df_with_age.withColumn(
        "age_group",
        when(col("age") < 18, lit("0-17 (Pédiatrie)"))
        .when(col("age") < 30, lit("18-29 (Jeune adulte)"))
        .when(col("age") < 45, lit("30-44 (Adulte)"))
        .when(col("age") < 60, lit("45-59 (Senior)"))
        .when(col("age") < 75, lit("60-74 (3ème âge)"))
        .otherwise(lit("75+ (Gériatrie)"))
    )

    # ── Stat 1 : Par tranche d'âge ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par tranche d'âge                  │")
    print("└─────────────────────────────────────────────────┘")
    (
        df_classified
        .groupBy("age_group")
        .agg(count("*").alias("nb_patients"))
        .orderBy("age_group")
        .show(truncate=False)
    )

    # ── Stat 2 : Par genre ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par genre                          │")
    print("└─────────────────────────────────────────────────┘")
    (
        df_classified
        .groupBy("gender")
        .agg(count("*").alias("nb_patients"))
        .orderBy("gender")
        .show(truncate=False)
    )

    # ── Stat 3 : Croisement âge × genre ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Croisement tranche d'âge × genre               │")
    print("└─────────────────────────────────────────────────┘")
    (
        df_classified
        .groupBy("age_group", "gender")
        .agg(count("*").alias("nb_patients"))
        .orderBy("age_group", "gender")
        .show(truncate=False)
    )

    # ── Stat 4 : Statistiques globales ──
    print("┌─────────────────────────────────────────────────┐")
    print("│  Statistiques d'âge globales                    │")
    print("└─────────────────────────────────────────────────┘")
    (
        df_classified.agg(
            spark_round(avg("age"), 1).alias("age_moyen"),
            spark_min("age").alias("age_min"),
            spark_max("age").alias("age_max"),
            count("*").alias("total_patients"),
        )
        .show(truncate=False)
    )


def analyze_appointments(spark: SparkSession):
    """Analyse des rendez-vous."""
    print("═══════════════════════════════════════════════════")
    print("  📅 ANALYSE 2 : Statistiques des rendez-vous")
    print("═══════════════════════════════════════════════════\n")

    df = read_table(spark, '"Appointment"')
    total = df.count()
    print(f"📊 {total} rendez-vous trouvés\n")

    if total == 0:
        print("⚠️  Aucun rendez-vous trouvé.\n")
        return

    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par statut                         │")
    print("└─────────────────────────────────────────────────┘")
    (
        df
        .groupBy("status")
        .agg(count("*").alias("nb_rdv"))
        .orderBy("status")
        .show(truncate=False)
    )


def analyze_practitioners(spark: SparkSession):
    """Analyse des praticiens."""
    print("═══════════════════════════════════════════════════")
    print("  👨‍⚕️ ANALYSE 3 : Praticiens enregistrés")
    print("═══════════════════════════════════════════════════\n")

    df = read_table(spark, '"Practitioner"')
    total = df.count()
    print(f"📊 {total} praticiens trouvés\n")

    if total == 0:
        print("⚠️  Aucun praticien trouvé.\n")
        return

    print("┌─────────────────────────────────────────────────┐")
    print("│  Répartition par spécialité                     │")
    print("└─────────────────────────────────────────────────┘")
    (
        df
        .groupBy("specialty")
        .agg(count("*").alias("nb_praticiens"))
        .orderBy("specialty")
        .show(truncate=False)
    )


# ═══════════════════════════════════════════════════════════
# Point d'entrée
# ═══════════════════════════════════════════════════════════
if __name__ == "__main__":
    spark = create_spark_session()

    try:
        analyze_patients(spark)
        analyze_appointments(spark)
        analyze_practitioners(spark)

        print("═══════════════════════════════════════════════════")
        print("  ✅ ANALYSE TERMINÉE AVEC SUCCÈS")
        print("═══════════════════════════════════════════════════\n")

    except Exception as e:
        print(f"\n❌ Erreur lors de l'analyse : {e}")
        raise
    finally:
        spark.stop()
        print("🔌 Session Spark fermée.")
