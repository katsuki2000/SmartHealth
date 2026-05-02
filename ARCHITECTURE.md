# SmartHealth Architecture

This repository holds the entire SmartHealth interoperability platform, organized as a PNPM Monorepo. 
We favor local development without Docker to reduce resource overhead on developer machines.

## 🏗️ Monorepo Structure

```text
SmartHealth/
├── apps/
│   ├── ingestion-service/     # NestJS - Point d'entrée FHIR & Backend Core
│   ├── orchestrator-worker/   # Temporal Worker (Workflows & Activities)
│   ├── analysis-engine/       # Python - Spark / Data Processing
│   └── dashboard-ui/          # React - Microfrontends Shell
├── shared/
│   └── fhir-models/           # Modèles FHIR partagés (TypeScript interfaces/schemas)
├── gateway-config/            # Configuration WSO2 API Manager (Exports, Certs, etc.)
├── scripts/                   # Scripts de lancement (.bat ou .ps1)
└── pnpm-workspace.yaml        # Configuration du Monorepo
```

## 🛠️ Tech Stack & Local Setup

### 1. API Gateway (WSO2 API Manager)
- **Role:** Point d'entrée public unique. Gère le routage, le Rate Limiting, la sécurité (OAuth2/JWT) et l'exposition des APIs vers les applications clientes.
- **Local Setup:** Binaire WSO2 installé nativement sur Windows (nécessite Java). Tourne typiquement sur `localhost:8243` et `localhost:9443`. Il route les requêtes vers le `ingestion-service`.

### 2. Ingestion Service (Backend Core)
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (JSONB for FHIR resources, Relational for core data)
- **ORM:** Prisma
- **Documentation:** Swagger (OpenAPI)
- **Role:** Exposes FHIR standard APIs, validates payloads, and emits events.

### 2. Messaging Layer (RabbitMQ)
- **Role:** Asynchronous communication between the ingestion service, orchestrator, and analysis engine.
- **Local Setup:** Must be installed natively on Windows (e.g., via Chocolatey `choco install rabbitmq`) or as a standalone executable. Runs on `localhost:5672`.

### 3. Orchestration Layer (Temporal)
- **Role:** Manages distributed transactions, long-running processes, and failure retries.
- **Local Setup:** Use the Temporal CLI (`temporal server start-dev`) to run a local cluster in-memory.

### 4. Analysis Engine
- **Framework:** Python, PySpark
- **Role:** Heavy data processing, analytics over patient data stored in Postgres.
- **Local Setup:** Requires Python 3 installed locally, and Java (for Spark).

### 5. Frontend UI
- **Framework:** React
- **Role:** Visual dashboard for providers and admins to view data and orchestrator status.

## 🔄 Data Flow Example
1. `ingestion-service` receives a FHIR `Patient` JSON via `POST /api/v1/fhir/Patient`.
2. It validates and saves the JSON to PostgreSQL using Prisma (`FhirResource` JSONB table).
3. It publishes a `patient.created` event on RabbitMQ.
4. `orchestrator-worker` or `analysis-engine` listens to the event to trigger further workflows or compute analytics.

## 🚀 Running Locally
Because we use a PNPM workspace without Docker:
1. Run `pnpm install` from the root directory to link all apps.
2. Ensure PostgreSQL, RabbitMQ, and Temporal are running natively on your machine.
3. Start the API: `cd apps/ingestion-service && pnpm run start:dev`
