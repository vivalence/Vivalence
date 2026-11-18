import { persistentAtom } from "@nanostores/persistent";

export function preferences(mode) {
  const $held = persistentAtom(`viva.mode.${mode}`, {}, { encode: JSON.stringify, decode: JSON.parse });
  return { read: () => $held.get(), write: (patch) => $held.set({ ...$held.get(), ...patch }) };
}
