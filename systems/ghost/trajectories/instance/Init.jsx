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

  useEffect(() => {
    if (phase !== "boot") return;
    let alive = true;
    (async () => {
      const processes = await boot();
      if (!alive) return;
      setProcs(processes);
      for (const process of processes) {
        process.status.then((exit) => setExits((current) => ({ ...current, [process.pid]: exit })));
      }
      const ready = processes.map(
        (process) =>
          new Promise((resolve) => {
            process.out.tap((line) => {
              setTail((current) => [...current.slice(-12), `${process.spec.type}  ${line}`]);
              if (line.includes("Status:ALIVE")) resolve();
            });
          }),
      );
      await Promise.all(ready);
      if (alive) setPhase("create");
    })();
    return () => (alive = false);
  }, [phase]);

  useInput((input, key) => {
    if (phase === "ready" && (key.return || key.escape)) {
      teardown().then(() =>
        buffer.release({
          status: "init",
          pids: procs.map((process) => process.pid),
        }),
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

  const title = {
    boot: "booting",
    fill: "environment",
    create: "create admin",
    install: "installing",
    ready: "ready",
  }[phase];
  const hint = {
    boot: "starting processes…",
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
                label: process.spec.type,
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
            <Tasks
              items={[
                ...steps,
                ...procs.map((process) => {
                  const exit = exits[process.pid];
                  return {
                    label: process.spec.type,
                    status: !exit ? "done" : exit.success ? "done" : "failed",
                    detail: exit ? `exited (code ${exit.code})` : `pid ${process.pid} · alive`,
                  };
                }),
              ]}
            />
          </Box>
        )}
        </Box>
        {hint ? <Text color={theme.dim}>{hint}</Text> : null}
      </Box>
    </Background>
  );
}
