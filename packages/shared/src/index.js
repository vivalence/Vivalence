import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
dotenv.config({ path: join(dirname(__filename), "../.env") });

import fetch from "./fetch";
import nlp from "./nlp";
import llm from "./llm";
import { validate } from "./ajv";

export { fetch, llm, nlp, validate };
