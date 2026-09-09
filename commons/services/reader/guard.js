// refuse before any request leaves: scheme, then the literal, then every address the name
// resolves to. the URL a model chose after reading an attacker-controlled page reaches this
// daemon's own network otherwise.
const PRIVATE = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^0\./,
  /^::1$/,
  /^::$/,
  /^f[cd][0-9a-f]{2}:/i,
  /^fe[89ab][0-9a-f]:/i,
  /^::ffff:/i,
];

export const isPrivate = (address) =>
  PRIVATE.some((range) => range.test(address));

// resolve is injected so the guard tests without DNS.
export const guard = async (url, resolve = Deno.resolveDns) => {
  const target = new URL(url);
  const host = target.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const refuse = (why) => {
    throw new Error(`refused: ${why}`);
  };

  if (!/^https?:$/.test(target.protocol)) {
    refuse(`${target.protocol} is not http(s)`);
  }
  if (host === "localhost" || host.endsWith(".local") || isPrivate(host)) {
    refuse(`${host} is not a public address`);
  }

  if (/^[\d.]+$/.test(host) || host.includes(":")) {
    return target;
  }

  const addresses = (
    await Promise.all([
      resolve(host, "A").catch(() => []),
      resolve(host, "AAAA").catch(() => []),
    ])
  ).flat();
  if (!addresses.length) refuse(`${host} does not resolve`);
  if (addresses.some(isPrivate)) {
    refuse(`${host} resolves to a private address`);
  }

  return target;
};
