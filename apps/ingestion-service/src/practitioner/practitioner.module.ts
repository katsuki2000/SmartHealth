import { Module } from '@nestjs/common';
import { PractitionerService } from './practitioner.service';
import { PractitionerController } from './practitioner.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventEmitterModule } from '../common/services/event-emitter.module';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [PractitionerController],
  providers: [PractitionerService],
  exports: [PractitionerService],
})
export class PractitionerModule {}
