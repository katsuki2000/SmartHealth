import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FhirService {
  private readonly logger = new Logger(FhirService.name);

  constructor(private readonly httpService: HttpService) {}

  async syncPatient(patientData: any) {
    try {
      const fhirUrl = process.env.FHIR_SERVER_URL;
      if (!fhirUrl) {
        this.logger.warn('FHIR_SERVER_URL is not set. Synchronization skipped.');
        return;
      }

      const fhirPatient = {
        resourceType: 'Patient',
        name: [
          {
            use: 'official',
            family: patientData.lastName,
            given: [patientData.firstName],
          },
        ],
        gender: patientData.gender, // e.g., 'male', 'female', 'other', 'unknown'
        birthDate: patientData.birthDate.toISOString().split('T')[0],
      };

      this.logger.log(`Syncing Patient ID ${patientData.id} to FHIR...`);
      const response = await lastValueFrom(
        this.httpService.post(`${fhirUrl}/Patient`, fhirPatient)
      );
      this.logger.log(`Patient synced successfully. FHIR ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error(`FHIR Sync Failed: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`FHIR Sync Failed: ${error.message}`);
      }
      // Depending on architecture, you might want to throw or just log.
      // Usually, we just log in event-driven sync to avoid crashing the Postgres transaction.
    }
  }
}
