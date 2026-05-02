import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { UpdatePrescriptionDto } from './update-prescription.dto';
import { FhirService } from '../fhir/fhir.service';

@Injectable()
export class PrescriptionService {
  constructor(
    private prisma: PrismaService,
    private fhirService: FhirService,
  ) {}

  async create(data: CreatePrescriptionDto) {
    const newPrescription = await this.prisma.prescription.create({
      data,
    });

    this.fhirService.syncPrescription(newPrescription).catch(() => {});

    return newPrescription;
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
