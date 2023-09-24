import fs from "fs";
import path from "path";
import { printSchema, lexicographicSortSchema } from "graphql";

import { builder } from "./core";

import "./types";
import "./query";
import "./mutation";

export const schema = builder.toSchema();

const schemaPath = path.resolve(__dirname, "../../../frontend/schema.graphql");
const schemaAsString = printSchema(lexicographicSortSchema(schema));
fs.writeFileSync(schemaPath, schemaAsString);
