import { resolve } from "@std/path";
import paladin from "../../../mod.js";

export const cwd = () => Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();

export const pin = (token) =>
  token && (token.includes("/") || token.startsWith(".")) &&
    !token.includes("://") && !token.startsWith("@")
    ? resolve(cwd(), token)
    : token;

export const source = (token) => (paladin.clone.remote(token) ? token : pin(token));
