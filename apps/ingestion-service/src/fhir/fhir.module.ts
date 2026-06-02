import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FhirService } from './fhir.service';
import { FhirInteropController } from './fhir-interop.controller';
import { FhirInteropService } from './fhir-interop.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventEmitterModule } from '../common/services/event-emitter.module';

@Global()
@Module({
  imports: [HttpModule, PrismaModule, EventEmitterModule],
  controllers: [FhirInteropController],
  providers: [FhirService, FhirInteropService],
  exports: [FhirService, FhirInteropService],
})
export class FhirModule {}
