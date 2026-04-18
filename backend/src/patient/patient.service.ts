import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './create-patient.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany();
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(id: string, data: Partial<CreatePatientDto>) {
    try {
      return await this.prisma.patient.update({
        where: { id },
        data: {
          ...data,
          ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        },
      });
    } catch (error) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.patient.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }
}