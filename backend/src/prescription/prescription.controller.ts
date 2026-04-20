import { Controller, Post, Body, Get, Param, Put, Delete, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { UpdatePrescriptionDto } from './update-prescription.dto';

@ApiTags('prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  private readonly logger = new Logger(PrescriptionController.name);

  constructor(private readonly prescriptionService: PrescriptionService) {}

  @EventPattern('appointment_created')
  async handleAppointmentCreated(@Payload() message: any) {
    this.logger.log(`📥 KAFKA EVENT RECEIVED in Prescription Module! Appointment ID: ${message.id}`);
    // Future expansion: Automatically draft a Blank Prescription here!
  }

  @ApiOperation({ summary: 'Créer une ordonnance/prescription' })
  @ApiCreatedResponse({ description: 'La prescription a été créée avec succès.' })
  @Post()
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @ApiOperation({ summary: 'Lister toutes les prescriptions' })
  @ApiOkResponse({ description: 'Liste des prescriptions récupérée.' })
  @Get()
  async findAll() {
    return this.prescriptionService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer une prescription par son ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour une prescription' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, updatePrescriptionDto);
  }

  @ApiOperation({ summary: 'Supprimer une prescription' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prescriptionService.remove(id);
  }
}
