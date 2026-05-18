import { Controller, Post, Body, Get, Param, Put, Delete, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { UpdatePrescriptionDto } from './update-prescription.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
export class PrescriptionController {
  private readonly logger = new Logger(PrescriptionController.name);

  constructor(private readonly prescriptionService: PrescriptionService) {}

  @EventPattern('appointment_created')
  async handleAppointmentCreated(@Payload() message: any) {
    this.logger.log(`Appointment event received: ${message.id}`);
  }

  @ApiOperation({ summary: 'Create a prescription' })
  @ApiCreatedResponse({ description: 'Prescription created successfully.' })
  @Post()
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @ApiOperation({ summary: 'List prescriptions (filtered by connected doctor)' })
  @ApiOkResponse({ description: 'Liste des prescriptions récupérée.' })
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.prescriptionService.findAll(user.userId, user.role);
  }

  @ApiOperation({ summary: 'Get a prescription by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a prescription' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, updatePrescriptionDto);
  }

  @ApiOperation({ summary: 'Delete a prescription' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prescriptionService.remove(id);
  }
}
