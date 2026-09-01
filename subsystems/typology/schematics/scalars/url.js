import { v } from "../v.js";

const PERCENT = "%[0-9A-Fa-f]{2}";
const UNRESERVED = "A-Za-z0-9\\-._~";
const SUBDELIMS = "!$&'()*+,;=";
const PCHAR = `(?:[${UNRESERVED}${SUBDELIMS}:@]|${PERCENT})`;
const SCHEME = "[A-Za-z][A-Za-z0-9+.\\-]*";
const USERINFO = `(?:(?:[${UNRESERVED}${SUBDELIMS}:]|${PERCENT})*@)?`;
const IPLITERAL = `\\[(?:[0-9A-Fa-f:.]+|v[0-9A-Fa-f]+\\.[${UNRESERVED}${SUBDELIMS}:]+)\\]`;
const REGNAME = `(?:[${UNRESERVED}${SUBDELIMS}]|${PERCENT})*`;
const HOST = `(?:${IPLITERAL}|${REGNAME})`;
const PORT = "(?::[0-9]*)?";
const PATH = `(?:/${PCHAR}*)*`;
const QUERY = `(?:\\?(?:${PCHAR}|[/?])*)?`;
const FRAGMENT = `(?:#(?:${PCHAR}|[/?])*)?`;

export const PATTERN = `^${SCHEME}://${USERINFO}${HOST}${PORT}${PATH}${QUERY}${FRAGMENT}$`;

export const url = (opts) =>
  v.string({ pattern: PATTERN, title: "RFC 3986 URI with an authority (scheme://…)", ...opts });
