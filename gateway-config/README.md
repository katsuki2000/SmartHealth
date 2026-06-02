# SmartHealth Gateway Configuration

This directory contains the resources needed to configure and administer the **WSO2 API Gateway** for the SmartHealth platform.

## OpenAPI Specification

The file `smarthealth-openapi.json` contains the full endpoint definitions of the Ingestion Service. You can import it directly into the WSO2 **Publisher** to create or update the API.

## Setup Guide (Local Native)

Follow these steps to reproduce the validated governance configuration.

### 1. API Creation (Publisher)
- **Access:** `https://localhost:9443/publisher` (admin / admin)
- **Action:** `Create API` -> `I Have an OpenAPI Definition` -> Upload `smarthealth-openapi.json`.
- **Backend endpoint:** `http://localhost:3000` (or the URL of your Ingestion Service).

### 2. Exposed Resources
Only the critical resources consumed by the Dashboard are exposed to limit the attack surface:
- `GET /api/v1/analytics/summary` : PySpark global statistics.
- `GET /api/v1/analytics/charts` : Chart data (JSONB).
- `POST /api/v1/orchestrator/emergency` : Temporal workflow trigger.

### 3. Security & CORS
For the React Dashboard to communicate with the Gateway:
1. Go to **API Configurations** -> **Runtime**.
2. Enable **CORS Configuration**.
3. Ensure that origins `http://localhost:5000` and `http://localhost:5001` are allowed. **Do not use `*`.**
4. **Important:** In the **Security** section, ensure `OAuth2` is checked.

### 4. Deployment & Publication
1. Go to **Deployments** -> **Deploy New Revision**.
2. Go to **Lifecycle** -> **Publish**.

### 5. Consumption (DevPortal)
- **Access:** `https://localhost:9443/devportal`
- **Application:** Create an application (e.g. `HopitalCentralApp`).
- **Subscription:** Subscribe to `SmartHealth-API`.
- **Keys:** Generate `Production Keys` and retrieve your **Access Token**.

## Governance: Recommended Scopes
For enhanced API governance, WSO2 scopes can be defined to enforce role-based access at the gateway level:
- `read:analytics` -> Restricted to the `ADMIN` role.
- `write:emergency` -> Restricted to `DOCTOR` and `ADMIN` roles.

These scopes are configured in the **Resources** section of the Publisher by associating a role (e.g. `Internal/subscriber`) to an operation. This provides a **dual security layer**: WSO2 controls gateway-level access while NestJS guards enforce application-level RBAC.
