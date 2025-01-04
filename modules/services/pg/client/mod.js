import config from "@vivalence/config";
import pg from "pg";

const { Pool } = pg;

let pool;
let client;

export default function createDBClient() {
  if (!client) {
    const {
      DATABASE_URL,
      DATABASE_PORT,
      // DATABASE_SCHEMA,
      DATABASE_DB,
      DATABASE_USER,
      DATABASE_PASSWORD,
    } = config.env;

    if (!DATABASE_URL || !DATABASE_PORT || !DATABASE_DB || !DATABASE_USER || !DATABASE_PASSWORD) {
      throw new Error("Missing database configuration. Please check your .env file.");
    }
    pool = new Pool({
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      host: new URL(DATABASE_URL).host,
      port: DATABASE_PORT,
      database: DATABASE_DB,
    });

    client = {
      sql: async (text, params) => {
        console.log("usage of serivces.db is deprecated. Please use services.storage");
        return await pool.query(text, params);
      },
      query: async (text, params) => {
        console.log("usage of serivces.db.query is deprecated. Please use services.db.sql instead");
        return await pool.query(text, params);
      },
    };
  }

  return client;
}
