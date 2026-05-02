import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { EventEmitterService } from '../common/services/event-emitter.service';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(data: CreateAppointmentDto) {
    const newAppointment = await this.prisma.appointment.create({
      data,
    });

    this.eventEmitter.emitAppointmentScheduled(newAppointment).catch(() => {});

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
