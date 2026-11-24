import { v } from "../v.js";

export * from "./url.js";
export * as mime from "./mime.js";

export const ID = v.string({ minLength: 1 }).desc("Unique identifier (UUID)").$id("ID");

const PART = "[\\p{L}\\p{N}]+(?:[-_][\\p{L}\\p{N}]+)*";

export const slug = (opts) => v.string({ pattern: `^${PART}(?:\\.${PART})*$`, title: "words of letters and digits joined by - or _, parts joined by dots", ...opts }).desc("URL-compliant identifier").$id("Slug");
export const Slug = slug();

export const ModuleIdentifier = v.string().$id("ModuleIdentifier");
export const Version = v.string().$id("Version");
export const Hash = v.string().$id("Hash");
export const Integrity = v.string().$id("Integrity");

export const Index = v.integer().$id("Index");
export const Bytes = v.integer().$id("Bytes");

export const JWTToken = v.string({ pattern: "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$" }).desc("JWT token string").$id("JWTToken");

export const Username = v.string({ minLength: 1, maxLength: 64 }).desc("User identifier").$id("Username");

export const Password = v.string({ minLength: 1 }).desc("Password string").$id("Password");
