import { join } from "@std/path";
import { React, Box, Text, Select, TextInput, useState } from "@vivalence/sheets";

export async function init(ctx) {
  const home = join(Deno.env.get("HOME"), ".viva");
  const config = await ctx.view.form(Init, { defaults: { home } });
  if (!config) return (ctx.effect = { aborted: true });

  const exportLine = `export VIVA_SYSTEM_MOUNT="${config.VIVA_SYSTEM_MOUNT}"`;

  if (config.target === "print") {
    ctx.effect = { mount: config.VIVA_SYSTEM_MOUNT, exportLine, persisted: false };
    if (!ctx.signal.flags?.json) await ctx.view.once(React.createElement(Manual, { exportLine }));
    return;
  }

  const file = await persist({ VIVA_SYSTEM_MOUNT: config.VIVA_SYSTEM_MOUNT });
  ctx.effect = { mount: config.VIVA_SYSTEM_MOUNT, config: file, persisted: true };
}

async function persist(config) {
  const dir = join(
    Deno.env.get("XDG_CONFIG_HOME") ?? join(Deno.env.get("HOME"), ".config"),
    "viva",
  );
  const file = join(dir, "env");
  await Deno.mkdir(dir, { recursive: true });
  const existing = await Deno.readTextFile(file).catch(() => "");
  const lines = existing.split("\n").filter(Boolean);

  for (const [key, value] of Object.entries(config)) {
    const line = `export ${key}="${value}"`;
    const index = lines.findIndex((entry) => entry.startsWith(`export ${key}=`));
    if (index >= 0) lines[index] = line;
    else lines.push(line);
  }

  await Deno.writeTextFile(file, lines.join("\n") + "\n");
  return file;
}

function Init({ defaults, done }) {
  const [stage, setStage] = useState(0);
  const [home, setHome] = useState(defaults.home);
  if (stage === 0)
    return React.createElement(
      Box,
      { flexDirection: "column" },
      React.createElement(Text, null, "where should the system live?"),
      React.createElement(
        Text,
        { color: "gray" },
        "$SYSTEM = ledger of running instances · written to ~/.config/viva/env",
      ),
      React.createElement(TextInput, {
        value: home,
        onChange: setHome,
        onSubmit: () => setStage(1),
      }),
    );
  return React.createElement(
    Box,
    { flexDirection: "column" },
    React.createElement(Text, null, `system → ${home}`),
    React.createElement(Text, { color: "gray" }, "how to persist VIVA_SYSTEM_MOUNT?"),
    React.createElement(Select, {
      items: ["write ~/.config/viva/env", "print export line", "abort"],
      onSelect: (choice) =>
        done(
          choice === "write ~/.config/viva/env"
            ? { VIVA_SYSTEM_MOUNT: home, target: "write" }
            : choice === "print export line"
              ? { VIVA_SYSTEM_MOUNT: home, target: "print" }
              : null,
        ),
    }),
  );
}

function Manual({ exportLine }) {
  return React.createElement(
    Box,
    { flexDirection: "column", marginTop: 1 },
    React.createElement(Text, { bold: true }, "add this to your shell rc (.bashrc / .zshrc):"),
    React.createElement(
      Box,
      { marginTop: 1, marginLeft: 2 },
      React.createElement(Text, { color: "cyan" }, exportLine),
    ),
    React.createElement(
      Box,
      { marginTop: 1 },
      React.createElement(Text, { color: "gray" }, "then: source it or open a new shell"),
    ),
  );
}
