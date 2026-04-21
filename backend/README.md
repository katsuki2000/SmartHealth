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
