import { Injectable, Logger } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private client: Client;

  async onModuleInit() {
    try {
      const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
      const connection = await Connection.connect({ address: temporalAddress });
      this.client = new Client({ connection });
      this.logger.log('Connected to Temporal server (Client)');
    } catch (error) {
      this.logger.error('Failed to connect to Temporal server', error);
    }
  }

  async startEmergencyWorkflow(input: any) {
    this.logger.log('Starting emergency admission workflow...');

    if (!this.client) {
      throw new Error('Temporal client is not initialized.');
    }

    try {
      const handle = await this.client.workflow.start('emergencyAdmissionWorkflow', {
        taskQueue: 'smarthealth-emergency',
        workflowId: `emergency-admission-${Date.now()}`,
        args: [input],
      });

      this.logger.log(`Emergency workflow started (ID: ${handle.workflowId})`);

      const result = await handle.result();
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to start workflow: ${error.message}`);
      throw error;
    }
  }
}
