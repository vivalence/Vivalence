import { dirname } from "@std/path";

const BACKENDS = [
  [() => "Deno" in globalThis, (paladin) => file(paladin.scope.credentials)],
  [() => "localStorage" in globalThis, () => storage(globalThis.localStorage)],
  [() => true, () => { throw new Error("[vault] no backend: neither Deno nor localStorage in globalThis"); }],
];
export default function vault(paladin) {
  let backend = null;
  const resolved = () => (backend ??= BACKENDS.find(([present]) => present())[1](paladin));
  paladin.vault = { held: (origin) => resolved().held(origin), store: (origin, record) => resolved().store(origin, record) };
}
const file = (path) => ({
  held: (origin) => { try { return JSON.parse(Deno.readTextFileSync(path.absolute))[origin] ?? null; } catch (error) { if (error instanceof Deno.errors.NotFound) return null; throw error; } },
  store: (origin, record) => {
    const { [origin]: stale, ...kept } = (() => { try { return JSON.parse(Deno.readTextFileSync(path.absolute)); } catch { return {}; } })();
    Deno.mkdirSync(dirname(path.absolute), { recursive: true });
    Deno.writeTextFileSync(path.absolute, `${JSON.stringify(record === null ? kept : { ...kept, [origin]: record }, null, 2)}\n`, { mode: 0o600 });
    Deno.chmodSync(path.absolute, 0o600);
  },
});
const storage = (storage) => ({
  held: (origin) => JSON.parse(storage.getItem(`vault:${origin}`) ?? "null"),
  store: (origin, record) => (record === null ? storage.removeItem(`vault:${origin}`) : storage.setItem(`vault:${origin}`, JSON.stringify(record))),
});
