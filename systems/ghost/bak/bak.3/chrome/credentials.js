import { v } from "@vivalence/typology";

const MODE = 0o600;

const held = (file) => {
  try {
    return JSON.parse(Deno.readTextFileSync(file));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return {};
    throw error;
  }
};

const store = (file, record) => {
  Deno.writeTextFileSync(file, `${JSON.stringify(record, null, 2)}\n`, { mode: MODE });
  Deno.chmodSync(file, MODE);
};

const checked = (record) => {
  const faults = v.primitives.credentials.Credential.faults(record);
  if (faults.length) throw new Error(`[credentials] not a Credential: ${faults.map((fault) => fault.at).join(" · ")}`);
  return record;
};

export const credentials = (file) => ({
  file,
  read: (origin) => {
    const all = held(file);
    return Object.hasOwn(all, origin) ? all[origin] : null;
  },
  write: (origin, record) => store(file, { ...held(file), [origin]: checked(record) }),
  clear: (origin) => {
    const { [origin]: cleared, ...kept } = held(file);
    store(file, kept);
  },
});
