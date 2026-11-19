import path from 'path';
import fs from 'fs';
import { PGlite } from '@electric-sql/pglite';
import { Pool, PoolClient } from 'pg';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: { query: <R = any>(sql: string, params?: any[]) => Promise<QueryResult<R>> }) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

class PostgresManager implements DbClient {
  private pglite: PGlite | null = null;
  private pool: Pool | null = null;
  private initPromise: Promise<void> | null = null;

  private async getDriver(): Promise<{ type: 'pool'; client: Pool } | { type: 'pglite'; client: PGlite }> {
    if (this.pool) return { type: 'pool', client: this.pool };
    if (this.pglite) return { type: 'pglite', client: this.pglite };

    if (!this.initPromise) {
      this.initPromise = (async () => {
        if (process.env.DATABASE_URL) {
          this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
            idleTimeoutMillis: 30000,
          });
        } else {
          const pgDir = process.env.PGLITE_DIR || path.join(process.cwd(), '.data/pgdata');
          if (!fs.existsSync(pgDir)) {
            fs.mkdirSync(pgDir, { recursive: true });
          }
          this.pglite = new PGlite(pgDir);
        }
      })();
    }

    await this.initPromise;
    if (this.pool) return { type: 'pool', client: this.pool };
    return { type: 'pglite', client: this.pglite! };
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const driver = await this.getDriver();
    if (driver.type === 'pool') {
      const res = await driver.client.query(sql, params);
      return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
    } else {
      const res = await driver.client.query(sql, params);
      return { rows: res.rows as T[], rowCount: res.rows.length };
    }
  }

  async exec(sql: string): Promise<void> {
    const driver = await this.getDriver();
    if (driver.type === 'pool') {
      await driver.client.query(sql);
    } else {
      await driver.client.exec(sql);
    }
  }

  async transaction<T>(
    fn: (tx: { query: <R = any>(sql: string, params?: any[]) => Promise<QueryResult<R>> }) => Promise<T>
  ): Promise<T> {
    const driver = await this.getDriver();
    if (driver.type === 'pool') {
      const client: PoolClient = await driver.client.connect();
      try {
        await client.query('BEGIN');
        const txWrapper = {
          query: async <R = any>(sql: string, params?: any[]): Promise<QueryResult<R>> => {
            const res = await client.query(sql, params);
            return { rows: res.rows as R[], rowCount: res.rowCount ?? res.rows.length };
          },
        };
        const result = await fn(txWrapper);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      return await driver.client.transaction(async (tx) => {
        const txWrapper = {
          query: async <R = any>(sql: string, params?: any[]): Promise<QueryResult<R>> => {
            const res = await tx.query(sql, params);
            return { rows: res.rows as R[], rowCount: res.rows.length };
          },
        };
        return await fn(txWrapper);
      });
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    if (this.pglite) {
      await this.pglite.close();
      this.pglite = null;
    }
    this.initPromise = null;
  }
}

// Global Singleton for the Next.js runtime
declare global {
  var __postgresManager: PostgresManager | undefined;
}

export const dbClient: DbClient = global.__postgresManager || (global.__postgresManager = new PostgresManager());
