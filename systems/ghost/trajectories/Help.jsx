import { Box, React, Text } from "@vivalence/sheets";

// a boolean is a flag, not a third positional.
const label = (param) => (param.type === "boolean" ? `--${param.name}` : param.name);
const usage = (param) => `[${label(param)}]`;

export function Help({ commands, flags }) {
  if (commands.length === 1) return <Detail command={commands[0]} />;

  const groups = new Map();
  for (const command of commands) {
    const noun = command.nature.split("/")[0];
    if (!groups.has(noun)) groups.set(noun, []);
    groups.get(noun).push(command);
  }

  return (
    <Box flexDirection="column">
      <Text bold>viva</Text>
      {groups.size === 0 ? <Text color="gray">nothing matches</Text> : null}
      {[...groups.entries()].map(([noun, rows]) => (
        <Box key={noun} flexDirection="column" marginTop={1}>
          <Text bold>{noun}</Text>
          {rows.map((row) => (
            <Text key={row.nature}>
              {"  "}
              <Text color="cyan">{row.nature.padEnd(24)}</Text>{" "}
              <Text color="magenta">
                {row.params.map(usage).join(" ").padEnd(20)}
              </Text>{" "}
              <Text color="gray">{row.valence}</Text>
            </Text>
          ))}
        </Box>
      ))}
      <Box marginTop={1}>
        <Text color="gray">flags{"  "}{flags.join("  ")}</Text>
      </Box>
      <Text color="gray">viva help {"<prefix>"} narrows; an exact nature shows its params</Text>
    </Box>
  );
}

function Detail({ command }) {
  return (
    <Box flexDirection="column">
      <Text>
        <Text bold color="cyan">viva {command.nature}</Text>{" "}
        <Text color="magenta">{command.params.map(usage).join(" ")}</Text>
      </Text>
      <Text color="gray">{command.valence}</Text>
      {command.params.length ? (
        <Box flexDirection="column" marginTop={1}>
          {command.params.map((param) => (
            <Text key={param.name}>
              {"  "}
              <Text color="magenta">{label(param).padEnd(12)}</Text>{" "}
              <Text color="gray">{param.description || "—"}</Text>
            </Text>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
