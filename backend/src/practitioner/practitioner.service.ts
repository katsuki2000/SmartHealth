import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePractitionerDto } from './create-practitioner.dto';
import { UpdatePractitionerDto } from './update-practitioner.dto';

@Injectable()
export class PractitionerService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePractitionerDto) {
    return this.prisma.practitioner.create({
      data,
    });
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
