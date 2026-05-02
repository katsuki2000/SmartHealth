import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for ingesting a raw FHIR R4 Patient resource (Synthea-compatible).
 *
 * The ENTIRE body IS the FHIR resource — no wrapper needed.
 * Synthea format: POST /api/v1/fhir/Patient
 * Body: { "resourceType": "Patient", "id": "...", "name": [...], ... }
 */
export class FhirPatientDto {
  @ApiProperty({
    description: 'FHIR R4 resourceType — must be "Patient"',
    example: 'Patient',
  })
  resourceType: string;

  @ApiProperty({
    description: 'FHIR logical ID (from Synthea)',
    example: 'ab12cd34-ef56-7890-abcd-ef1234567890',
    required: false,
  })
  id?: string;

  @ApiProperty({
    description: 'Full FHIR R4 Patient fields (name, gender, birthDate, etc.)',
    example: {
      resourceType: 'Patient',
      id: 'synthea-abc123',
      name: [{ family: 'Rakoto', given: ['Jean'] }],
      gender: 'male',
      birthDate: '1990-01-01',
      address: [{ use: 'home', city: 'Antananarivo', country: 'MG' }],
    },
    additionalProperties: true,
  })
  [key: string]: any;
}
