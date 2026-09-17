import { consumer } from "./client.js";
import { mount } from "./sheet.jsx";

const url = Deno.args[0] ?? "http://localhost:7710";
const token = Deno.args[1] ?? "user-token";
const client = await consumer(url, token);
await mount({
  title: `anima · remote · ${url}`,
  repository: client.repository,
  signal: (row, name, input) => row.stdin[name](input),
  close: () => client.close(),
});
