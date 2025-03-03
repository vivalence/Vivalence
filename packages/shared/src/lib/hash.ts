import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";

function object(object: object) {
  const message = JSON.stringify(object);
  const messageBuffer = new TextEncoder().encode(message);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}

function array(arr: any[]) {
  const message = JSON.stringify(arr.sort());
  const messageBuffer = new TextEncoder().encode(message);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}

export default { array, object };
