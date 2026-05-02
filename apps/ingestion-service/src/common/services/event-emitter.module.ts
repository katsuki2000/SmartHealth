import { Module } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventEmitterModule {}
