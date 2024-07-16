import { load } from "https://deno.land/std/dotenv/mod.ts";
// @lj maybe repo level env vars arent the best idea.
const env = await load({ envPath: ".env", export: true });
export default { ...env };
