import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT = 3000;

  @IsString()
  DB_HOST = 'localhost';

  @IsNumber()
  DB_PORT = 5432;

  @IsString()
  DB_USER = 'pulse_app';

  @IsString()
  DB_PASSWORD = 'pulse_app_pass';

  @IsString()
  DB_NAME = 'pulse_app_db';

  @IsString()
  KEYCLOAK_URL = 'http://localhost:8080';

  @IsString()
  KEYCLOAK_REALM = 'pulse';

  @IsString()
  KEYCLOAK_CLIENT_ID = 'pulse-backend';

  @IsString()
  KEYCLOAK_CLIENT_SECRET = 'change_me_client_secret';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      ...config,
      PORT: config.PORT ? Number(config.PORT) : undefined,
      DB_PORT: config.DB_PORT ? Number(config.DB_PORT) : undefined,
    },
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
