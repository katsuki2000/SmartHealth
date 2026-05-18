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

  @ApiOperation({ summary: 'Create an appointment' })
  @ApiCreatedResponse({ description: 'Appointment created successfully.' })
  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @ApiOperation({ summary: 'List appointments (filtered by connected doctor)' })
  @ApiOkResponse({ description: 'List of appointments successfully retrieved.' })
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.appointmentService.findAll(user.userId, user.role);
  }

  @ApiOperation({ summary: 'Get an appointment by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an appointment' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @ApiOperation({ summary: 'Delete an appointment' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
