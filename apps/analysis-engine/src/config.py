"""
SmartHealth — PySpark Configuration
Database connection, JDBC properties, and Spark session factory.
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Hadoop binaries (required for Spark on Windows)
HADOOP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "hadoop"))
os.environ["HADOOP_HOME"] = HADOOP_DIR
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

# PostgreSQL connection
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

JDBC_URL = f"jdbc:postgresql://{DB_HOST}:{DB_PORT}/{DB_NAME}"
JDBC_PROPS = {
    "user": DB_USER,
    "password": DB_PASSWORD,
    "driver": "org.postgresql.Driver"
}


def create_spark_session():
    from pyspark.sql import SparkSession

    spark = (
        SparkSession.builder
        .appName("SmartHealth-BigData-Analytics")
        .master("local[*]")
        .config("spark.jars.packages", "org.postgresql:postgresql:42.7.5")
        .config("spark.driver.extraJavaOptions", "-Duser.timezone=UTC")
        .config("spark.sql.session.timeZone", "UTC")
        .config("spark.driver.memory", "2g")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")
    print("Spark session initialized.\n")
    return spark


def read_table(spark, table_name):
    return (
        spark.read.format("jdbc")
        .option("url", JDBC_URL)
        .option("dbtable", table_name)
        .options(**JDBC_PROPS)
        .load()
    )


def load_fhir(spark, resource_type):
    query = f"""(
        SELECT id, "resourceType" as resource_type,
               content::text as content_json,
               "createdAt" as created_at
        FROM fhir_resources
        WHERE "resourceType" = '{resource_type}'
    ) AS fhir_sub"""
    return read_table(spark, query)


def write_jdbc(df, table_name):
    df.write.format("jdbc") \
        .option("url", JDBC_URL) \
        .option("dbtable", f'"{table_name}"') \
        .option("truncate", "true") \
        .options(**JDBC_PROPS) \
        .mode("overwrite").save()
