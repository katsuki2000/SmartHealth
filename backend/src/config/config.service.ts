import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string = '24h';

  @IsString()
  FHIR_SERVER_URL: string = 'http://localhost:3001/fhir';

  @IsString()
  KAFKA_BROKERS: string = 'localhost:9092';

  @IsString()
  KAFKA_CLIENT_ID: string = 'smarthealth-backend';
}

@Injectable()
export class ConfigService {
  private readonly env: EnvironmentVariables;

  constructor() {
    this.env = plainToInstance(EnvironmentVariables, process.env, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(this.env, { skipMissingProperties: false });

    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed:\n${this.formatErrors(errors)}`,
      );
    }
  }

  private formatErrors(errors: any[]): string {
    return errors
      .map((error) => `  - ${error.property}: ${Object.values(error.constraints).join(', ')}`)
      .join('\n');
  }

  get nodeEnv(): string {
    return this.env.NODE_ENV;
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get jwtExpiration(): string {
    return this.env.JWT_EXPIRATION;
  }

  get fhirServerUrl(): string {
    return this.env.FHIR_SERVER_URL;
  }

  get kafkaBrokers(): string {
    return this.env.KAFKA_BROKERS;
  }

  get kafkaClientId(): string {
    return this.env.KAFKA_CLIENT_ID;
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === Environment.Production;
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === Environment.Development;
  }
}
