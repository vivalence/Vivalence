import config from "@vivalence/config";
import pg from "pg";

const { Pool } = pg;

let pool;
let client;

export default function createDBClient() {
  if (!client) {
    const {
      SUPABASE_URL,
      DATABASE_URL,
      DATABASE_PORT,
      DATABASE_SCHEMA,
      DATABASE_DB,
      DATABASE_USER,
      DATABASE_PASSWORD,
    } = config.env;

    if (
      !SUPABASE_URL ||
      !DATABASE_URL ||
      !DATABASE_PORT ||
      !DATABASE_DB ||
      !DATABASE_USER ||
      !DATABASE_PASSWORD
    ) {
      throw new Error("Missing database configuration. Please check your .env file.");
    }
    pool = new Pool({
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      host: new URL(SUPABASE_URL).host,
      port: DATABASE_PORT,
      database: DATABASE_DB,
    });

    client = {
      query: async (text, params, callback) => {
        return await pool.query(text, params, callback);
      },
    };
  }

  return client;
}
