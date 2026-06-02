import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Smarthealth API is running!';
  }

  async getRecentActivities() {
    const activities: any[] = [];

    // 1. Get latest patient
    const latestPatient = await this.prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (latestPatient) {
      activities.push({
        type: 'PATIENT',
        title: `Nouveau patient enregistré: ${latestPatient.firstName} ${latestPatient.lastName}`,
        time: latestPatient.createdAt.toISOString(),
      });
    }

    // 2. Get latest prescription
    const latestPrescription = await this.prisma.prescription.findFirst({
      orderBy: { issuedAt: 'desc' },
      include: { patient: true },
    });
    if (latestPrescription) {
      activities.push({
        type: 'PRESCRIPTION',
        title: `Prescription créée pour ${latestPrescription.patient.firstName} ${latestPrescription.patient.lastName}`,
        time: latestPrescription.issuedAt.toISOString(),
      });
    }

    // 3. Get latest normal appointment
    const latestAppointment = await this.prisma.appointment.findFirst({
      where: { NOT: { status: 'EMERGENCY' } },
      orderBy: { createdAt: 'desc' },
      include: { patient: true },
    });
    if (latestAppointment) {
      activities.push({
        type: 'APPOINTMENT',
        title: `Consultation planifiée pour ${latestAppointment.patient.firstName} ${latestAppointment.patient.lastName}`,
        time: latestAppointment.createdAt.toISOString(),
      });
    }

    // 4. Get latest emergency appointment (Workflow d'urgence)
    const latestEmergency = await this.prisma.appointment.findFirst({
      where: { status: 'EMERGENCY' },
      orderBy: { createdAt: 'desc' },
      include: { patient: true },
    });
    if (latestEmergency) {
      activities.push({
        type: 'EMERGENCY',
        title: `Workflow d'urgence initié pour ${latestEmergency.patient.firstName} ${latestEmergency.patient.lastName}`,
        time: latestEmergency.createdAt.toISOString(),
      });
    }

    // 5. Get latest analytics computation
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        'SELECT computed_at FROM "AnalyticsSummary" ORDER BY computed_at DESC LIMIT 1',
      );
      if (rows && rows.length > 0) {
        activities.push({
          type: 'ANALYTICS',
          title: `Statistiques cliniques (PySpark) recalculées`,
          time: new Date(rows[0].computed_at).toISOString(),
        });
      }
    } catch (e) {
      // Ignore table not found or empty
    }

    // Sort all by time descending and take top 5
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }
}
