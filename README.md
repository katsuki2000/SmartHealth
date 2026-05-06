# 🏥 SmartHealth — Plateforme d'Interopérabilité et de Gouvernance de Données de Santé

SmartHealth est un projet d'architecture orientée **microservices** conçu pour la **Gouvernance de Données de Santé** à grande échelle. Le système gère l'ingestion massive de données au format standard **FHIR R4**, l'analyse Big Data via **Apache Spark**, l'orchestration de workflows cliniques critiques via **Temporal.io**, et la sécurisation des accès via une **API Gateway WSO2**.

---

## 📑 Table des matières

- [Architecture Globale](#-architecture-globale-et-technologies)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Prérequis](#-prérequis)
  - [Windows](#-windows)
  - [Linux (Ubuntu/Debian)](#-linux-ubuntudebian)
- [Installation pas à pas](#-installation-pas-à-pas)
- [Configuration des fichiers `.env`](#-configuration-des-fichiers-env)
- [Initialisation de la base de données](#-initialisation-de-la-base-de-données)
- [Démarrage des services](#-démarrage-des-services)
- [Configuration de l'API Gateway WSO2 (Optionnel)](#-configuration-de-lapi-gateway-wso2-optionnel)
- [Résolution de problèmes](#-résolution-de-problèmes)

---

## 🏗️ Architecture Globale et Technologies

Le projet est structuré sous forme de **Monorepo** (géré par `pnpm workspaces`) et s'articule autour des briques suivantes :

```
SmartHealth/
├── apps/
│   ├── ingestion-service/    # 🟢 Backend NestJS (API REST + FHIR + RabbitMQ)
│   ├── orchestrator-worker/  # ⚙️  Worker Temporal.io (Workflows distribués)
│   ├── analysis-engine/      # 📊 Moteur PySpark (Big Data Analytics)
│   ├── dashboard-ui/         # 🖥️  Shell React (Micro-Frontend Host)
│   └── patients-mfe/         # 🧩 Micro-Frontend Patients (Module Federation)
├── scripts/                  # 📜 Scripts utilitaires (import Synthea, etc.)
├── shared/                   # 📦 Code partagé entre les apps
├── gateway-config/           # 🔐 Configuration WSO2 API Manager
└── pnpm-workspace.yaml       # ⚡ Configuration du monorepo
```

| Brique | Technologie | Port par défaut | Rôle |
|--------|------------|----------------|------|
| **Ingestion Service** | NestJS + Prisma + PostgreSQL | `3000` | API REST, ingestion FHIR, authentification JWT |
| **Orchestrator Worker** | Temporal.io (TypeScript) | — | Workflows d'admission aux urgences, CronJobs |
| **Analysis Engine** | PySpark + psycopg2 | — | Analyse Big Data sur 165K+ ressources FHIR JSONB |
| **Dashboard UI** | React + Vite | `5000` | Shell principal du dashboard (Module Federation Host) |
| **Patients MFE** | React + Vite | `5001` | Micro-Frontend exposant les composants patients |
| **RabbitMQ** | AMQP | `5672` / `15672` | Bus de messages asynchrone inter-services |
| **Temporal Server** | Go | `7233` | Serveur d'orchestration de workflows |
| **PostgreSQL** | SQL + JSONB | `5432` | Base de données hybride (relationnel + FHIR natif) |
| **WSO2 API Manager** | Java | `8243` / `9443` | API Gateway, OAuth2, Rate Limiting |

---

## 🚀 Fonctionnalités Clés

- **Ingestion Massive** — Pipeline capable d'absorber des milliers de patients générés (via *Synthea*) et de structurer des ressources cliniques massives en JSONB.
- **Dashboard Analytique** — Visualisation des pathologies dominantes (SNOMED CT), répartition par âge/genre, et constantes vitales moyennes via des graphiques SVG 100% natifs.
- **Workflow d'Urgence** — Déclenchement "en 1 clic" d'une admission aux urgences via Temporal, 100% découplé et asynchrone.
- **Gouvernance API** — Toutes les routes consommées par le Dashboard passent par WSO2, sécurisées par des tokens OAuth2.

---

## 🛠️ Prérequis

Avant de commencer, vous devez installer les logiciels suivants sur votre machine.

### 🪟 Windows

#### 1. Node.js (v18+)
Téléchargez et installez depuis [nodejs.org](https://nodejs.org/) (choisissez la version **LTS**).

Vérification :
```powershell
node --version    # doit afficher v18.x.x ou supérieur
npm --version
```

#### 2. pnpm (Gestionnaire de paquets)
```powershell
npm install -g pnpm
pnpm --version    # doit afficher 9.x.x ou supérieur
```

#### 3. Python (3.10+)
Téléchargez depuis [python.org](https://www.python.org/downloads/). **Cochez impérativement « Add Python to PATH »** lors de l'installation.

Vérification :
```powershell
python --version   # doit afficher Python 3.10+ 
pip --version
```

#### 4. Java (JDK 11 ou 17) — Requis pour PySpark et WSO2
Téléchargez l'**OpenJDK** depuis [Adoptium](https://adoptium.net/).

Après installation, configurez la variable d'environnement :
```powershell
# Vérifier que JAVA_HOME est défini
echo $env:JAVA_HOME    # doit afficher le chemin du JDK
java -version
```

> **Astuce :** Si `JAVA_HOME` n'est pas défini, ajoutez-le manuellement :
> 1. Recherchez « Variables d'environnement » dans le menu Démarrer
> 2. Ajoutez `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.x.x` (adaptez le chemin)
> 3. Ajoutez `%JAVA_HOME%\bin` au `PATH`

#### 5. PostgreSQL
Téléchargez depuis [postgresql.org](https://www.postgresql.org/download/windows/). Lors de l'installation :
- **Retenez le mot de passe** que vous choisissez pour l'utilisateur `postgres` (vous en aurez besoin pour les fichiers `.env`)
- Le port par défaut est `5432`

Vérification :
```powershell
psql --version
```

#### 6. RabbitMQ
1. Installez d'abord **Erlang** depuis [erlang.org](https://www.erlang.org/downloads)
2. Puis installez **RabbitMQ** depuis [rabbitmq.com](https://www.rabbitmq.com/install-windows.html)

Vérification (le service démarre automatiquement sur Windows) :
```powershell
rabbitmqctl status
```

> **Conseil :** Activez le plugin de gestion pour avoir un dashboard web sur `http://localhost:15672` :
> ```powershell
> rabbitmq-plugins enable rabbitmq_management
> ```
> Identifiants par défaut : `guest` / `guest`

#### 7. Temporal CLI
```powershell
# Avec Scoop (recommandé)
scoop install temporal-cli

# OU téléchargez depuis : https://github.com/temporalio/cli/releases
```

Vérification :
```powershell
temporal --version
```

#### 8. WSO2 API Manager 4.x (Optionnel — pour la gouvernance API)
1. Téléchargez depuis [wso2.com](https://wso2.com/api-manager/)
2. Dézippez dans un dossier (ex : `C:\wso2\wso2am-4.x.x`)
3. **Nécessite Java 11 ou 17**

---

### 🐧 Linux (Ubuntu/Debian)

#### 1. Node.js (v18+)
```bash
# Via NodeSource (recommandé)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version
npm --version
```

#### 2. pnpm
```bash
npm install -g pnpm
pnpm --version
```

#### 3. Python (3.10+)
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

# Vérification
python3 --version
pip3 --version
```

#### 4. Java (JDK 11 ou 17) — Requis pour PySpark et WSO2
```bash
sudo apt install -y openjdk-17-jdk

# Configurer JAVA_HOME (ajoutez dans ~/.bashrc ou ~/.zshrc)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Appliquer
source ~/.bashrc

# Vérification
java -version
echo $JAVA_HOME
```

#### 5. PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Définir un mot de passe pour l'utilisateur postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'votre_mot_de_passe';"

# Vérification
psql --version
```

#### 6. RabbitMQ
```bash
sudo apt install -y rabbitmq-server

# Démarrer le service
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# Activer le dashboard de management (optionnel)
sudo rabbitmq-plugins enable rabbitmq_management

# Vérification
sudo rabbitmqctl status
```

#### 7. Temporal CLI
```bash
# Via le script d'installation officiel
curl -sSf https://temporal.download/cli.sh | sh

# Ajouter au PATH (ajoutez dans ~/.bashrc ou ~/.zshrc)
export PATH=$HOME/.temporalio/bin:$PATH
source ~/.bashrc

# Vérification
temporal --version
```

#### 8. WSO2 API Manager 4.x (Optionnel)
```bash
# Téléchargez et dézippez
wget https://github.com/wso2/product-apim/releases/download/v4.3.0/wso2am-4.3.0.zip
unzip wso2am-4.3.0.zip -d ~/wso2/

# Vérification
~/wso2/wso2am-4.3.0/bin/api-manager.sh --version
```

---

## 📥 Installation pas à pas

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/SmartHealth.git
cd SmartHealth
```

### Étape 2 — Installer les dépendances Node.js (monorepo entier)

Cette commande installe les dépendances de **toutes** les applications du monorepo :

```bash
pnpm install
```

> **Note :** Si vous rencontrez des erreurs liées à `bcrypt` ou `prisma`, c'est normal — ces paquets nécessitent une compilation native. Assurez-vous d'avoir un compilateur C++ installé (Visual Studio Build Tools sur Windows, `build-essential` sur Linux).

### Étape 3 — Installer les dépendances Python (Analysis Engine)

```bash
cd apps/analysis-engine

# Créer un environnement virtuel (recommandé)
# Windows :
python -m venv venv
.\venv\Scripts\activate

# Linux :
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

Les dépendances Python sont :
- `pyspark` — Moteur Big Data Apache Spark
- `psycopg2-binary` — Driver PostgreSQL pour Python
- `python-dotenv` — Lecture des fichiers `.env`

### Étape 4 — Hadoop winutils (Windows uniquement)

PySpark sur Windows nécessite un binaire `winutils.exe`. Il est déjà inclus dans le dossier `apps/analysis-engine/hadoop/bin/`.

Si le fichier est manquant, téléchargez-le depuis [github.com/steveloughran/winutils](https://github.com/steveloughran/winutils) et placez `winutils.exe` dans `apps/analysis-engine/hadoop/bin/`.

> **Linux/Mac :** Cette étape n'est pas nécessaire.

---

## 🔑 Configuration des fichiers `.env`

> ⚠️ **IMPORTANT :** Les fichiers `.env` contiennent des informations sensibles (mots de passe, clés secrètes). **Ne les partagez jamais** et **ne les committez jamais** sur Git (ils sont déjà dans le `.gitignore`).

Chaque application a son propre fichier `.env`. Des fichiers `.env.example` sont fournis comme modèles. Vous devez **copier** chaque `.env.example` en `.env` et **remplir vos propres valeurs**.

### 1. Ingestion Service (Backend NestJS)

```bash
cd apps/ingestion-service
```

**Windows (PowerShell) :**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS :**
```bash
cp .env.example .env
```

Éditez le fichier `apps/ingestion-service/.env` :

```env
# ─── Base de données PostgreSQL ─────────────────────────
# ⚠️ Remplacez "postgres" et "votre_mot_de_passe" par VOS identifiants
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/health_db?schema=public"

# ─── Authentification JWT ───────────────────────────────
# Générez une clé aléatoire (ex: openssl rand -hex 32)
JWT_SECRET="changez-moi-par-une-cle-secrete-aleatoire"
JWT_EXPIRATION="24h"

# ─── RabbitMQ (Bus de messages) ─────────────────────────
# Port par défaut RabbitMQ = 5672. Adaptez si différent.
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
RABBITMQ_EXCHANGE="smarthealth.events"

# ─── FHIR (Optionnel — Serveur FHIR externe) ───────────
FHIR_SERVER_URL="http://localhost:8080/fhir"
```

**Ce que vous devez changer :**
| Variable | Quoi mettre |
|----------|-------------|
| `DATABASE_URL` | Remplacez `votre_mot_de_passe` par le mot de passe de **votre** PostgreSQL local |
| `JWT_SECRET` | Inventez une longue chaîne aléatoire (ou utilisez `openssl rand -hex 32`) |
| `RABBITMQ_URL` | Si vous avez changé le port ou le mot de passe de RabbitMQ, adaptez ici |

### 2. Analysis Engine (PySpark)

```bash
cd apps/analysis-engine
```

**Windows :**
```powershell
Copy-Item .env.example .env
```

**Linux :**
```bash
cp .env.example .env
```

Éditez le fichier `apps/analysis-engine/.env` :

```env
# ─── Connexion PostgreSQL ────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=health_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
```

**Ce que vous devez changer :**
| Variable | Quoi mettre |
|----------|-------------|
| `DB_PASSWORD` | Le mot de passe de **votre** PostgreSQL local |
| `DB_USER` | Votre utilisateur PostgreSQL (souvent `postgres`) |

> **Important :** Le `DB_NAME` doit être le même que celui dans le `DATABASE_URL` de l'ingestion-service (par défaut : `health_db`).

### 3. Orchestrator Worker (Temporal)

```bash
cd apps/orchestrator-worker
```

**Windows :**
```powershell
Copy-Item .env.example .env
```

**Linux :**
```bash
cp .env.example .env
```

Éditez le fichier `apps/orchestrator-worker/.env` :

```env
# ─── Temporal Server ────────────────────────────────────
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=smarthealth-emergency

# ─── Ingestion Service (Backend NestJS) ─────────────────
INGESTION_SERVICE_URL=http://localhost:3000
```

> **Note :** Ce fichier n'a généralement pas besoin d'être modifié sauf si vous avez changé les ports par défaut.

---

## 🗃️ Initialisation de la base de données

### Étape 1 — Créer la base de données `health_db`

Avant de lancer Prisma, vous devez créer la base de données manuellement :

**Windows (PowerShell) :**
```powershell
# Ouvrir le client PostgreSQL
psql -U postgres

# Dans le shell psql :
CREATE DATABASE health_db;
\q
```

**Linux :**
```bash
sudo -u postgres psql -c "CREATE DATABASE health_db;"
```

### Étape 2 — Appliquer les migrations Prisma

Depuis le dossier `apps/ingestion-service` :

```bash
cd apps/ingestion-service

# Générer le client Prisma
pnpm exec prisma generate

# Appliquer les migrations (crée les tables dans la BDD)
pnpm exec prisma migrate deploy
```

> **Vérification :** Vous pouvez inspecter la base de données via l'interface Prisma Studio :
> ```bash
> pnpm exec prisma studio
> ```
> Cela ouvrira un navigateur sur `http://localhost:5555` pour visualiser vos tables.

### Étape 3 — (Optionnel) Injecter les données de test (Seed)

```bash
cd apps/ingestion-service
pnpm run seed
```

### Étape 4 — (Optionnel) Importer les données Synthea (FHIR massif)

Si vous disposez de fichiers FHIR Bundle générés par [Synthea](https://github.com/synthetichealth/synthea), vous pouvez les importer :

```bash
# Depuis la racine du projet
cd apps/ingestion-service
npx ts-node scripts/import-synthea.ts --dir /chemin/vers/vos/fichiers/synthea/fhir
```

---

## 🚦 Démarrage des services

Pour lancer l'environnement complet en local, vous devez démarrer chaque brique dans un **terminal séparé**. Voici l'ordre recommandé :

### 1. 🐇 RabbitMQ (doit être démarré en premier)

**Windows :** Le service démarre automatiquement. Vérifiez avec :
```powershell
rabbitmqctl status
```

**Linux :**
```bash
sudo systemctl start rabbitmq-server
```

Dashboard de gestion : [http://localhost:15672](http://localhost:15672) (login : `guest` / `guest`)

---

### 2. 🟢 API Backend NestJS — Terminal 1

```bash
cd apps/ingestion-service
pnpm run start:dev
```

L'API sera accessible sur **[http://localhost:3000](http://localhost:3000)**.

Documentation Swagger : **[http://localhost:3000/api](http://localhost:3000/api)**

---

### 3. ⚙️ Temporal Server — Terminal 2

```bash
temporal server start-dev
```

Dashboard Temporal : **[http://localhost:8233](http://localhost:8233)**

---

### 4. ⚙️ Temporal Worker — Terminal 3

```bash
cd apps/orchestrator-worker
pnpm run dev
```

---

### 5. 🧩 Micro-Frontend Patients — Terminal 4

Le MFE doit être **build** puis servi via `preview` pour que Module Federation fonctionne :

```bash
cd apps/patients-mfe
pnpm run build && pnpm run preview
```

Le MFE sera accessible sur **[http://localhost:5001](http://localhost:5001)**

---

### 6. 🖥️ Dashboard UI — Terminal 5

```bash
cd apps/dashboard-ui
pnpm run dev
```

Le dashboard sera accessible sur **[http://localhost:5000](http://localhost:5000)**

---

### 7. 📊 Analyse Big Data PySpark (à la demande)

L'analyse Spark n'est pas un serveur permanent. Lancez-la manuellement quand vous voulez calculer les KPIs :

```bash
cd apps/analysis-engine

# Activez d'abord le virtualenv si ce n'est pas fait
# Windows :
.\venv\Scripts\activate
# Linux :
source venv/bin/activate

# Lancer l'analyse
python src/pathology_by_age.py
```

---

### 8. 🔐 WSO2 API Manager (Optionnel) — Terminal 6

**Windows :**
```powershell
# Depuis le dossier d'installation WSO2
.\bin\api-manager.bat
```

**Linux :**
```bash
~/wso2/wso2am-4.3.0/bin/api-manager.sh
```

> **Premier démarrage :** WSO2 peut prendre 2-3 minutes pour s'initialiser. Attendez le message de confirmation dans la console.

---

## 🔐 Configuration de l'API Gateway WSO2 (Optionnel)

Si vous souhaitez activer la gouvernance API complète :

1. Connectez-vous au **Publisher** : [https://localhost:9443/publisher](https://localhost:9443/publisher)
   - Login par défaut : `admin` / `admin`
2. Créez l'API **SmartHealth-API** pointant vers `http://localhost:3000`
3. Déclarez les ressources :
   - `GET /api/v1/analytics/charts`
   - `GET /api/v1/patients`
   - `POST /api/v1/orchestrator/emergency`
4. Activez la politique **CORS**
5. **Déployez** et **publiez** l'API
6. Via le **DevPortal** ([https://localhost:9443/devportal](https://localhost:9443/devportal)) :
   - Créez une application
   - Souscrivez à l'API SmartHealth
   - Générez vos clés OAuth2 (Consumer Key / Secret)
   - Utilisez le token pour consommer les endpoints sécurisés via le port `8243`

---

## 🧯 Résolution de problèmes

### ❌ `Error: P1001 Can't reach database server`
- PostgreSQL n'est pas démarré ou le mot de passe est incorrect dans votre `.env`
- Vérifiez que la base `health_db` existe bien : `psql -U postgres -l`

### ❌ `MODULE_NOT_FOUND: @prisma/client`
- Exécutez `pnpm exec prisma generate` depuis `apps/ingestion-service`

### ❌ `ECONNREFUSED 127.0.0.1:5672` (RabbitMQ)
- RabbitMQ n'est pas démarré. Lancez le service :
  - **Windows :** Ouvrez « Services » (`services.msc`) et démarrez `RabbitMQ`
  - **Linux :** `sudo systemctl start rabbitmq-server`

### ❌ PySpark : `Could not find or load main class org.apache.spark.launcher.Main`
- `JAVA_HOME` n'est pas défini. Configurez-le (voir la section Prérequis)

### ❌ PySpark Windows : `Error: Could not find winutils.exe`
- Téléchargez `winutils.exe` et placez-le dans `apps/analysis-engine/hadoop/bin/`

### ❌ Temporal : `Connection refused localhost:7233`
- Le serveur Temporal n'est pas démarré. Lancez `temporal server start-dev` dans un terminal séparé

### ❌ Dashboard affiche une page blanche
- Le MFE Patients n'est pas servi. Vérifiez que `apps/patients-mfe` est bien lancé avec `pnpm run build && pnpm run preview` sur le port `5001`

---

## 📋 Résumé rapide des commandes

| Étape | Commande |
|-------|----------|
| Installer les dépendances | `pnpm install` (racine du projet) |
| Installer les deps Python | `pip install -r requirements.txt` (dans `apps/analysis-engine`) |
| Créer la BDD | `psql -U postgres -c "CREATE DATABASE health_db;"` |
| Appliquer les migrations | `pnpm exec prisma generate && pnpm exec prisma migrate deploy` (dans `apps/ingestion-service`) |
| Lancer le Backend | `pnpm run start:dev` (dans `apps/ingestion-service`) |
| Lancer Temporal Server | `temporal server start-dev` |
| Lancer le Worker | `pnpm run dev` (dans `apps/orchestrator-worker`) |
| Build + servir le MFE | `pnpm run build && pnpm run preview` (dans `apps/patients-mfe`) |
| Lancer le Dashboard | `pnpm run dev` (dans `apps/dashboard-ui`) |
| Lancer l'analyse Spark | `python src/pathology_by_age.py` (dans `apps/analysis-engine`) |

---

## 📄 Licence

Ce projet est sous licence **UNLICENSED** (usage privé/académique).
