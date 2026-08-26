import { Box, React, Text } from "@vivalence/sheets";

export function Doctor({ report }) {
  const { identity, scopes, environment, secrets, processes, locks, instances, logs, instance, registry, vip } = report;

  return (
    <Box flexDirection="column">
      <Text bold>viva doctor</Text>

      <Section title="identity">
        <Text>
          role: <Text color="cyan">{identity.role}</Text>  mode:{" "}
          <Text color="cyan">{identity.mode}</Text>
        </Text>
        <Text color="gray">flags: {identity.flags.join(" ") || "—"}</Text>
      </Section>

      <Section title="scopes">
        {scopes.map((scope) => (
          <Text key={scope.name} color={scope.present ? "green" : "red"}>
            {"  ".repeat(scope.depth)}
            {scope.present ? "✓" : "✗"} {scope.name.padEnd(14)} {scope.path ?? "—"}
          </Text>
        ))}
      </Section>

      <Section title="processes" hint={`armed:${processes.armed}  attached:${processes.attached.length}`}>
        {processes.attached.length === 0 && <Text color="gray">—</Text>}
        {processes.attached.map((process) => (
          <Text key={process.pid}>
            pid {String(process.pid).padEnd(8)} {process.type ?? "?"}
            {process.slug ? ` · ${process.slug}` : ""}
          </Text>
        ))}
      </Section>

      <Section title="locks" hint={`${locks.length}`}>
        {locks.length === 0 && <Text color="gray">—</Text>}
        {locks.map((lock) => (
          <Text key={`${lock.type}_${lock.slug}`}>
            {lock.type}/{lock.slug.padEnd(20)} pid {lock.pid ?? "?"}
          </Text>
        ))}
      </Section>

      <Section title="instances" hint={`${instances.length}`}>
        {instances.length === 0 && <Text color="gray">—</Text>}
        {instances.map((instance) => (
          <Text key={instance.slug}>
            {instance.slug.padEnd(24)} updated {instance.updatedAt ?? "—"}
          </Text>
        ))}
      </Section>

      <Section title="logs" hint={`${logs.length} files`}>
        {logs.length === 0 && <Text color="gray">—</Text>}
        {logs.map((log) => (
          <Text key={log.name}>
            {log.name.padEnd(40)} {String(log.size).padStart(8)} B
          </Text>
        ))}
      </Section>

      <Section
        title="instance"
        hint={`daemons:${instance.daemons}  services:${instance.services}  runtime:${instance.runtime ? "yes" : "no"}`}
      >
        <Text color="gray">clients: {instance.clients.join(" ") || "—"}</Text>
      </Section>

      <Section
        title="registry"
        hint={
          registry === null
            ? "no scope"
            : registry.error
              ? `error: ${registry.error}`
              : `${registry.total} modes  ${Object.keys(registry.byType).length} types`
        }
      >
        {registry === null && <Text color="gray">—</Text>}
        {registry?.error && <Text color="red">{registry.error}</Text>}
        {registry?.byType && (
          <Text color="gray">
            {Object.entries(registry.byType)
              .map(([type, entries]) => `${type}:${entries.length}`)
              .join("  ")}
          </Text>
        )}
      </Section>

      <Section title="environment" hint={`${environment.length} vars`}>
        {environment.map((variable) => (
          <Text key={variable.key}>
            <Text color="cyan">{variable.key.padEnd(30)}</Text>{" "}
            <Text color="gray">{variable.value}</Text>
          </Text>
        ))}
      </Section>

      <Box marginTop={1}>
        <Text color="gray">
          vip cache: {vip}  ·  secrets: {secrets}
        </Text>
      </Box>
    </Box>
  );
}

function Section({ title, hint, children }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>
        {title}
        {hint ? <Text color="gray"> ({hint})</Text> : null}
      </Text>
      {children}
    </Box>
  );
}
