import {
  Background,
  Banner,
  Box,
  Form,
  Logo,
  PasswordInput,
  React,
  Tasks,
  Text,
  TextInput,
  theme,
  useEffect,
  useInput,
  useState,
} from "@vivalence/sheets";

export function Init({ pages, commit, boot, signup, teardown, buffer }) {
  const [phase, setPhase] = useState(pages?.length ? "fill" : "boot");
  const [procs, setProcs] = useState([]);
  const [tail, setTail] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [steps, setSteps] = useState([]);
  const [filled, setFilled] = useState(null);
  const [exits, setExits] = useState({});
  const [fault, setFault] = useState(null);

  useEffect(() => {
    if (phase !== "boot") return;
    let alive = true;
    (async () => {
      try {
        const die = await boot();
        if (!alive) return;
        setProcs(die.good.processes);
        for (const process of die.good.processes) {
          process.out.tap((line) => setTail((current) => [...current.slice(-12), `${process.slug}  ${line}`]));
          process.perpetuate().then((exit) => setExits((current) => ({ ...current, [process.slug]: exit })));
        }
        await die.integrate();
        if (alive) setPhase("create");
      } catch (error) {
        if (!alive) return;
        setFault(error);
        setPhase("failed");
      }
    })();
    return () => (alive = false);
  }, [phase]);

  useInput((input, key) => {
    if (["ready", "failed"].includes(phase) && (key.return || key.escape)) {
      teardown().then(() =>
        buffer.release({
          status: phase === "failed" ? "failed" : "init",
          ...(fault ? { error: fault.message } : {}),
          pids: procs.map((process) => process.child.pid),
        })
      );
    }
  });

  const onFill = async ({ values, action }) => {
    if (action !== "commit") return setPhase("boot");
    setPhase("install");
    setSteps([{ label: ".env", status: "running", detail: `${Object.keys(values).length} keys` }]);
    try {
      const held = await commit(values);
      setFilled(held);
      setSteps([{ label: ".env", status: "done", detail: held.filled.join(" ") }]);
    } catch (error) {
      setSteps([{ label: ".env", status: "failed", detail: error.message }]);
    }
    setPhase("boot");
  };

  const onCreate = async ({ values, action }) => {
    if (action !== "commit") {
      setAdmin(null);
      return setPhase("ready");
    }
    setAdmin(values);
    setPhase("install");
    setSteps([{ label: "auth/signup", status: "running", detail: values.username }]);
    try {
      const result = await signup(values);
      setSteps([
        {
          label: "auth/signup",
          status: "done",
          detail: `${result.status}  ${result.identity?.id ?? ""}`,
        },
      ]);
    } catch (error) {
      setSteps([{ label: "auth/signup", status: "failed", detail: error.message }]);
    }
    setPhase("ready");
  };

  const processRows = () =>
    procs.map((process) => {
      const exit = exits[process.slug];
      return {
        label: process.slug,
        status: !exit ? "done" : exit.success ? "done" : "failed",
        detail: exit ? `exited (code ${exit.code})` : `pid ${process.child.pid} · alive`,
      };
    });

  const title = {
    boot: "booting",
    failed: "boot failed",
    fill: "environment",
    create: "create admin",
    install: "installing",
    ready: "ready",
  }[phase];
  const hint = {
    boot: "starting processes…",
    failed: "enter → exit 1",
    fill: "↑↓/tab move · type · enter next · ←→ action",
    create: "↑↓/tab move · type · enter next · ←→ action",
    install: "creating user…",
    ready: "enter → stop + exit",
  }[phase];

  return (
    <Background>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.brand}
        paddingX={2}
        paddingY={1}
      >
        <Box justifyContent="space-between">
          <Logo instance="banner" />
          {title ? <Text color={theme.dim}>{title}</Text> : null}
        </Box>
        <Box flexDirection="column" marginY={1}>
          {phase === "boot" && (
            <Box flexDirection="column" gap={1}>
              <Tasks
                items={procs.map((process) => ({
                  label: process.slug,
                  status: "running",
                  detail: "spawning…",
                }))}
              />
              <Box flexDirection="column">
                {tail.map((line, index) => (
                  <Text key={index} color="gray">
                    {line}
                  </Text>
                ))}
              </Box>
            </Box>
          )}

          {phase === "failed" && (
            <Box flexDirection="column" gap={1}>
              <Tasks items={processRows()} />
              <Box flexDirection="column">
                {tail.map((line, index) => (
                  <Text key={index} color="gray">
                    {line}
                  </Text>
                ))}
              </Box>
              <Text color={theme.bad}>{fault?.message}</Text>
            </Box>
          )}

          {phase === "fill" && (
            <Form
              pages={pages.map((group) => ({
                title: group.title,
                fields: group.fields.map((row) => ({
                  name: row.key,
                  label: row.key,
                  hint: row.describe,
                  input: row.key.startsWith("SECRET_") ? PasswordInput : TextInput,
                  props: { defaultValue: row.default ?? "" },
                })),
              }))}
              actions={["commit", "skip"]}
              done={onFill}
            />
          )}

          {phase === "create" && (
            <Form
              pages={[
                {
                  title: "admin",
                  fields: [
                    { name: "username", label: "username", input: TextInput },
                    { name: "password", label: "password", input: PasswordInput },
                  ],
                },
              ]}
              actions={["commit", "skip"]}
              done={onCreate}
            />
          )}

          {phase === "install" && <Tasks items={steps} />}

          {phase === "ready" && (
            <Box flexDirection="column" gap={1}>
              <Banner
                instance="success"
                headline="instance up"
                body={`admin ${admin?.username ?? "(skipped)"}${admin ? `  ·  ${"•".repeat(admin.password?.length ?? 0)}` : ""}`}
                nextSteps={["enter to stop + exit"]}
              />
              <Tasks items={[...steps, ...processRows()]} />
            </Box>
          )}
        </Box>
        {hint ? <Text color={theme.dim}>{hint}</Text> : null}
      </Box>
    </Background>
  );
}
