#!/usr/bin/env ts-node
/**
 * Migration CLI
 *
 * Usage:
 *   npm run migrate          - Run all pending migrations
 *   npm run migrate:status   - Show migration status
 *   npm run migrate:create   - Create a new migration file
 *   npm run migrate:verify   - Verify migration checksums
 */

import { Pool } from 'pg';
import { Migrator } from './migrator';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hars_db',
});

const migrationsDir = path.join(__dirname, '../../db/migrations');
const migrator = new Migrator(pool, migrationsDir);

async function main() {
  const command = process.argv[2] || 'migrate';
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'migrate':
      case 'up':
        console.log('Running migrations...\n');
        const result = await migrator.migrate();
        console.log(`\nMigration complete: ${result.executed} executed, ${result.skipped} skipped`);
        break;

      case 'status':
        await migrator.status();
        break;

      case 'create':
        if (!arg) {
          console.error('Error: Please provide a migration name');
          console.error('Usage: npm run migrate:create "migration name"');
          process.exit(1);
        }
        await migrator.create(arg);
        break;

      case 'verify':
        console.log('Verifying migrations...\n');
        const verification = await migrator.verify();
        if (verification.valid) {
          console.log('All migrations verified successfully');
        } else {
          console.error('Verification failed:');
          verification.issues.forEach(issue => console.error(`  - ${issue}`));
          process.exit(1);
        }
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Available commands: migrate, status, create, verify');
        process.exit(1);
    }
  } catch (error: any) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
