# 🔐 SmartHealth Gateway Configuration

Ce dossier contient les ressources nécessaires pour configurer et administrer l'**API Gateway WSO2** pour la plateforme SmartHealth.

## 📄 Spécification OpenAPI

Le fichier `smarthealth-openapi.json` contient la définition complète des endpoints de l'Ingestion Service. Vous pouvez l'importer directement dans le **Publisher** de WSO2 pour créer ou mettre à jour l'API.

## ⚙️ Guide de Configuration (Local Native)

Voici les étapes à suivre pour reproduire la configuration de gouvernance validée pour le projet de Master.

### 1. Création de l'API (Publisher)
- **Accès :** `https://localhost:9443/publisher` (admin / admin)
- **Action :** `Create API` -> `I Have an OpenAPI Definition` -> Upload `smarthealth-openapi.json`.
- **Endpoint de backend :** `http://localhost:3000` (ou l'URL de votre Ingestion Service).

### 2. Ressources Exposées
Nous recommandons de n'exposer que les ressources critiques consommées par le Dashboard pour limiter la surface d'attaque :
- `GET /api/v1/analytics/summary` : Statistiques globales PySpark.
- `GET /api/v1/analytics/charts` : Données des graphiques (JSONB).
- `POST /api/v1/orchestrator/emergency` : Déclenchement du workflow Temporal.

### 3. Sécurité & CORS (Crucial)
Pour que le Dashboard React puisse communiquer avec la Gateway :
1. Allez dans **API Configurations** -> **Runtime**.
2. Activez **CORS Configuration**.
3. Assurez-vous que les origines `http://localhost:5000` et `http://localhost:5001` sont autorisées. **Ne pas utiliser `*`.**
4. **Important :** Dans la section **Security**, assurez-vous que `OAuth2` est coché.

### 4. Déploiement & Publication
1. Allez dans **Deployments** -> **Deploy New Revision**.
2. Allez dans **Lifecycle** -> **Publish**.

### 5. Consommation (DevPortal)
- **Accès :** `https://localhost:9443/devportal`
- **Application :** Créez une application (ex: `HopitalCentralApp`).
- **Subscription :** Souscrivez à `SmartHealth-API`.
- **Keys :** Générez les `Production Keys` et récupérez votre **Access Token**.

## 🛡️ Gouvernance : Scopes recommandés
Pour un projet de Master, il est conseillé de définir des **Scopes** liés aux rôles applicatifs :
- `read:analytics` -> Réservé au rôle `ADMIN`.
- `write:emergency` -> Réservé aux rôles `DOCTOR` et `ADMIN`.

Ces scopes se configurent dans la section **Resources** du Publisher en associant un rôle (ex: `Internal/subscriber`) à une opération.
