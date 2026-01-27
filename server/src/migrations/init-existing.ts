#!/usr/bin/env ts-node
/**
 * Initialize migration tracking for existing database
 *
 * This script marks all existing migrations as executed in the schema_migrations table.
 * Use this when setting up migration tracking on an existing database that already has
 * all migrations applied.
 *
 * Usage:
 *   npm run migrate:init-existing
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

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

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 64);
}

function parseMigrationFilename(filename: string): { version: number; name: string } | null {
  const match = filename.match(/^(\d{3})_(.+)\.sql$/);
  if (!match) return null;
  return {
    version: parseInt(match[1], 10),
    name: match[2].replace(/_/g, ' '),
  };
}

async function main() {
  console.log('Initializing migration tracking for existing database...\n');

  try {
    // Create migrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version INTEGER NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64) NOT NULL,
        execution_time_ms INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
    `);

    console.log('Created schema_migrations table');

    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files\n`);

    // Check which migrations are already recorded
    const existingResult = await pool.query('SELECT version FROM schema_migrations');
    const existingVersions = new Set(existingResult.rows.map(r => r.version));

    let recorded = 0;
    let skipped = 0;

    for (const file of files) {
      const parsed = parseMigrationFilename(file);
      if (!parsed) {
        console.log(`  [SKIP] ${file} - invalid filename format`);
        continue;
      }

      if (existingVersions.has(parsed.version)) {
        console.log(`  [EXISTS] ${file}`);
        skipped++;
        continue;
      }

      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      const checksum = calculateChecksum(content);

      await pool.query(
        `INSERT INTO schema_migrations (version, name, checksum, execution_time_ms)
         VALUES ($1, $2, $3, $4)`,
        [parsed.version, parsed.name, checksum, 0]
      );

      console.log(`  [RECORDED] ${file}`);
      recorded++;
    }

    console.log(`\nComplete: ${recorded} recorded, ${skipped} already existed`);
    console.log('\nIMPORTANT: This assumes all migrations have already been applied to the database.');
    console.log('If not, run individual migrations manually first.');

  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
