"use server";

import { PoolClient, Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  database: "guggleweed",
  user: "khoahuynhbach"
});

export default async function withPostgresClient<T>(handler: (client: PoolClient) => T): Promise<T> {
  const client = await pool.connect();
  try {
    return await handler(client);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}