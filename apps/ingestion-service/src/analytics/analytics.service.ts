import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AnalyticsService
 *
 * Reads pre-computed statistics from the "AnalyticsSummary" table (written by PySpark)
 * and provides real-time metrics via direct PostgreSQL queries.
 *
 * - ADMIN: sees global platform-wide analytics
 * - DOCTOR: sees only analytics scoped to their assigned patients
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAnalyticsSummary() {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        'SELECT * FROM "AnalyticsSummary" ORDER BY computed_at DESC LIMIT 1',
      );

      if (!rows || rows.length === 0) {
        this.logger.warn('Table "AnalyticsSummary" is empty. Run the PySpark script.');
        return {
          totalPatients: 0,
          urgentAppointments: 0,
          totalPractitioners: 0,
          averageAge: 0,
          totalFhirResources: 0,
          totalConditions: 0,
          totalEncounters: 0,
          totalObservations: 0,
          topPathology: null,
          topPathologyCount: 0,
          computedAt: null,
          source: 'analysis-engine (PySpark)',
          status: 'NO_DATA',
        };
      }

      const row = rows[0];
      this.logger.log(`Analytics loaded (computed at ${row.computed_at})`);

      return {
        totalPatients: Number(row.total_patients),
        urgentAppointments: Number(row.urgent_appointments),
        totalPractitioners: Number(row.total_practitioners),
        averageAge: Number(row.average_age),
        totalFhirResources: Number(row.total_fhir_resources || 0),
        totalConditions: Number(row.total_conditions || 0),
        totalEncounters: Number(row.total_encounters || 0),
        totalObservations: Number(row.total_observations || 0),
        topPathology: row.top_pathology || null,
        topPathologyCount: Number(row.top_pathology_count || 0),
        computedAt: row.computed_at,
        source: 'analysis-engine (PySpark)',
        status: 'OK',
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        this.logger.warn('Table "AnalyticsSummary" not found. Run: python src/pathology_by_age.py');
        return {
          totalPatients: 0,
          urgentAppointments: 0,
          totalPractitioners: 0,
          averageAge: 0,
          totalFhirResources: 0,
          totalConditions: 0,
          totalEncounters: 0,
          totalObservations: 0,
          topPathology: null,
          topPathologyCount: 0,
          computedAt: null,
          source: 'analysis-engine (PySpark)',
          status: 'TABLE_NOT_FOUND',
          message: 'Run the PySpark script to generate analytics.',
        };
      }
      throw error;
    }
  }

  /**
   * Chart data extracted from FHIR JSONB.
   * Returns distributions for frontend charts.
   */
  async getChartsData() {
    try {
      // Gender distribution
      const genderDist: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT gender, COUNT(*)::int as count
        FROM "Patient"
        GROUP BY gender ORDER BY count DESC
      `);

      // Age group distribution
      const ageDist: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT
          CASE
            WHEN EXTRACT(YEAR FROM age(NOW(), "birthDate")) < 18 THEN '0-17'
            WHEN EXTRACT(YEAR FROM age(NOW(), "birthDate")) < 30 THEN '18-29'
            WHEN EXTRACT(YEAR FROM age(NOW(), "birthDate")) < 45 THEN '30-44'
            WHEN EXTRACT(YEAR FROM age(NOW(), "birthDate")) < 60 THEN '45-59'
            WHEN EXTRACT(YEAR FROM age(NOW(), "birthDate")) < 75 THEN '60-74'
            ELSE '75+'
          END as age_group,
          COUNT(*)::int as count
        FROM "Patient"
        GROUP BY age_group ORDER BY age_group
      `);

      // Top 10 pathologies (from FHIR JSONB)
      const topConditions: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT
          content->>'resourceType' as resource_type,
          content->'code'->'coding'->0->>'display' as name,
          COUNT(*)::int as count
        FROM fhir_resources
        WHERE "resourceType" = 'Condition'
          AND content->'code'->'coding'->0->>'display' IS NOT NULL
        GROUP BY resource_type, name
        ORDER BY count DESC
        LIMIT 10
      `);

      // FHIR resource type distribution
      const resourceDist: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT "resourceType" as resource_type, COUNT(*)::int as count
        FROM fhir_resources
        GROUP BY "resourceType"
        ORDER BY count DESC
        LIMIT 10
      `);

      // Encounter class distribution
      const encounterClasses: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT
          content->'class'->>'code' as class_code,
          COUNT(*)::int as count
        FROM fhir_resources
        WHERE "resourceType" = 'Encounter'
        GROUP BY class_code
        ORDER BY count DESC
      `);

      // Top 8 observations (vital signs)
      const topObservations: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT
          content->'code'->'coding'->0->>'display' as name,
          COUNT(*)::int as count,
          ROUND(AVG((content->'valueQuantity'->>'value')::numeric), 2) as avg_value,
          content->'valueQuantity'->>'unit' as unit
        FROM fhir_resources
        WHERE "resourceType" = 'Observation'
          AND content->'valueQuantity'->>'value' IS NOT NULL
        GROUP BY name, unit
        ORDER BY count DESC
        LIMIT 8
      `);

      return {
        genderDistribution: genderDist,
        ageDistribution: ageDist,
        topConditions: topConditions.map(c => ({ name: c.name, count: c.count })),
        resourceDistribution: resourceDist.map(r => ({ name: r.resource_type, count: r.count })),
        encounterClasses: encounterClasses.map(e => ({ name: e.class_code, count: e.count })),
        topObservations: topObservations.map(o => ({
          name: o.name,
          count: o.count,
          avgValue: Number(o.avg_value),
          unit: o.unit,
        })),
        source: 'FHIR JSONB (PostgreSQL)',
        status: 'OK',
      };
    } catch (error: any) {
      this.logger.error(`Charts data error: ${error.message}`);
      return { status: 'ERROR', message: error.message };
    }
  }

  /**
   * Real-time statistics via direct relational queries.
   * Unlike getAnalyticsSummary() which reads PySpark cache,
   * this computes metrics on the fly.
   *
   * Supports role-based scoping:
   * - ADMIN: global stats across all patients
   * - DOCTOR: stats scoped to their assigned patients only
   */
  async getLiveStats(userId?: string, role?: string) {
    if (role === 'DOCTOR' && userId) {
      return this.getDoctorLiveStats(userId);
    }

    const [totalPatients, urgentAppointments, totalPractitioners, avgAgeResult] =
      await Promise.all([
        this.prisma.patient.count(),
        this.prisma.appointment.count({ where: { status: 'EMERGENCY' } }),
        this.prisma.practitioner.count(),
        this.prisma.$queryRawUnsafe(
          `SELECT COALESCE(AVG(EXTRACT(YEAR FROM age(NOW(), "birthDate"))), 0) as avg_age FROM "Patient"`,
        ),
      ]);

    const averageAge = Math.round(Number((avgAgeResult as any[])[0]?.avg_age || 0));

    return {
      totalPatients,
      urgentAppointments,
      totalPractitioners,
      averageAge,
      computedAt: new Date().toISOString(),
      source: 'live (PostgreSQL direct)',
      scope: 'global',
      status: 'OK',
    };
  }

  /**
   * Doctor-scoped live statistics.
   * Returns metrics only for patients assigned to this doctor.
   */
  private async getDoctorLiveStats(userId: string) {
    const [myPatients, myAppointments, avgAgeResult] = await Promise.all([
      this.prisma.patient.count({ where: { practitionerId: userId } }),
      this.prisma.appointment.count({
        where: {
          practitionerId: userId,
          status: 'EMERGENCY',
        },
      }),
      this.prisma.$queryRawUnsafe(
        `SELECT COALESCE(AVG(EXTRACT(YEAR FROM age(NOW(), "birthDate"))), 0) as avg_age
         FROM "Patient" WHERE "practitionerId" = $1`,
        userId,
      ),
    ]);

    const averageAge = Math.round(Number((avgAgeResult as any[])[0]?.avg_age || 0));

    return {
      totalPatients: myPatients,
      urgentAppointments: myAppointments,
      averageAge,
      computedAt: new Date().toISOString(),
      source: 'live (PostgreSQL direct)',
      scope: 'doctor',
      status: 'OK',
    };
  }
}
