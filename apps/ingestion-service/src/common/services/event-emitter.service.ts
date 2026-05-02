import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);

  constructor(private readonly rabbitmq: RabbitMQService) {}

  async emitPatientCreated(patientData: any) {
    await this.rabbitmq.publish('patient.created', {
      event: 'patient.created',
      timestamp: new Date().toISOString(),
      data: patientData,
    });
    this.logger.log(`📤 patient.created emitted: ${patientData.id}`);
  }

  async emitPatientUpdated(patientData: any) {
    await this.rabbitmq.publish('patient.updated', {
      event: 'patient.updated',
      timestamp: new Date().toISOString(),
      data: patientData,
    });
    this.logger.log(`📤 patient.updated emitted: ${patientData.id}`);
  }

  async emitAppointmentScheduled(appointmentData: any) {
    await this.rabbitmq.publish('appointment.scheduled', {
      event: 'appointment.scheduled',
      timestamp: new Date().toISOString(),
      data: appointmentData,
    });
    this.logger.log(`📤 appointment.scheduled emitted: ${appointmentData.id}`);
  }

  async emitAppointmentCancelled(appointmentData: any) {
    await this.rabbitmq.publish('appointment.cancelled', {
      event: 'appointment.cancelled',
      timestamp: new Date().toISOString(),
      data: appointmentData,
    });
    this.logger.log(`📤 appointment.cancelled emitted: ${appointmentData.id}`);
  }

  async emitPrescriptionCreated(prescriptionData: any) {
    await this.rabbitmq.publish('prescription.created', {
      event: 'prescription.created',
      timestamp: new Date().toISOString(),
      data: prescriptionData,
    });
    this.logger.log(`📤 prescription.created emitted: ${prescriptionData.id}`);
  }

  async emitFhirResourceCreated(resource: any) {
    const resourceType = resource.resourceType?.toLowerCase();
    await this.rabbitmq.publish(`fhir.${resourceType}.created`, {
      event: `fhir.${resourceType}.created`,
      timestamp: new Date().toISOString(),
      data: resource,
    });
    this.logger.log(
      `📤 fhir.${resource.resourceType}.created emitted: ${resource.id}`,
    );
  }
}
