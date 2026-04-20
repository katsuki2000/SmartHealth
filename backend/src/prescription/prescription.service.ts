import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { UpdatePrescriptionDto } from './update-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePrescriptionDto) {
    return this.prisma.prescription.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.prescription.findMany({
      include: {
        patient: true,
        practitioner: true,
        appointment: true,
      },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        practitioner: true,
        appointment: true,
      },
    });
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return prescription;
  }

  async update(id: string, data: UpdatePrescriptionDto) {
    try {
      return await this.prisma.prescription.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.prescription.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
  }
}
