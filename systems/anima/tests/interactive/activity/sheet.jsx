import { React, render, Box, Text, useInput, useApp, useEffect, useState, Table, theme } from "@vivalence/sheets";
import { metronome } from "@vivalence/typology/scenarios";
import { short, stamp } from "./client.js";
import { GROUPS, init, react, sorted, held } from "./sheet.state.js";

const KEYS = [["s", "SIGSTOP"], ["n", "SIGCONT"], ["t", "SIGTERM"], ["k", "SIGKILL"], ["g", "group"], ["↵", "steps"], ["q", "quit"]];

export function Sheet({ title, repository, signal, close }) {
  const { exit } = useApp();
  const [rows, setRows] = useState(repository.$entities.get());
  const [state, setState] = useState(init);
  const [log, setLog] = useState([]);
  const note = (line) => setLog((held) => [...held.slice(-7), `${stamp()} ${line}`]);

  useEffect(() => {
    const off = repository.$entities.subscribe((held) => setRows([...held]));
    const roster = metronome.ledger(repository);
    let seen = 0;
    const tap = repository.$entities.subscribe(() => {
      for (const frame of roster.rows.slice(seen)) note(`${frame.op} ${short(frame.id)} ${frame.status ?? ""} ${frame.last ?? ""}`);
      seen = roster.rows.length;
    });
    Promise.resolve(repository.find?.()).catch((error) => note(`! ${error.message}`));
    const unsubscribe = repository.subscribe?.({}, () => {}) ?? (() => {});
    return () => { off(); tap(); roster.off(); unsubscribe(); };
  }, []);

  const run = (effect) => {
    const work = {
      quit: () => Promise.resolve(close?.()).then(() => exit()),
      signal: () => signal(rows.find((row) => row.id === effect.id), effect.name),
    }[effect.kind];
    Promise.resolve().then(work).catch((error) => note(`! ${error.message}`));
  };

  useInput((input, key) => {
    const next = react(state, { input, key }, rows);
    setState(next.state);
    if (next.effect) run(next.effect);
  });

  const key = GROUPS[state.group];
  const list = sorted(rows, state);
  const row = held(rows, state);
  const table = list.map((entry) => ({
    " ": entry === row ? "›" : " ",
    ...(key !== "none" && { [key]: short(entry[key]) }),
    id: short(entry.id),
    status: entry.status,
    error: entry.error?.code ?? "",
    steps: entry.steps?.length ?? 0,
    thread: short(entry.thread), mode: short(entry.mode), turn: short(entry.turn), buffer: short(entry.buffer),
  }));
  const columns = [" ", ...(key !== "none" ? [key] : []), "id", "status", "error", "steps", "thread", "mode", "turn", "buffer"];

  return (
    <Box flexDirection="column">
      <Text color={theme.brand} bold>{title}</Text>
      <Text color="gray">group: {key}   rows: {rows.length}   cursor: {short(row?.id)}</Text>
      <Box marginTop={1}>
        {list.length ? <Table rows={table} columns={columns} /> : <Text color="gray">∅ — waiting for a hallucination</Text>}
      </Box>
      {state.grains && row && (
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.accent ?? "cyan"}>steps · {short(row.id)} · {row.status}{row.error ? ` · ${row.error.code} ${row.error.message}` : ""}</Text>
          {row.steps?.length
            ? <Table rows={row.steps.map((step) => ({ at: Number(step.at).toFixed(0), path: step.path, verb: step.verb }))} columns={["at", "path", "verb"]} />
            : <Text color="gray">no steps yet</Text>}
        </Box>
      )}
      <Box marginTop={1} flexDirection="column">
        {log.map((line, index) => <Text key={index} color="gray">{line}</Text>)}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">{KEYS.map(([k, v]) => `${k}:${v}`).join("  ")}  ↑↓/J/K:cursor</Text>
      </Box>
    </Box>
  );
}

export function mount(props) {
  const instance = render(<Sheet {...props} />);
  return instance.waitUntilExit();
}
