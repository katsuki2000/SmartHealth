import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './create-patient.dto';

@ApiTags('patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @ApiOperation({ summary: 'Creer un patient' })
  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @ApiOperation({ summary: 'Lister tous les patients' })
  @Get()
  async findAll() {
    return this.patientService.findAll();
  }

  @ApiOperation({ summary: 'Recuperer un patient par son ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre a jour un patient' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: Partial<CreatePatientDto>,
  ) {
    return this.patientService.update(id, updatePatientDto);
  }

  @ApiOperation({ summary: 'Supprimer un patient' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
