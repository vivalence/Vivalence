import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { printSchema, lexicographicSortSchema } from "graphql";

import { builder } from "./core.js";

import "./types.js";
import "./query.js";
import "./mutation.js";

// only run this if env is not production
export const schema = builder.toSchema();

if (process.env.NODE_ENV !== "production") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.resolve(__dirname, "../../../frontend/schema.graphql");
    const schemaAsString = printSchema(lexicographicSortSchema(schema));
    fs.writeFileSync(schemaPath, schemaAsString);
}
