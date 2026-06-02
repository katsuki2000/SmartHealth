#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
SmartHealth — Génération de Données de Test
═══════════════════════════════════════════════════════════════════
Génère des données fictives pour tester l'analyse PySpark :
- Patients relationnels dans la table Patient
- Ressources FHIR JSONB dans la table fhir_resources
═══════════════════════════════════════════════════════════════════
"""

import os
import psycopg2
import json
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "health_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Données de test
FIRST_NAMES = ["Jean", "Marie", "Pierre", "Sophie", "Michel", "Isabelle", "Philippe", "Nathalie", "François", "Catherine"]
LAST_NAMES = ["Dubois", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Leroy", "Moreau"]
GENDERS = ["male", "female"]
PATHOLOGIES = [
    {"name": "Essential hypertension", "code": "59621000"},
    {"name": "Type 2 diabetes mellitus", "code": "44054006"},
    {"name": "Acute bronchitis", "code": "10509002"},
    {"name": "Acute viral pharyngitis", "code": "195662009"},
    {"name": "Major depression", "code": "370143000"},
    {"name": "Asthma", "code": "195967001"},
    {"name": "Coronary arteriosclerosis", "code": "53741008"},
    {"name": "Chronic kidney disease", "code": "709044004"}
]

def generate_patient_data(num_patients=100):
    """Génère des données de patients fictives."""
    patients = []
    for i in range(num_patients):
        birth_year = random.randint(1940, 2005)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        birth_date = datetime(birth_year, birth_month, birth_day)

        patient = {
            "id": f"patient-{i+1:03d}",
            "firstName": random.choice(FIRST_NAMES),
            "lastName": random.choice(LAST_NAMES),
            "gender": random.choice(GENDERS),
            "birthDate": birth_date.date(),
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        patients.append(patient)
    return patients

def generate_fhir_resources(patients):
    """Génère des ressources FHIR JSONB pour chaque patient."""
    resources = []
    resource_id = 1

    for patient in patients:
        # Ressource Patient FHIR
        patient_fhir = {
            "resourceType": "Patient",
            "id": patient["id"],
            "gender": patient["gender"],
            "birthDate": patient["birthDate"].isoformat(),
            "name": [{
                "given": [patient["firstName"]],
                "family": patient["lastName"]
            }]
        }

        resources.append({
            "id": resource_id,
            "resourceType": "Patient",
            "content": patient_fhir,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        })
        resource_id += 1

        # Générer 1-3 conditions par patient
        num_conditions = random.randint(1, 3)
        for _ in range(num_conditions):
            pathology = random.choice(PATHOLOGIES)
            condition_fhir = {
                "resourceType": "Condition",
                "id": f"condition-{resource_id}",
                "code": {
                    "coding": [{
                        "display": pathology["name"],
                        "code": pathology["code"],
                        "system": "http://snomed.info/sct"
                    }]
                },
                "clinicalStatus": {
                    "coding": [{
                        "code": "active",
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical"
                    }]
                },
                "subject": {
                    "reference": f"urn:uuid:{patient['id']}"
                },
                "onsetDateTime": (datetime.now() - timedelta(days=random.randint(30, 365*5))).isoformat()
            }

            resources.append({
                "id": resource_id,
                "resourceType": "Condition",
                "content": condition_fhir,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            })
            resource_id += 1

        # Générer 2-5 encounters par patient
        num_encounters = random.randint(2, 5)
        for _ in range(num_encounters):
            encounter_class = random.choice(["AMB", "IMP", "EMER"])
            encounter_type = random.choice([
                "General examination",
                "Follow-up visit",
                "Emergency visit",
                "Consultation",
                "Check-up"
            ])

            start_time = datetime.now() - timedelta(days=random.randint(1, 365))
            end_time = start_time + timedelta(minutes=random.randint(15, 120))

            encounter_fhir = {
                "resourceType": "Encounter",
                "id": f"encounter-{resource_id}",
                "status": "finished",
                "class": {
                    "code": encounter_class,
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode"
                },
                "type": [{
                    "coding": [{
                        "display": encounter_type
                    }]
                }],
                "subject": {
                    "reference": f"urn:uuid:{patient['id']}"
                },
                "period": {
                    "start": start_time.isoformat(),
                    "end": end_time.isoformat()
                },
                "serviceProvider": {
                    "display": f"Hôpital {random.choice(['Central', 'Saint-Joseph', 'Clinique du Parc', 'CHU'])}"
                }
            }

            resources.append({
                "id": resource_id,
                "resourceType": "Encounter",
                "content": encounter_fhir,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            })
            resource_id += 1

        # Générer 5-15 observations par patient
        num_observations = random.randint(5, 15)
        for _ in range(num_observations):
            obs_types = [
                {"name": "Body Weight", "code": "29463-7", "unit": "kg", "value": round(random.uniform(50, 120), 1)},
                {"name": "Body Height", "code": "8302-2", "unit": "cm", "value": round(random.uniform(150, 200), 1)},
                {"name": "Systolic Blood Pressure", "code": "8480-6", "unit": "mmHg", "value": round(random.uniform(90, 180), 0)},
                {"name": "Diastolic Blood Pressure", "code": "8462-4", "unit": "mmHg", "value": round(random.uniform(60, 110), 0)},
                {"name": "Heart rate", "code": "8867-4", "unit": "/min", "value": round(random.uniform(60, 100), 0)},
                {"name": "Body temperature", "code": "8310-5", "unit": "Cel", "value": round(random.uniform(36.0, 38.5), 1)},
                {"name": "Oxygen saturation", "code": "59408-5", "unit": "%", "value": round(random.uniform(95, 100), 1)}
            ]

            obs = random.choice(obs_types)
            observation_fhir = {
                "resourceType": "Observation",
                "id": f"observation-{resource_id}",
                "status": "final",
                "code": {
                    "coding": [{
                        "display": obs["name"],
                        "code": obs["code"],
                        "system": "http://loinc.org"
                    }]
                },
                "category": [{
                    "coding": [{
                        "code": "vital-signs",
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category"
                    }]
                }],
                "subject": {
                    "reference": f"urn:uuid:{patient['id']}"
                },
                "effectiveDateTime": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "valueQuantity": {
                    "value": obs["value"],
                    "unit": obs["unit"],
                    "system": "http://unitsofmeasure.org"
                }
            }

            resources.append({
                "id": resource_id,
                "resourceType": "Observation",
                "content": observation_fhir,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            })
            resource_id += 1

    return resources

def insert_test_data():
    """Insère les données de test dans la base de données."""
    print("═══════════════════════════════════════════════════")
    print("  🧪 SmartHealth — Génération de Données de Test")
    print("═══════════════════════════════════════════════════\n")

    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASSWORD
        )
        cur = conn.cursor()

        # Générer les données
        print("📊 Génération de 100 patients fictifs...")
        patients = generate_patient_data(100)

        print("📄 Génération des ressources FHIR...")
        resources = generate_fhir_resources(patients)

        # Insérer les patients relationnels
        print(f"💾 Insertion de {len(patients)} patients dans la table Patient...")
        for patient in patients:
            cur.execute("""
                INSERT INTO "Patient" ("id", "firstName", "lastName", "gender", "birthDate", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT ("id") DO NOTHING
            """, (
                patient["id"], patient["firstName"], patient["lastName"],
                patient["gender"], patient["birthDate"],
                patient["createdAt"], patient["updatedAt"]
            ))

        # Insérer les ressources FHIR
        print(f"💾 Insertion de {len(resources)} ressources FHIR dans la table fhir_resources...")
        for resource in resources:
            cur.execute("""
                INSERT INTO fhir_resources ("id", "resourceType", "content", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s)
            """, (
                resource["id"], resource["resourceType"],
                json.dumps(resource["content"]),
                resource["createdAt"], resource["updatedAt"]
            ))

        conn.commit()
        cur.close()
        conn.close()

        print("
✅ Données de test générées avec succès !"        print(f"   👥 {len(patients)} patients créés")
        print(f"   📄 {len(resources)} ressources FHIR insérées")
        print("
🎯 Vous pouvez maintenant relancer l'analyse PySpark !"        print("═══════════════════════════════════════════════════\n")

    except Exception as e:
        print(f"❌ Erreur lors de la génération des données : {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    insert_test_data()