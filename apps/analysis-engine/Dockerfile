FROM python:3.11-slim

# Installation de Java pour Spark
RUN apt-get update && \
    apt-get install -y openjdk-17-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

WORKDIR /app

COPY apps/analysis-engine/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/analysis-engine/ ./

# On attend que la BDD soit prête avant de lancer le script (via docker-compose)
# Par défaut, on lance le script principal
CMD ["python", "src/pathology_by_age.py"]
