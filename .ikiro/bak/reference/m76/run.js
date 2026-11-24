// TODO temporary — m76 probe runner: deno.jsonc excludes testament/, so Deno.test is shimmed under `deno run`
const tests = [];
Object.defineProperty(Deno, "test", { value: (name, fn) => tests.push({ name, fn }), configurable: true, writable: true });
for (const file of Deno.args) await import(new URL(file, `file://${Deno.cwd()}/`).href);
let passed = 0, failed = 0;
const stepper = (prefix) => ({
  step: async (name, fn) => {
    try { await fn(stepper(`${prefix}${name} › `)); passed++; console.log(`  ok   ${prefix}${name}`); }
    catch (error) { failed++; console.log(`  FAIL ${prefix}${name}\n       ${String(error?.stack ?? error).split("\n").slice(0, 24).join("\n       ")}`); }
  },
});
for (const { name, fn } of tests) {
  const before = failed;
  try { await fn(stepper("")); if (failed === before) { passed++; console.log(`ok   ${name}`); } else console.log(`FAIL ${name} (steps above)`); }
  catch (error) { failed++; console.log(`FAIL ${name}\n     ${String(error?.stack ?? error).split("\n").slice(0, 8).join("\n     ")}`); }
}
console.log(`\n${passed} passed | ${failed} failed`);
Deno.exit(failed ? 1 : 0);
