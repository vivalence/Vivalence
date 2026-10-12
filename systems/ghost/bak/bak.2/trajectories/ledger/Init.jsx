import { Box, React, Select, Text, TextInput, useInput, useState } from "@vivalence/sheets";

// narrative wizard for /ledger/init.
// step 1 :: how is viva embedded? (.config file | manual export line | abort)
// step 2 :: where does $viva live?
// step 3 :: (only when manual) show export line, wait for enter
export function Init({ home, persist, exportLineFor, buffer }) {
  const [phase, setPhase] = useState("how");
  const [mode, setMode] = useState(null); // "config" | "manual"
  const [mount, setMount] = useState(home);

  useInput((_input, key) => {
    if (phase !== "manual") return;
    if (key.return || key.escape) {
      buffer.release({
        mount,
        mode: "manual",
        exportLine: exportLineFor(mount),
        persisted: false,
      });
    }
  });

  if (phase === "how") {
    const onChoice = (choice) => {
      if (choice === "abort") return buffer.release({ aborted: true });
      setMode(choice);
      setPhase("where");
    };
    return (
      <Box flexDirection="column">
        <Text bold>How is vivalence(viva) embedded?</Text>
        <Select
          items={[
            { label: ".config", value: "config" },
            { label: "manual", value: "manual" },
            { label: "abort", value: "abort" },
          ]}
          onSelect={(item) => onChoice(item.value)}
        />
      </Box>
    );
  }

  if (phase === "where") {
    const onSubmit = async () => {
      if (mode === "config") {
        const file = await persist(mount);
        return buffer.release({ mount, mode: "config", config: file, persisted: true });
      }
      if (mode === "manual") return setPhase("manual");
    };
    return (
      <Box flexDirection="column">
        <Text bold>
          where does $viva live? <Text color="gray">$VIVA_LEDGER_MOUNT</Text>{" "}
        </Text>
        <TextInput value={mount} onChange={setMount} onSubmit={onSubmit} />
      </Box>
    );
  }

  if (phase === "manual") {
    return (
      <Box flexDirection="column">
        <Text bold>add this to your shell rc (.bashrc / .zshrc):</Text>
        <Text color="cyan">{exportLineFor(mount)}</Text>
        <Text color="gray">enter → done</Text>
      </Box>
    );
  }
}
