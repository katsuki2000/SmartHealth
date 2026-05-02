import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { FhirService } from '../fhir/fhir.service';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private fhirService: FhirService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async create(data: CreateAppointmentDto) {
    const newAppointment = await this.prisma.appointment.create({
      data,
    });

    // 1. Sync to FHIR Server (External standard)
    this.fhirService.syncAppointment(newAppointment).catch(() => {});

    // 2. Emit Kafka Event for Internal Microservices 
    this.kafkaClient.emit('appointment_created', newAppointment);

    return newAppointment;
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        practitioner: true,
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        practitioner: true,
      },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, data: UpdateAppointmentDto) {
    try {
      return await this.prisma.appointment.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.appointment.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }
}
