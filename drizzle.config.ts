import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'pulse_app',
    password: process.env.DB_PASSWORD || 'pulse_app_pass',
    database: process.env.DB_NAME || 'pulse_app_db',
    ssl: false,
  },
});
