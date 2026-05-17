import { v } from "../v.js";

export const ID = v.string({ minLength: 1 }).desc("Unique identifier (UUID)");

export const Slug = v.string({ pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" }).desc("URL-compliant identifier");

export const JWTToken = v.string({ pattern: "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$" }).desc("JWT token string");

export const Timestamp = v.string({ format: "date-time" }).desc("ISO 8601 timestamp");

export const Username = v.string({ minLength: 1, maxLength: 64 }).desc("User identifier");

export const Password = v.string({ minLength: 1 }).desc("Password string");
