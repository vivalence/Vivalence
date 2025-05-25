import { crypto } from "@std/crypto";
import { encodeHex } from "@std/hex";

function hashString(string: string) {
  const messageBuffer = new TextEncoder().encode(string);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}
function object(object: object) {
  return hashString(
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

function array(arr: any[]) {
  return hashString(JSON.stringify(arr.sort()));
}

export default { array, object, string: hashString };
