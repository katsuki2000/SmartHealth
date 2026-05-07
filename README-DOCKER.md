# 🐳 Version Dockerisée de SmartHealth

Ce guide explique comment lancer l'intégralité de la plateforme SmartHealth (Backend, Frontends, Base de données, Bus de messages, Orchestrateur) en une seule commande grâce à Docker Compose.

## 🚀 Démarrage Rapide

### 1. Prérequis
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Lancer la plateforme
À la racine du projet, exécutez :

```bash
docker-compose up --build
```

Cette commande va :
1. Construire les images pour chaque service.
2. Lancer **PostgreSQL** (Port 5432)
3. Lancer **RabbitMQ** (Ports 5672, 15672)
4. Lancer **Temporal Server** (Port 7233) et son UI (Port 8233)
5. Lancer l'**Ingestion Service** (Port 3000)
6. Lancer le **Worker Orchestrateur**
7. Lancer le **Patients MFE** (Port 5001)
8. Lancer le **Dashboard UI** (Port 5000)

### 3. Accéder aux services
- **Dashboard Principal** : [http://localhost:5000](http://localhost:5000)
- **API Swagger** : [http://localhost:3000/api](http://localhost:3000/api)
- **RabbitMQ Management** : [http://localhost:15672](http://localhost:15672) (guest/guest)
- **Temporal UI** : [http://localhost:8233](http://localhost:8233)

## 📊 Lancer l'Analyse Big Data (Spark)

L'analyse Spark est configurée comme un service qui ne tourne pas en boucle. Pour déclencher une analyse sur les données présentes en base :

```bash
docker-compose start analysis-engine
```

Vous pouvez suivre les logs avec :
```bash
docker-compose logs -f analysis-engine
```

## ⚙️ Configuration

Les variables d'environnement sont pré-configurées dans le fichier `docker-compose.yml` pour fonctionner de manière autonome dans le réseau Docker.

Si vous avez besoin de modifier des paramètres (ex: secret JWT), éditez directement le bloc `environment` dans `docker-compose.yml`.

## 🛠️ Maintenance

### Arrêter les services
```bash
docker-compose down
```

### Réinitialiser la base de données
```bash
docker-compose down -v
```
*(Attention : cela supprime toutes les données stockées dans le volume Docker)*

### Voir les logs d'un service spécifique
```bash
docker-compose logs -f ingestion-service
```
