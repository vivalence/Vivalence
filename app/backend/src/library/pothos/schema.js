import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { printSchema, lexicographicSortSchema } from "graphql";

import builder from "./builder.js";

import "../interface/index.js";
import "../games/index.js";

export const schema = builder.toSchema({});
export default schema;

if (process.env.NODE_ENV !== "production") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.resolve(__dirname, "../../../frontend/schema.graphql");
    const schemaAsString = printSchema(lexicographicSortSchema(schema));
    fs.writeFileSync(schemaPath, schemaAsString);
}
