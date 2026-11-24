import { v } from "../v.js";

export * from "./url.js";
export * as mime from "./mime.js";

export const ID = v.string({ minLength: 1 }).desc("Unique identifier (UUID)").$id("ID");

export const Slug = v.string({ pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", title: "lowercase alphanumeric words joined by single dashes" }).desc("URL-compliant identifier").$id("Slug");

export const ModuleIdentifier = v.string().$id("ModuleIdentifier");

export const JWTToken = v.string({ pattern: "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$" }).desc("JWT token string").$id("JWTToken");

export const Username = v.string({ minLength: 1, maxLength: 64 }).desc("User identifier").$id("Username");

export const Password = v.string({ minLength: 1 }).desc("Password string").$id("Password");
