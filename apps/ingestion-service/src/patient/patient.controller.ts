import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './create-patient.dto';
import { FhirPatientDto } from './fhir-patient.dto';
import { Public } from '../auth/public.decorator';

// ══════════════════════════════════════════════════════════
// FHIR-Native Controller — routes /fhir/* (PUBLIC — pas de JWT)
// Accessible sans token pour permettre l'ingestion Synthea
// ══════════════════════════════════════════════════════════
@ApiTags('FHIR Resources')
@Public()
@Controller('fhir')
export class FhirPatientController {
  constructor(private readonly patientService: PatientService) {}

  @ApiOperation({
    summary: 'Ingest a FHIR R4 Patient resource',
    description:
      'Accepts any valid FHIR R4 Patient JSON directly (no wrapper). ' +
      'Stores it in the FhirResource JSONB table and publishes a ' +
      '"fhir.patient.created" event on RabbitMQ.',
  })
  @ApiBody({
    type: FhirPatientDto,
    examples: {
      fhir_r4_patient: {
        summary: 'FHIR R4 Patient',
        description: 'Le body EST la ressource FHIR R4 directement (hôpital, labo, appareil médical, etc.).',
        value: {
          resourceType: 'Patient',
          id: 'synthea-abc123',
          name: [{ family: 'Rakoto', given: ['Jean'] }],
          gender: 'male',
          birthDate: '1990-01-01',
          address: [{ use: 'home', city: 'Antananarivo', country: 'MG' }],
          telecom: [{ system: 'phone', value: '+261 20 22 000 00' }],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'FHIR Patient stored + event emitted' })
  @ApiResponse({ status: 400, description: 'Invalid resourceType' })
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
  @HttpCode(HttpStatus.CREATED)
  @Post('Patient')
  async createFhirPatient(@Body() dto: FhirPatientDto) {
    return this.patientService.createFhirPatient(dto);
  }

  @ApiOperation({ summary: 'List all FHIR Patient resources (JSONB)' })
  @ApiResponse({ status: 200, description: 'List of FHIR Patients' })
  @Get('Patient')
  async findAllFhirPatients() {
    return this.patientService.findAllFhirPatients();
  }

  @ApiOperation({ summary: 'Get a FHIR Patient by internal ID' })
  @ApiResponse({ status: 200, description: 'FHIR Patient found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Get('Patient/:id')
  async findFhirPatient(@Param('id') id: string) {
    return this.patientService.findFhirPatient(id);
  }
}

// ══════════════════════════════════════════════════════════
// Relational CRUD Controller — routes /patients/*
// ══════════════════════════════════════════════════════════
@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @ApiOperation({ summary: 'Creer un patient (table relationnelle)' })
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
