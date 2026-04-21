# SmartHealth Backend

<p align="center">
  <strong>A modern healthcare interoperability platform built with FHIR standards</strong>
</p>

A secure, scalable healthcare backend built with NestJS, featuring FHIR-compliant APIs, advanced authentication, and comprehensive patient/practitioner management.

## ✨ Features

- **FHIR Standards**: Full compliance with FHIR (Fast Healthcare Interoperability Resources) standards
- **RESTful APIs**: Comprehensive REST APIs for patients, practitioners, appointments, and prescriptions
- **JWT Authentication**: Secure JWT-based authentication with role-based access control
- **Kafka Integration**: Event-driven architecture for real-time data synchronization
- **PostgreSQL Database**: Robust relational database with Prisma ORM
- **TypeScript**: Fully typed backend for better code quality and maintainability
- **Global Exception Handling**: Centralized error handling and logging
- **Comprehensive Testing**: Unit and e2e tests included

## 🏗️ Architecture Overview

The platform follows a modular microservices architecture:

- **API Gateway**: Central entry point for all requests
- **Authentication Service**: JWT-based auth with role management
- **FHIR Service**: FHIR resource management and standardization
- **Business Services**: Patient, Practitioner, Appointment, Prescription modules
- **Event Bus**: Kafka for inter-service communication
- **Database**: PostgreSQL with Prisma ORM

For detailed architecture documentation, see [ARCHITECTURE.md](../ARCHITECTURE.md)

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (package manager)
- PostgreSQL 12+
- Kafka (for event streaming)

## Description

SmartHealth is a modern healthcare interoperability platform designed to centralize and expose healthcare data via FHIR standards, ensuring secure and standardized data exchange between different healthcare systems.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Update .env with your configuration
# - Database connection
# - JWT secrets
# - Kafka broker details
```

### Environment Setup

Create a `.env` file based on `.env.example`:

### Database Setup

```bash
# Run Prisma migrations
pnpm run prisma:migrate

# (Optional) Seed the database
pnpm run prisma:seed
```

## Development

### Running the Application

```bash
# Development mode (with hot reload)
pnpm run start:dev

# Watch mode
pnpm run start

# Production mode
pnpm run start:prod
```

The API will be available at `http://localhost:3000`

## Testing

```bash
# Unit tests
pnpm run test

# Unit tests in watch mode
pnpm run test:watch

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

## Project Structure

```
src/
├── app.module.ts              # Root module
├── app.service.ts            # Root service
├── main.ts                    # Application entry point
│
├── auth/                      # Authentication & Authorization
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
│
├── patient/                   # Patient management
│   ├── patient.controller.ts
│   ├── patient.service.ts
│   └── create-patient.dto.ts
│
├── practitioner/              # Practitioner management
│   ├── practitioner.controller.ts
│   ├── practitioner.service.ts
│   └── create-practitioner.dto.ts
│
├── appointment/               # Appointment scheduling
│   ├── appointment.controller.ts
│   ├── appointment.service.ts
│   └── create-appointment.dto.ts
│
├── prescription/              # Prescription management
│   ├── prescription.controller.ts
│   ├── prescription.service.ts
│   └── create-prescription.dto.ts
│
├── fhir/                      # FHIR integration
│   ├── fhir.service.ts
│   └── fhir.module.ts
│
├── kafka/                     # Event streaming
│   └── kafka.module.ts
│
├── config/                    # Configuration management
│   ├── config.service.ts
│   └── config.module.ts
│
├── common/                    # Shared utilities
│   ├── filters/              # Exception filters
│   └── middleware/           # Custom middleware
│
└── prisma/                    # Database service
    └── prisma.service.ts
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Patients
- `GET /patients` - List all patients
- `GET /patients/:id` - Get patient details
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Practitioners
- `GET /practitioners` - List all practitioners
- `GET /practitioners/:id` - Get practitioner details
- `POST /practitioners` - Create new practitioner
- `PUT /practitioners/:id` - Update practitioner

### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment

### Prescriptions
- `GET /prescriptions` - List prescriptions
- `POST /prescriptions` - Create prescription
- `PUT /prescriptions/:id` - Update prescription

## Technologies Used

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | NestJS |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT |
| **Event Bus** | Apache Kafka |
| **Testing** | Jest |
| **Package Manager** | pnpm |
| **Standards** | FHIR R4 |

## Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected endpoints with guards
- ✅ Global exception handling
- ✅ Input validation with DTOs
- ✅ Environment variable management
- ✅ Secure password handling

## Database Schema

The database is managed by Prisma ORM. Key models include:

