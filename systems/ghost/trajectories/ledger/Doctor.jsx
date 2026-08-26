import { Box, React, Text } from "@vivalence/sheets";

export function Doctor({ report }) {
  const { identity, scopes, environment, env, strata, secrets, processes, locks, instances, logs, instance, registry, vip } = report;

  return (
    <Box flexDirection="column">
      <Text bold>viva doctor</Text>

      <Section title="identity">
        <Text>
          role: <Text color="cyan">{identity.role ?? "—"}</Text>  mode:{" "}
          <Text color="cyan">{identity.mode ?? "—"}</Text>
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

      <Section title="environment" hint={`${environment.length} vars · ${(strata ?? []).join(" › ")}`}>
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
      </Section>

      {(env ?? []).length ? (
        <Section
          title="env"
          hint={`${env.filter((row) => ["UNDOCUMENTED", "REQUIRED"].includes(row.verdict)).length} to answer`}
        >
          {env.map((row, index) => (
            <Text key={`${row.key}-${index}`}>
              <Text color="cyan">{row.key.padEnd(32)}</Text>{" "}
              <Text color="gray">{(row.at ?? "—").slice(0, 34).padEnd(35)}</Text>{" "}
              <Text color={row.value ? "gray" : "red"}>{row.value ?? "—"}</Text>
            </Text>
          ))}
        </Section>
      ) : null}

      <Section
        title="registry"
        hint={
          registry === null
            ? "no scope"
            : registry.error
              ? `error: ${registry.error}`
              : `${registry.total} modes  ${Object.keys(registry.byOwner ?? {}).length} packages`
        }
      >
        {registry === null && <Text color="gray">—</Text>}
        {registry?.error && <Text color="red">{registry.error}</Text>}
        {registry?.byOwner &&
          Object.entries(registry.byOwner).map(([owner, types]) => (
            <Box key={owner} flexDirection="column">
              <Text color="cyan">{owner}</Text>
              {Object.entries(types).map(([type, slugs]) => (
                <Text key={type}>
                  {"  "}
                  {type.padEnd(14)} <Text color="gray">{slugs.join("  ")}</Text>
                </Text>
              ))}
            </Box>
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

      <Section title="instances" hint={`${instances.length}`}>
        {instances.length === 0 && <Text color="gray">—</Text>}
        {instances.map((entry) => (
          <Text key={entry.slug}>
            {entry.slug.padEnd(24)} {(entry.mount ?? "—").padEnd(48)}{" "}
            <Text color="gray">updated {entry.updatedAt ?? "—"}</Text>
          </Text>
        ))}
      </Section>

      <Section
        title="instance"
        hint={`daemons:${instance.daemons}  services:${instance.services}  runtime:${instance.runtime ? "yes" : "no"}`}
      >
        <Text color="gray">clients: {instance.clients.join(" ") || "—"}</Text>
      </Section>

      <Section title="locks" hint={`${locks.length}`}>
        {locks.length === 0 && <Text color="gray">—</Text>}
        {locks.map((lock) => (
          <Text key={`${lock.type}_${lock.slug}`}>
            {lock.type}/{lock.slug.padEnd(20)} pid {lock.pid ?? "?"}
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
