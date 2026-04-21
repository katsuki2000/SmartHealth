import { Global, Module, Logger } from '@nestjs/common';

const mockKafkaClient = {
  emit: (pattern: string, data: any) => {
    Logger.log(`🤖 MOCK KAFKA INTERCEPT [${pattern}]`, 'KafkaService');
    Logger.log(JSON.stringify(data, null, 2), 'KafkaService');
  },
};

@Global()
@Module({
  providers: [
    {
      provide: 'KAFKA_SERVICE',
      useValue: mockKafkaClient,
    },
  ],
  exports: ['KAFKA_SERVICE'],
})
export class KafkaModule {}
