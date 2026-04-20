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
      if (!fhirUrl) return;

      const fhirPatient = {
        resourceType: 'Patient',
        identifier: [{ system: 'urn:uuid:smarthealth', value: patientData.id }],
        name: [
          {
            use: 'official',
            family: patientData.lastName,
            given: [patientData.firstName],
          },
        ],
        gender: patientData.gender,
        birthDate: patientData.birthDate.toISOString().split('T')[0],
      };

      this.logger.log(`Syncing Patient ${patientData.id} to FHIR...`);
      const response = await lastValueFrom(this.httpService.post(`${fhirUrl}/Patient`, fhirPatient));
      this.logger.log(`Patient synced successfully. FHIR ID: ${response.data.id}`);
    } catch (error) {
      this.logger.error(`FHIR Sync Failed: ${error.message}`);
    }
  }

  async syncPractitioner(practitionerData: any) {
    try {
      const fhirUrl = process.env.FHIR_SERVER_URL;
      if (!fhirUrl) return;

      const fhirPractitioner = {
        resourceType: 'Practitioner',
        identifier: [{ system: 'urn:uuid:smarthealth', value: practitionerData.id }],
        name: [
          {
            use: 'official',
            family: practitionerData.lastName,
            given: [practitionerData.firstName],
          },
        ],
        telecom: [] as any[],
      };

      if (practitionerData.email) {
        fhirPractitioner.telecom.push({ system: 'email', value: practitionerData.email });
      }
      if (practitionerData.phone) {
        fhirPractitioner.telecom.push({ system: 'phone', value: practitionerData.phone });
      }

      this.logger.log(`Syncing Practitioner ${practitionerData.id} to FHIR...`);
      const response = await lastValueFrom(this.httpService.post(`${fhirUrl}/Practitioner`, fhirPractitioner));
      this.logger.log(`Practitioner synced successfully. FHIR ID: ${response.data.id}`);
    } catch (error) {
      this.logger.error(`FHIR Sync Failed: ${error.message}`);
    }
  }

  async syncAppointment(appointmentData: any) {
    try {
      const fhirUrl = process.env.FHIR_SERVER_URL;
      if (!fhirUrl) return;

      const fhirAppointment = {
        resourceType: 'Appointment',
        identifier: [{ system: 'urn:uuid:smarthealth', value: appointmentData.id }],
        status: appointmentData.status === 'SCHEDULED' ? 'booked' : 'pending',
        description: appointmentData.reason,
        start: appointmentData.dateTime.toISOString(),
      };

      this.logger.log(`Syncing Appointment ${appointmentData.id} to FHIR...`);
      const response = await lastValueFrom(this.httpService.post(`${fhirUrl}/Appointment`, fhirAppointment));
      this.logger.log(`Appointment synced successfully. FHIR ID: ${response.data.id}`);
    } catch (error) {
      this.logger.error(`FHIR Sync Failed: ${error.message}`);
    }
  }

  async syncPrescription(prescriptionData: any) {
    try {
      const fhirUrl = process.env.FHIR_SERVER_URL;
      if (!fhirUrl) return;

      const fhirMedicationRequest = {
        resourceType: 'MedicationRequest',
        identifier: [{ system: 'urn:uuid:smarthealth', value: prescriptionData.id }],
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          text: prescriptionData.medications
        },
        dosageInstruction: [
          {
            text: prescriptionData.instructions
          }
        ],
        authoredOn: new Date().toISOString()
      };

      this.logger.log(`Syncing Prescription (MedicationRequest) ${prescriptionData.id} to FHIR...`);
      const response = await lastValueFrom(this.httpService.post(`${fhirUrl}/MedicationRequest`, fhirMedicationRequest));
      this.logger.log(`Prescription synced successfully. FHIR ID: ${response.data.id}`);
    } catch (error) {
      this.logger.error(`FHIR Sync Failed: ${error.message}`);
    }
  }
}
