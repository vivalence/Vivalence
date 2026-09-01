import { Box, React, Text } from "@vivalence/sheets";

const columns = () => {
  try {
    return Deno.consoleSize().columns - 2;
  } catch {
    return 78;
  }
};

const tail = (text, room) => (text.length <= room ? text : `…${text.slice(-(room - 1))}`);

export function Doctor({ report }) {
  const { record, store, pensieve, packages } = report;
  const width = columns();
  const inside = (root) => (store.path && root.startsWith(`${store.path}/`) ? root.slice(store.path.length + 1) : root);

  return (
    <Box flexDirection="column">
      <Text bold>viva registry/doctor</Text>

      <Box flexDirection="column" marginTop={1}>
        <Line name="record" note={`${record.tapped} tapped · ${record.stale.length} stale`} path={record.path} warn={record.stale.length > 0} />
        {record.stale.map((reference) => (
          <Text key={reference} color="red">
            {"  ✗ "}
            {reference}
            <Text color="gray">  gone — viva registry/untap</Text>
          </Text>
        ))}
        <Line
          name="store"
          note={`${store.resident.length} resident · ${store.untapped.length} untapped`}
          path={store.path ?? "—"}
          warn={store.untapped.length > 0}
        />
        {store.untapped.map((root) => (
          <Text key={root} color="yellow">
            {"  ○ "}
            {inside(root)}
            <Text color="gray">  untapped — viva registry/tap</Text>
          </Text>
        ))}
        <Line name="pensieve" note={`${pensieve.modes} modes · ${pensieve.types} types · ${pensieve.owners} owners`} path="" />
      </Box>

      {packages.map((held) => (
        <Box key={held.owner} flexDirection="column" marginTop={1}>
          <Text>
            <Text color="cyan" bold>{held.owner.padEnd(14)}</Text>
            {String(held.modes).padStart(3)} modes  <Text color="gray">{tail(held.root ?? "no tap declares this owner", width - 26)}</Text>
          </Text>
          {Object.entries(held.types).map(([type, slugs]) => (
            <Text key={type}>
              {"  "}
              {type.padEnd(14)} <Text color="gray">{slugs.join("  ")}</Text>
            </Text>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function Line({ name, note, path, warn }) {
  return (
    <Text>
      <Text color="cyan">{name.padEnd(10)}</Text>
      <Text color={warn ? "yellow" : undefined}>{note.padEnd(32)}</Text>
      <Text color="gray">{path}</Text>
    </Text>
  );
}
