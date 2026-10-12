import { v } from "@vivalence/typology";

const key = (origin) => `lighthouse:${origin}`;

const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const faults = (record) => v.primitives.credentials.Credential.faults(record);

export const credentials = (storage) => ({
  read(origin) {
    const text = storage.getItem(key(origin));
    if (text === null) return null;
    const record = parse(text);
    if (record !== null && faults(record).length === 0) return record;
    storage.removeItem(key(origin));
    return null;
  },
  write(origin, record) {
    const found = faults(record);
    const named = found.map((fault) => `${fault.at} ${fault.reason}`).join(" · ");
    if (found.length) throw new Error(`[credentials] refused for ${origin}: ${named}`);
    storage.setItem(key(origin), JSON.stringify(record));
  },
  clear(origin) {
    storage.removeItem(key(origin));
  },
});
