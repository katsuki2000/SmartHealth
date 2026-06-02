#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
SmartHealth — Affichage des Résultats d'Analyse Big Data
═══════════════════════════════════════════════════════════════════
Affiche les métriques calculées par PySpark depuis la table AnalyticsSummary
═══════════════════════════════════════════════════════════════════
"""

import os
import psycopg2
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "health_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")

def display_analytics():
    """Affiche les résultats de l'analyse Big Data."""
    print("═══════════════════════════════════════════════════")
    print("  📊 SmartHealth — Résultats d'Analyse Big Data")
    print("═══════════════════════════════════════════════════\n")

    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASSWORD
        )
        cur = conn.cursor()

        # Récupérer les données d'analyse
        cur.execute('SELECT * FROM "AnalyticsSummary" ORDER BY computed_at DESC LIMIT 1')
        row = cur.fetchone()

        if row:
            (total_patients, urgent_appointments, total_practitioners,
             average_age, total_fhir_resources, total_conditions,
             total_encounters, total_observations, top_pathology,
             top_pathology_count, computed_at) = row

            print("┌─────────────────────────────────────────────────┐")
            print("│  📈 MÉTRIQUES RELATIONNELLES                     │")
            print("└─────────────────────────────────────────────────┘")
            print(f"  👥 Patients totaux         : {total_patients}")
            print(f"  👨‍⚕️  Praticiens totaux      : {total_practitioners}")
            print(f"  🚨 RDV d'urgence           : {urgent_appointments}")
            print(f"  📅 Âge moyen               : {average_age:.1f} ans")
            print()

            print("┌─────────────────────────────────────────────────┐")
            print("│  🗃️  MÉTRIQUES FHIR BIG DATA                     │")
            print("└─────────────────────────────────────────────────┘")
            print(f"  📄 Ressources FHIR totales : {total_fhir_resources:,}")
            print(f"  🦠 Conditions médicales    : {total_conditions:,}")
            print(f"  🏥 Consultations           : {total_encounters:,}")
            print(f"  🩺 Observations            : {total_observations:,}")
            print()

            print("┌─────────────────────────────────────────────────┐")
            print("│  🏆 TOP PATHOLOGIE                              │")
            print("└─────────────────────────────────────────────────┘")
            print(f"  {top_pathology} : {top_pathology_count} cas")
            print()

            print("┌─────────────────────────────────────────────────┐")
            print("│  ⏰ DERNIÈRE MISE À JOUR                         │")
            print("└─────────────────────────────────────────────────┘")
            print(f"  {computed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            print()

        else:
            print("❌ Aucune donnée d'analyse trouvée.")
            print("   Lancez d'abord : python src/pathology_by_age.py")
            return

        # Afficher les données brutes des patients
        print("┌─────────────────────────────────────────────────┐")
        print("│  👥 ÉCHANTILLON DE PATIENTS                     │")
        print("└─────────────────────────────────────────────────┘")
        cur.execute('SELECT "firstName", "lastName", "birthDate", gender FROM "Patient" LIMIT 5')
        patients = cur.fetchall()
        for patient in patients:
            first_name, last_name, birth_date, gender = patient
            print(f"  {first_name} {last_name} ({gender}) - né(e) le {birth_date.date()}")
        print()

        cur.close()
        conn.close()

        print("═══════════════════════════════════════════════════")
        print("  ✅ Analyse Big Data affichée avec succès !")
        print("═══════════════════════════════════════════════════\n")

    except Exception as e:
        print(f"❌ Erreur lors de l'affichage : {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    display_analytics()