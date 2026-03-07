import { crypto } from "@std/crypto";
import { encodeHex } from "@std/hex";

export function string(input: string) {
  const messageBuffer = new TextEncoder().encode(input);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}

const safeStringify = (val) => {
  const seen = new WeakSet();
  return JSON.stringify(val, (_, v) => {
    if (typeof v === "object" && v !== null) {
      if (seen.has(v)) return undefined;
      seen.add(v);
    }
    return v;
  });
};

export function object(object) {
  return hashString(
    safeStringify(
      Object.keys(object)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = object[key];
          return sorted;
        }, {}),
    ),
  );
}

export function array(arr) {
  return hashString(safeStringify(arr.sort()));
}
// export function object(object: object) {
//   return string(
//     JSON.stringify(
//       Object.keys(object)
//         .sort()
//         .reduce((sorted, key) => {
//           sorted[key] = object[key];
//           return sorted;
//         }, {}),
//     ),
//   );
// }

// export function array(arr: any[]) {
//   return string(JSON.stringify(arr.sort()));
// }

export default { string, object, array };
