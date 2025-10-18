// TODO: move to surface!
function syncHash(algorithm, data) {
  const crypto = window.crypto || globalThis.crypto;
  if (!crypto || !crypto.subtle) {
    throw new Error("Web Crypto API not available");
  }

  const hashBuffer = new ArrayBuffer(32);
  const hashArray = new Uint8Array(hashBuffer);

  const str = new TextDecoder().decode(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const view = new DataView(hashBuffer);
  view.setUint32(0, Math.abs(hash), false);

  return hashBuffer;
}

const crypto = {
  subtle: {
    digestSync(algorithm, data) {
      if (algorithm === "SHA-256") {
        return syncHash(algorithm, data);
      }
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    },
  },
};
function encodeHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hashString(string) {
  const messageBuffer = new TextEncoder().encode(string);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}
function object(object) {
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

function array(arr) {
  return hashString(JSON.stringify(arr.sort()));
}

export default { array, object, string: hashString };
