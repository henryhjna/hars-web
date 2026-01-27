import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface Migration {
  id: number;
  name: string;
  executed_at: Date;
  checksum: string;
}

interface MigrationFile {
  version: number;
  name: string;
  filename: string;
  fullPath: string;
}

export class Migrator {
  private pool: Pool;
  private migrationsDir: string;

  constructor(pool: Pool, migrationsDir?: string) {
    this.pool = pool;
    this.migrationsDir = migrationsDir || path.join(__dirname, '../../db/migrations');
  }

  /**
   * Initialize migrations table if it doesn't exist
   */
  async init(): Promise<void> {
    await this.pool.query(`
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
    console.log('Migration table initialized');
  }

  /**
   * Calculate checksum for migration file content
   */
  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 64);
  }

  /**
   * Parse migration filename to extract version and name
   * Format: XXX_description.sql (e.g., 001_initial_schema.sql)
   */
  private parseMigrationFilename(filename: string): { version: number; name: string } | null {
    const match = filename.match(/^(\d{3})_(.+)\.sql$/);
    if (!match) return null;
    return {
      version: parseInt(match[1], 10),
      name: match[2].replace(/_/g, ' '),
    };
  }

  /**
   * Get all migration files from the migrations directory
   */
  async getPendingMigrations(): Promise<MigrationFile[]> {
    if (!fs.existsSync(this.migrationsDir)) {
      console.log(`Creating migrations directory: ${this.migrationsDir}`);
      fs.mkdirSync(this.migrationsDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const migrations: MigrationFile[] = [];
    for (const file of files) {
      const parsed = this.parseMigrationFilename(file);
      if (parsed) {
        migrations.push({
          version: parsed.version,
          name: parsed.name,
          filename: file,
          fullPath: path.join(this.migrationsDir, file),
        });
      }
    }

    // Get executed migrations
    const result = await this.pool.query('SELECT version FROM schema_migrations ORDER BY version');
    const executedVersions = new Set(result.rows.map(r => r.version));

    // Return only pending migrations
    return migrations.filter(m => !executedVersions.has(m.version));
  }

  /**
   * Get all executed migrations
   */
  async getExecutedMigrations(): Promise<Migration[]> {
    const result = await this.pool.query(
      'SELECT * FROM schema_migrations ORDER BY version'
    );
    return result.rows;
  }

  /**
   * Run a single migration
   */
  async runMigration(migration: MigrationFile): Promise<void> {
    const content = fs.readFileSync(migration.fullPath, 'utf-8');
    const checksum = this.calculateChecksum(content);

    const startTime = Date.now();
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Execute the migration
      await client.query(content);

      // Record the migration
      await client.query(
        `INSERT INTO schema_migrations (version, name, checksum, execution_time_ms)
         VALUES ($1, $2, $3, $4)`,
        [migration.version, migration.name, checksum, Date.now() - startTime]
      );

      await client.query('COMMIT');
      console.log(`  [OK] ${migration.filename} (${Date.now() - startTime}ms)`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<{ executed: number; skipped: number }> {
    await this.init();

    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log('No pending migrations');
      return { executed: 0, skipped: 0 };
    }

    console.log(`Found ${pending.length} pending migration(s):`);

    let executed = 0;
    for (const migration of pending) {
      try {
        await this.runMigration(migration);
        executed++;
      } catch (error: any) {
        console.error(`  [FAILED] ${migration.filename}`);
        console.error(`  Error: ${error.message}`);
        throw error;
      }
    }

    return { executed, skipped: 0 };
  }

  /**
   * Show migration status
   */
  async status(): Promise<void> {
    await this.init();

    const executed = await this.getExecutedMigrations();
    const pending = await this.getPendingMigrations();

    console.log('\n=== Migration Status ===\n');

    if (executed.length > 0) {
      console.log('Executed migrations:');
      for (const m of executed) {
        const date = new Date(m.executed_at).toISOString().split('T')[0];
        console.log(`  [x] ${String(m.id).padStart(3, '0')}_${m.name.replace(/ /g, '_')}.sql (${date})`);
      }
    }

    if (pending.length > 0) {
      console.log('\nPending migrations:');
      for (const m of pending) {
        console.log(`  [ ] ${m.filename}`);
      }
    }

    if (executed.length === 0 && pending.length === 0) {
      console.log('No migrations found');
    }

    console.log('');
  }

  /**
   * Verify checksums of executed migrations
   */
  async verify(): Promise<{ valid: boolean; issues: string[] }> {
    await this.init();

    const executed = await this.getExecutedMigrations();
    const issues: string[] = [];

    for (const migration of executed) {
      const filename = `${String(migration.id).padStart(3, '0')}_${migration.name.replace(/ /g, '_')}.sql`;
      const fullPath = path.join(this.migrationsDir, filename);

      if (!fs.existsSync(fullPath)) {
        issues.push(`Missing file: ${filename}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const checksum = this.calculateChecksum(content);

      if (checksum !== migration.checksum) {
        issues.push(`Checksum mismatch: ${filename} (file was modified after execution)`);
      }
    }

    return { valid: issues.length === 0, issues };
  }

  /**
   * Create a new migration file
   */
  async create(name: string): Promise<string> {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }

    // Get next version number
    const files = fs.readdirSync(this.migrationsDir).filter(f => f.endsWith('.sql'));
    let maxVersion = 0;
    for (const file of files) {
      const parsed = this.parseMigrationFilename(file);
      if (parsed && parsed.version > maxVersion) {
        maxVersion = parsed.version;
      }
    }

    const version = String(maxVersion + 1).padStart(3, '0');
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const filename = `${version}_${safeName}.sql`;
    const fullPath = path.join(this.migrationsDir, filename);

    const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}
--
-- IMPORTANT:
-- - This migration will be run in a transaction
-- - Test on a backup before running in production
-- - Migrations cannot be reversed automatically

-- Your SQL here

`;

    fs.writeFileSync(fullPath, template);
    console.log(`Created migration: ${filename}`);
    return fullPath;
  }
}
