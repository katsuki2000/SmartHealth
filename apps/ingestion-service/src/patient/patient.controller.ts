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
  BadRequestException,
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
import { CurrentUser } from '../auth/current-user.decorator';

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
        description: 'The request body is directly the FHIR R4 Patient resource (from hospital, lab, device, etc.).',
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

  @ApiOperation({ summary: 'Create a patient (auto-assigned to the connected doctor if applicable)' })
  @Post()
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: any,
  ) {
    return this.patientService.create(createPatientDto, user.userId, user.role);
  }

  @ApiOperation({ summary: 'List patients (filtered for the connected doctor, except ADMIN)' })
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.patientService.findAll(user.userId, user.role);
  }

  @ApiOperation({ summary: 'Retrieve a patient by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a patient' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: Partial<CreatePatientDto>,
  ) {
    return this.patientService.update(id, updatePatientDto);
  }

  @ApiOperation({ summary: 'Delete a patient' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }

  @ApiOperation({
    summary: 'Retrieve FHIR clinical history for a patient',
    description:
      'Retrieves all FHIR resources (Conditions, Observations, Encounters, MedicationRequests, AllergyIntolerances) ' +
      'associated with a patient by mapping relational data to FHIR R4 JSONB records.',
  })
  @ApiResponse({ status: 200, description: 'Clinical history successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @Get(':id/clinical-history')
  async getClinicalHistory(@Param('id') id: string) {
    return this.patientService.getClinicalHistory(id);
  }

  @ApiOperation({ 
    summary: 'Break The Glass: Emergency access to a patient outside the active roster',
    description: 'Allows a doctor to access a patient record for which they are not the attending physician. Requires a justification.' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Vital emergency following road accident' }
      },
      required: ['reason']
    }
  })
  @Post(':id/emergency-access')
  async emergencyAccess(
    @Param('id') patientId: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    if (!reason) {
      throw new BadRequestException('Emergency justification (reason) is required');
    }
    return this.patientService.emergencyAccess(patientId, user.userId, reason);
  }
}
