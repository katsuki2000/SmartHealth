# 🏥 SmartHealth — Plateforme d'Interopérabilité et de Gouvernance de Données

SmartHealth est un projet d'architecture orientée microservices conçu pour la **Gouvernance de Données de Santé** à grande échelle. Le système gère l'ingestion massive de données au format standard **FHIR**, l'analyse Big Data, l'orchestration de workflows cliniques critiques (comme les admissions aux urgences) et la sécurisation des accès via une API Gateway.

---

## 🏗️ Architecture Globale et Technologies

Le projet est structuré sous forme de Monorepo (géré par `pnpm workspaces`) et s'articule autour des piliers suivants :

1. **Ingestion & Backend Core (`apps/ingestion-service`)**
   - **Framework :** NestJS (TypeScript)
   - **Base de Données :** PostgreSQL avec architecture hybride. Les données métiers critiques sont en relationnel, tandis que les dossiers médicaux complexes sont stockés au format brut **JSONB** (conformité FHIR).
   - **ORM :** Prisma

2. **Gouvernance & Sécurité (WSO2 API Manager)**
   - **Rôle :** Point d'entrée unique (API Gateway). Assure l'authentification (OAuth2/JWT), le contrôle d'accès (RBAC) via des Scopes, et la limitation de requêtes (Rate Limiting).

3. **Orchestration de Workflows (`apps/orchestrator-worker`)**
   - **Framework :** Temporal.io
   - **Rôle :** Gère les transactions distribuées et les processus métiers critiques (ex: Workflow d'admission aux urgences avec création de dossier, assignation de médecin, génération de RDV, et notifications) avec des politiques de réessai (*retries*) en cas de panne.

4. **Moteur d'Analyse Big Data (`apps/analysis-engine`)**
   - **Technologie :** Apache Spark (PySpark)
   - **Rôle :** Analyse asynchrone des centaines de milliers de ressources FHIR stockées en JSONB (diagnostics, constantes vitales, etc.) pour en extraire des KPIs et de l'intelligence clinique. Déclenché via un CronJob Temporal.

5. **Frontends (`apps/dashboard-ui` & `apps/patients-mfe`)**
   - **Framework :** React (Vite) avec Module Federation (Micro-Frontends).
   - **Design :** Interface moderne, "Glassmorphism", intégrant des graphiques SVG 100% natifs pour visualiser les données générées par Spark.

6. **Event Bus (RabbitMQ)**
   - Bus de messages asynchrone pour la communication inter-services.

---

## 🚀 Fonctionnalités Clés

- **Ingestion Massive :** Pipeline capable d'absorber des milliers de patients générés (via *Synthea*) et de structurer des ressources cliniques massives.
- **Dashboard Analytique :** Visualisation des pathologies dominantes (SNOMED CT), répartition par âge/genre, et constantes vitales moyennes.
- **Workflow d'Urgence :** Déclenchement "en 1 clic" d'une admission aux urgences via Temporal, 100% découplé et asynchrone.
- **Gouvernance API :** Toutes les routes consommées par le Dashboard passent par le port `8243` de WSO2, sécurisées par des jetons (Tokens).

---

## 🛠️ Prérequis

Assurez-vous d'avoir les éléments suivants installés en local :
- **Node.js** (v18+) et **pnpm**
- **Python** (3.10+) avec `pyspark`
- **PostgreSQL** (en cours d'exécution)
- **RabbitMQ** (en cours d'exécution sur le port 5672)
- **Temporal CLI** (pour démarrer le serveur d'orchestration local)
- **WSO2 API Manager 4.x** (Nécessite Java)

---

## 💻 Installation

1. Clonez le dépôt et installez les dépendances du monorepo :
   ```bash
   pnpm install
   ```

2. Configurez les variables d'environnement (`.env`) pour `ingestion-service` et `analysis-engine` en renseignant l'accès à PostgreSQL.

3. Appliquez les migrations de la base de données :
   ```bash
   cd apps/ingestion-service
   pnpm dlx prisma migrate deploy
   ```

4. *(Optionnel)* Importez les données médicales fictives :
   ```bash
   pnpm run fhir:import:synthea
   ```

---

## 🚦 Démarrage des Services

Pour lancer l'environnement complet en local, il faut démarrer chaque brique métier :

**1. API Backend (NestJS)**
```bash
cd apps/ingestion-service
pnpm run start:dev
```

**2. Serveur Temporal & Worker**
Dans un premier terminal, démarrez le cluster :
```bash
temporal server start-dev
```
Dans un second terminal, lancez le worker :
```bash
cd apps/orchestrator-worker
pnpm run dev
```

**3. API Gateway WSO2**
Ouvrez le dossier de WSO2 et lancez :
```powershell
.\bin\api-manager.bat
```

**4. Interface Utilisateur (Dashboard & MFEs)**
Démarrez les micro-frontends en parallèle :
```bash
cd apps/patients-mfe
pnpm run build && pnpm run preview
```
```bash
cd apps/dashboard-ui
pnpm run dev
```

*(Accédez ensuite au dashboard via `http://localhost:5000`)*

---

## 🔐 Configuration de l'API Gateway (WSO2)

1. Connectez-vous au **Publisher** (`https://localhost:9443/publisher`).
2. Créez l'API **SmartHealth-API** pointant vers l'URL de votre Backend (ex: `http://localhost:3000`).
3. Déclarez les ressources spécifiques (ex: `GET /api/v1/analytics/charts`, `POST /api/v1/orchestrator/emergency`).
4. Activez la politique **CORS**.
5. Déployez et publiez.
6. Via le **DevPortal** (`https://localhost:9443/devportal`), créez une application, souscrivez à l'API et générez vos clés OAuth2 pour consommer les endpoints de manière sécurisée.
