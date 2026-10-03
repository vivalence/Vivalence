import { Vector } from "@vivalence/typology";
import { auth } from "./auth.js";
import { daemons } from "./daemons.js";
import { entities } from "./entities.js";
import { metadata } from "./metadata.js";

export const attachment = new Vector();

attachment.branch("/auth", auth);
attachment.branch("/daemons", daemons);
attachment.branch("/entities", entities);
attachment.branch("/metadata", metadata);
