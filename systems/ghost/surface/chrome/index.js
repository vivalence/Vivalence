import { tokens } from "@vivalence/dapper";
import { mime } from "@vivalence/typology";
import { opentui } from "./host/index.js";
import { keypresses } from "./keys.js";
import { paint } from "./paint.js";
import { panes } from "./out/panes.mjs";

export const chrome = async (client) => {
  if (!Deno.stdin.isTerminal())
    throw new Error("chrome needs a terminal — run it in one, or: viva repl");
  const { createCliRenderer } = await opentui();
  const renderer = await createCliRenderer({ exitOnCtrlC: false });
  renderer.keyInput.on("keypress", (event) => {
    if (event.ctrl && !event.shift && event.name === "c") Deno.kill(Deno.pid, "SIGINT");
  });

  (async () => {
    for await (const press of keypresses(renderer).drain())
      if (press.key === "`") renderer.console.toggle();
  })();
  // no repl wired in yet??!!

  // console.log({ renderer });
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
  return () => {
    const shown = renderer.console._allLogEntries;
    const cached = renderer.console.getCachedLogs();
    erase();
    renderer.destroy();
    for (const [date, level, args] of shown) console.log(date.toISOString(), level, ...args);
    if (cached.length > 0) console.log(cached);
  };
};
