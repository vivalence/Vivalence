import paladin from "@vivalence/paladin";
import { React, Box, Text } from "@vivalence/sheets";

const SCOPES = [
  ["system", 0],
  ["repository", 0],
  ["registry", 0],
  ["variant", 0],
  ["mountpoint", 1],
  ["environment", 1],
];

const NAME_WIDTH = 16;
const INDENT = 2;

export async function doctor(ctx) {
  const scopes = SCOPES.map(([name, depth]) => ({
    name,
    depth,
    present: name in paladin.scope,
    path: paladin.scope[name]?.absolute ?? null,
  }));
  const variables = Object.entries(paladin.env.vars).map(([key, value]) => ({ key, value }));
  const report = {
    role: paladin.role,
    mode: paladin.mode,
    scopes,
    variables,
  };
  ctx.effect = report;
  if (ctx.signal.flags?.json) return;
  await ctx.view.once(React.createElement(Doctor, { report }));
}

const Scope = ({ present, name, path, depth }) =>
  React.createElement(
    Box,
    null,
    React.createElement(
      Box,
      { width: 2, marginLeft: depth * INDENT, flexShrink: 0 },
      React.createElement(Text, { color: present ? "green" : "red" }, present ? "✓" : "✗"),
    ),
    React.createElement(Text, null, name.padEnd(NAME_WIDTH - depth * INDENT)),
    React.createElement(Text, { color: "gray", wrap: "truncate-middle" }, path ?? "—"),
  );

const Variable = ({ name, value }) =>
  React.createElement(
    Box,
    null,
    React.createElement(Text, { color: "cyan" }, name.padEnd(30)),
    React.createElement(Text, { color: "gray", wrap: "truncate-middle" }, value),
  );

const Section = ({ title, hint, children }) =>
  React.createElement(
    Box,
    { flexDirection: "column", marginTop: 1 },
    React.createElement(
      Box,
      null,
      React.createElement(Text, { bold: true }, title),
      React.createElement(Text, { color: "gray" }, `   ${hint}`),
    ),
    children,
  );

const Field = ({ label, value }) =>
  React.createElement(
    Box,
    null,
    React.createElement(Text, { color: "gray" }, `${label} `),
    React.createElement(Text, { color: value ? "cyan" : "yellow", dimColor: !value }, value ?? "undefined"),
  );

function Doctor({ report }) {
  return React.createElement(
    Box,
    { flexDirection: "column" },
    React.createElement(Text, { bold: true }, "viva doctor  ·  system report card"),
    React.createElement(
      Box,
      null,
      React.createElement(Field, { label: "role", value: report.role }),
      React.createElement(Text, null, "   "),
      React.createElement(Field, { label: "mode", value: report.mode }),
    ),
    React.createElement(
      Section,
      { title: "SCOPES", hint: "resolved mount points" },
      ...report.scopes.map((scope) => React.createElement(Scope, { key: scope.name, ...scope })),
    ),
    React.createElement(
      Section,
      { title: "ENVIRONMENT", hint: `${report.variables.length} variables loaded` },
      ...report.variables.map((variable) =>
        React.createElement(Variable, { key: variable.key, name: variable.key, value: variable.value }),
      ),
    ),
  );
}
