import { crypto } from "@std/crypto";
import { encodeHex } from "@std/hex";

export function string(input: string) {
  const messageBuffer = new TextEncoder().encode(input);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}

export function object(object: object) {
  return string(
    JSON.stringify(
      Object.keys(object)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = object[key];
          return sorted;
        }, {}),
    ),
  );
}

export function array(arr: any[]) {
  return string(JSON.stringify(arr.sort()));
}

export default { string, object, array };
