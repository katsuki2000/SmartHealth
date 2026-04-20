import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './patient/patient.module';
import { PractitionerModule } from './practitioner/practitioner.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PrescriptionModule } from './prescription/prescription.module';

@Module({
  imports: [PatientModule, PractitionerModule, PrismaModule, AppointmentModule, PrescriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
