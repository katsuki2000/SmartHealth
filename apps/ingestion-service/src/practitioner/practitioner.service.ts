import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePractitionerDto } from './create-practitioner.dto';
import { UpdatePractitionerDto } from './update-practitioner.dto';
import { EventEmitterService } from '../common/services/event-emitter.service';

@Injectable()
export class PractitionerService {
  private readonly logger = new Logger(PractitionerService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(data: CreatePractitionerDto) {
    const newPractitioner = await this.prisma.practitioner.create({
      data,
    });

    // Fire-and-forget RabbitMQ event
    this.eventEmitter
      .emitFhirResourceCreated({ id: newPractitioner.id, resourceType: 'Practitioner' })
      .catch(() => {});

    return newPractitioner;
  }

  async findAll() {
    return this.prisma.practitioner.findMany();
  }

  async findOne(id: string) {
    const practitioner = await this.prisma.practitioner.findUnique({
      where: { id },
    });
    if (!practitioner) {
      throw new NotFoundException(`Practitioner with ID ${id} not found`);
    }
    return practitioner;
  }

  async update(id: string, data: UpdatePractitionerDto) {
    try {
      return await this.prisma.practitioner.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Practitioner with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.practitioner.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Practitioner with ID ${id} not found`);
    }
  }
}
