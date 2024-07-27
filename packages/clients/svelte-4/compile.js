import { compile } from "npm:svelte/compiler";

const path = "/Users/finn/vivalence/code/vivalence/packages/clients/svelte-4/test/Game.svelte";
const source = Deno.readTextFileSync(path);
const result = compile(source, {});
console.log(result);
