import { resolve } from "@std/path";
import paladin from "@vivalence/paladin";

export const cwd = () => Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();

export const pin = (token) =>
  token && (token.includes("/") || token.startsWith(".")) &&
    !token.includes("://") && !token.startsWith("@")
    ? resolve(cwd(), token)
    : token;

// an operator's SOURCE spec. a remote is paladin's to classify and must survive verbatim —
// pinning `git@host:path` would resolve it into a cwd path and strip its remoteness.
export const source = (token) => (paladin.clone.remote(token) ? token : pin(token));

// an instance REFERENCE always lands as a path. a bare slug names the ledger's shelf; anything
// with a separator is in the operator's cwd frame. MOUNT MEANS PATH — nothing else may be stored.
export const instance = (token) =>
  token && !token.includes("/") && !token.startsWith(".")
    ? paladin.ledger.instances.shelf(token).absolute
    : pin(token);
