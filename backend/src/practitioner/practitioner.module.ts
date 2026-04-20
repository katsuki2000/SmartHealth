import { Module } from '@nestjs/common';
import { PractitionerService } from './practitioner.service';
import { PractitionerController } from './practitioner.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PractitionerController],
  providers: [PractitionerService],
  exports: [PractitionerService],
})
export class PractitionerModule {}
