import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiOperation({ summary: 'Créer un rendez-vous' })
  @ApiCreatedResponse({ description: 'Le rendez-vous a été créé avec succès.' })
  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @ApiOperation({ summary: 'Lister les rendez-vous (filtré par médecin connecté)' })
  @ApiOkResponse({ description: 'Liste des rendez-vous récupérée.' })
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.appointmentService.findAll(user.userId, user.role);
  }

  @ApiOperation({ summary: 'Récupérer un rendez-vous par son ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour un rendez-vous' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @ApiOperation({ summary: 'Supprimer un rendez-vous' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
