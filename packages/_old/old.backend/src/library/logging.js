import winston from "winston";
import Transport from "winston-transport";
import pg from "pg";
const { Pool } = pg;

const isDev = process.env.NODE_ENV === "development";

class PostgresTransport extends Transport {
    constructor(opts) {
        super(opts);
        this.pool = new Pool({
            connectionString: process.env.LOGBASE_URL,
        });
    }

    async log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });

        const logEntry = {
            level: info.level || "info",
            type: info.type,
            message: JSON.stringify(info.message),
        };

        try {
            const client = await this.pool.connect();
            const query = "INSERT INTO logs(level, type, message) VALUES($1, $2, $3)";
            await client.query(query, [logEntry.level, logEntry.type, logEntry.message]);
            client.release();
        } catch (err) {
            console.error("Error writing log to PostgreSQL", err);
        }

        callback();
    }
}

const logger = winston.createLogger({
    transports: [new PostgresTransport()],
});

export async function log(type, message, level = "info") {
    // if (type == "anyscale") console.log("logging", type, message);
    // if (isDev && !["resolver", "openai", "anyscale", "getUnits"].includes(type)) console.log("logging", type, message);
    if (isDev && !["openai", "anyscale"].includes(type)) return;
    // console.log("logging", type);
    logger.log({
        level: "info",
        type,
        message,
    });
}
// log('errorType', { error: 'Something went wrong' });
// log("test", { info: "This is a text message" });
