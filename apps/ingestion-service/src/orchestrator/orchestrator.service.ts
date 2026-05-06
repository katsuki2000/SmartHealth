import { Injectable, Logger } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private client: Client;

  async onModuleInit() {
    try {
      const connection = await Connection.connect({ address: 'localhost:7233' });
      this.client = new Client({ connection });
      this.logger.log('✅ Connecté au serveur Temporal (Client)');
    } catch (error) {
      this.logger.error('❌ Erreur de connexion à Temporal', error);
    }
  }

  async startEmergencyWorkflow(input: any) {
    this.logger.log(`🚀 Déclenchement du workflow d'urgence via API...`);
    
    if (!this.client) {
      throw new Error('Le client Temporal n\'est pas initialisé.');
    }

    try {
      const handle = await this.client.workflow.start('emergencyAdmissionWorkflow', {
        taskQueue: 'smarthealth-emergency',
        workflowId: `emergency-admission-${Date.now()}`,
        args: [input],
      });

      this.logger.log(`✅ Workflow d'urgence démarré (ID: ${handle.workflowId})`);

      // Pour la démo, on attend le résultat directement.
      // En production, on renverrait juste l'ID du workflow (202 Accepted)
      // et le frontend ferait du polling ou utiliserait des WebSockets.
      const result = await handle.result();
      
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur de démarrage du workflow : ${error.message}`);
      throw error;
    }
  }
}
