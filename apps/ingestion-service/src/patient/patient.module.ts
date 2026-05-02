import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController, FhirPatientController } from './patient.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventEmitterModule } from '../common/services/event-emitter.module';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [PatientController, FhirPatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}