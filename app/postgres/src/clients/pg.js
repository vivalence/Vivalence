import dotenv from "dotenv";
dotenv.config({ path: "/Users/finn/vivalence/code/spanish/app/postgres/.env" });

import { Pool } from "pg";

const { BACKUP_DB_URL } = process.env;

const pool = new Pool({ connectionString: BACKUP_DB_URL });

export const fetchData = async (query) => {
  const client = await pool.connect();
  try {
    const res = await client.query(query);
    return res.rows;
  } finally {
    client.release();
  }
};
