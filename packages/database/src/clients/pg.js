import config from "@vivalence/config";
import pg from "npm:pg";

const pool = new pg.Pool({ connectionString: config.env.get("PRIVATE_BACKUP_DB_URL") });

export default async (query) => {
  const client = await pool.connect();
  let res = {};
  try {
    res = await client.query(query);
  } finally {
    client.release();
  }
  return res.rows;
};
