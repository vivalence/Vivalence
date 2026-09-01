import { Box, React, Table, Text } from "@vivalence/sheets";

const columns = () => {
  try {
    return Deno.consoleSize().columns - 6;
  } catch {
    return 76;
  }
};

export function Doctor({ report }) {
  const { homes, scopes, env, record, store, instances, locks, sessions, logs, environment, strata } = report;
  const width = columns();

  const stale = record.entries.filter((entry) => !entry.present);
  const pinned = record.entries.filter((entry) => entry.pinned).length;
  const flagged = (flag) => instances.filter((row) => (row.flags ?? []).some((held) => held.startsWith(flag))).length;
  const shelved = instances.filter(
    (row) => row.mount?.startsWith(`${homes.instances}/`) && !(row.flags ?? []).includes("dangling"),
  ).length;
  const running = locks.filter((lock) => lock.alive).length;
  const moved = store.path && store.path !== `${homes.ledger}/registry`;
  const scope = (name) => scopes.find((held) => held.name === name);

  return (
    <Box flexDirection="column">
      <Text bold>viva ledger/doctor</Text>

      <Box flexDirection="column" marginTop={1}>
        <Home name="ledger" scope={scope("ledger")} />

        <Organ
          name=".env"
          count={env.present ? "present" : "absent"}
          note={`${env.vars.length} vars · ${env.secrets.length} secrets${env.blank.length ? ` · ${env.blank.length} blank` : ""}`}
          warn={env.blank.length > 0}
        />

        <Organ
          name="registry.json"
          count={`${record.entries.length} tapped`}
          note={`${pinned} pinned · ${record.entries.length - pinned} store · ${stale.length} stale`}
          warn={stale.length > 0}
          tail="registry/doctor"
        />
        {stale.map((entry) => (
          <Text key={entry.reference} color="red">
            {"    ✗ "}
            {entry.reference}
            <Text color="gray">  gone — viva registry/untap</Text>
          </Text>
        ))}

        <Organ
          name="registry/"
          count={`${store.resident.length} resident`}
          note={`${store.untapped.length} untapped${moved ? ` · moved → ${store.path}` : ""}`}
          warn={store.untapped.length > 0}
        />
        {store.untapped.map((root) => (
          <Text key={root} color="yellow">
            {"    ○ "}
            {root.split("/").at(-1)}
            <Text color="gray">  untapped — viva registry/tap</Text>
          </Text>
        ))}

        <Organ name="instances.json" count={`${instances.length} recorded`} note="" />
        <Rows
          rows={instances.map((row) => ({
            slug: row.slug,
            valence: row.valence ?? null,
            mount: row.mount === `${homes.instances}/${row.slug}` ? null : row.mount,
            updated: row.updatedAt?.slice(0, 10) ?? null,
            flags: row.flags?.join(" ") ?? null,
          }))}
          width={width}
        />

        <Organ
          name="instances/"
          count={`${shelved} shelved`}
          note={`${flagged("orphan")} orphan · ${flagged("dangling")} dangling · ${flagged("shadowed")} shadowed`}
          warn={flagged("orphan") + flagged("dangling") + flagged("shadowed") > 0}
        />

        <Organ name="locks/" count={`${running} running`} note={locks.length > running ? `${locks.length - running} dead` : ""} warn={locks.length > running} />
        <Rows rows={locks} width={width} />

        <Organ name="sessions/" count={`${sessions.length} shells`} note="" />
        <Rows rows={sessions} width={width} />

        <Organ name="logs/" count={`${logs.length} files`} note="" />
        <Rows rows={logs} width={width} />
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Home name="repository" scope={scope("repository")} />
        <Home name="instance" scope={scope("instance")} />
        <Home name="mountpoint" scope={scope("mountpoint")} />
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>
          environment
          <Text color="gray"> ({environment.length} vars · {(strata ?? []).join(" › ")})</Text>
        </Text>
        {environment.map((variable) => (
          <Box key={variable.key} flexDirection="column">
            <Text>
              <Text color="cyan">{variable.key.padEnd(30)}</Text>{" "}
              <Text color="magenta">{(variable.stratum ?? "").padEnd(9)}</Text>{" "}
              <Text color="gray">{variable.value}</Text>
            </Text>
            {(variable.shadowed ?? []).map((voice) => (
              <Text key={voice.stratum} color="gray" dimColor>
                {"".padEnd(30)} ⋯ {voice.stratum.padEnd(9)} {voice.value}
              </Text>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function Home({ name, scope }) {
  return (
    <Text color={scope.present ? "green" : "red"}>
      {"  ".repeat(scope.depth)}
      {scope.present ? "✓" : "✗"} <Text bold>{name.padEnd(12)}</Text> <Text color="gray">{scope.path ?? "—"}</Text>
    </Text>
  );
}

function Organ({ name, count, note, warn, tail }) {
  return (
    <Text>
      {"  "}
      <Text color="cyan">{name.padEnd(16)}</Text>
      {String(count).padEnd(14)}
      <Text color={warn ? "yellow" : "gray"}>{note}</Text>
      {tail ? <Text color="gray" dimColor>{"  → "}{tail}</Text> : null}
    </Text>
  );
}

function Rows({ rows, width }) {
  if (!rows.length) return null;
  return (
    <Box marginLeft={4} marginBottom={0}>
      <Table rows={rows} width={width} />
    </Box>
  );
}