- **User** - Authentication and user management
- **Patient** - Patient information (FHIR-compliant)
- **Practitioner** - Healthcare provider details
- **Appointment** - Medical appointments
- **Prescription** - Medication prescriptions

Run `pnpm run prisma:studio` to explore the database visually.

## Kafka Topics

Events are published to the following Kafka topics:

- `patient-created` - When a patient is registered
- `appointment-scheduled` - When an appointment is booked
- `prescription-issued` - When a prescription is created

## Build

```bash
# Build for production
pnpm run build

# Output directory: dist/
```

## 🎨 Pour les Développeurs Frontend

### Guide d'Intégration

#### 1. **Setup du Backend**

Si vous êtes un développeur frontend, vous devez d'abord setup le backend localement :

```bash
# Cloner le repository
git clone <repo-url>
cd SmartHealth/backend

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env

# Éditer .env avec vos credentials PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/smarthealth

# Exécuter les migrations
pnpm run prisma:migrate

# Lancer le backend en mode développement
pnpm run start:dev

# Le backend sera disponible à http://localhost:3000
```

#### 2. **Vérifier la Connexion**

```bash
# Tester l'endpoint de santé (pas d'authentification requise)
curl http://localhost:3000/health

# Réponse attendue:
# {
#   "status": "ok",
#   "timestamp": "2026-04-21T10:30:00.000Z",
#   "message": "SmartHealth API is running"
# }
```

#### 3. **Créer votre Projet Frontend**

```bash
# React
npx create-react-app ../frontend
cd ../frontend

# OR Vue
npm create vue@latest ../frontend

# OR Angular
ng new ../frontend

# OR Vite
npm create vite@latest ../frontend
```

#### 4. **Configurer la Connexion à l'API**

Créez un fichier `src/services/api.ts` :

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  get: (endpoint: string) => apiClient.request(endpoint),
  post: (endpoint: string, body: any) => 
    apiClient.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) =>
    apiClient.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string) =>
    apiClient.request(endpoint, { method: 'DELETE' })
};
```

#### 5. **Configuration Frontend (.env)**

```env
# .env (frontend)
REACT_APP_API_URL=http://localhost:3000
```

#### 6. **Exemple d'Utilisation**

```typescript
// src/pages/Patients.tsx (React)
import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await apiClient.get('/patients');
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: any) => {
    try {
      const newPatient = await apiClient.post('/patients', patientData);
      setPatients([...patients, newPatient]);
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Patients</h1>
      {patients.map(patient => (
        <div key={patient.id}>
          <h3>{patient.firstName} {patient.lastName}</h3>
          <p>Email: {patient.email}</p>
        </div>
      ))}
    </div>
  );
}
```

#### 7. **Authentification (JWT)**

```typescript
// src/services/auth.ts
export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', response.access_token);
    return response;
  },

  async register(userData: any) {
    return await apiClient.post('/auth/register', userData);
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
```

#### 8. **Structure Recommandée du Frontend**

```
frontend/
├── src/
│   ├── components/
│   │   ├── PatientForm.tsx
│   │   ├── AppointmentCard.tsx
│   │   └── PrescriptionList.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Patients.tsx
│   │   ├── Appointments.tsx
│   │   └── Prescriptions.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── patient.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
└── package.json
```

#### 9. **Variables d'Environnement (Backend)**

Assurez-vous que `.env.example` est bien configuré (déjà fait) :

- `CORS_ORIGIN` inclut votre port frontend (3000, 4200, 5173, etc.)
- `JWT_SECRET` est défini
- `DATABASE_URL` pointe vers PostgreSQL

#### 10. **Dépannage**

**CORS Error ?**
```
- Vérifiez que CORS_ORIGIN dans .env inclut votre frontend URL
- Assurez-vous que main.ts a enableCors()
```

**Token invalide ?**
```
- Vérifiez que le JWT_SECRET est identique au backend
- Vérifie que le token est bien stocké dans localStorage
```

**API introuvable ?**
```
- Vérifiez que le backend écoute sur http://localhost:3000
- Testez avec curl http://localhost:3000/health
```

### Ressources Utiles

- 📖 [Swagger/OpenAPI](http://localhost:3000/api/docs) - Documentation interactive de l'API
- 🏗️ [Architecture Document](../ARCHITECTURE.md) - Vue d'ensemble du système
- 🔐 [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- 📝 [FHIR Standard](https://www.hl7.org/fhir/)

---

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Documentation

- 📚 [NestJS Documentation](https://docs.nestjs.com)
- 🏥 [FHIR Documentation](https://www.hl7.org/fhir/)
- 📖 [API Documentation](./API.md) (if available)
- 🏗️ [Architecture Document](../ARCHITECTURE.md)

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.
