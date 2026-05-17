import {
  React,
  useState,
  render,
  Box,
  Text,
  Newline,
  Spacer,
  useInput,
  useApp,
  List,
  Select,
  TextArea,
  TextInput,
} from "./mod.jsx";

const STEPS = [
  { key: "name", label: "name" },
  { key: "language", label: "language" },
  { key: "framework", label: "framework" },
  { key: "notes", label: "notes" },
  { key: "summary", label: "review" },
];

const FRAMEWORKS = {
  JavaScript: ["React", "Vue", "Svelte", "Solid"],
  TypeScript: ["Next", "Remix", "SvelteKit"],
  Python: ["Django", "FastAPI", "Flask"],
  Rust: ["Actix", "Axum", "Rocket", "Leptos"],
  Go: ["Gin", "Echo", "Fiber"],
};

const FOOTER = {
  name: "type your name, enter to confirm · ctrl-c quit",
  language: "↑↓ or j/k · enter confirm · ctrl-c quit",
  framework: "↑↓ or j/k · enter confirm · ctrl-c quit",
  notes: "type · shift+enter newline · enter submit · ctrl-c quit",
  summary: "enter restart · q quit",
};

const EMPTY = { name: "", language: null, framework: null, notes: "" };

function Header({ stepKey }) {
  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1}>
      <Text color="cyan" bold>@vivalence/sheets</Text>
      <Spacer />
      <Text color="gray">step: </Text>
      <Text color="white">{stepKey}</Text>
    </Box>
  );
}

function Stepper({ stepIndex }) {
  return (
    <Box flexDirection="column" width={18} marginRight={2} paddingTop={1}>
      {STEPS.map((step, index) => {
        const done = index < stepIndex;
        const active = index === stepIndex;
        const color = active ? "cyan" : done ? "green" : "gray";
        const marker = active ? "▸" : done ? "✓" : "·";
        return (
          <Text key={step.key} color={color}>
            {marker} {index + 1}. {step.label}
          </Text>
        );
      })}
    </Box>
  );
}

function Footer({ stepKey }) {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1}>
      <Text color="gray">{FOOTER[stepKey]}</Text>
    </Box>
  );
}

function NameStep({ state, setState, next }) {
  return (
    <Box flexDirection="column">
      <Text>what's your name?</Text>
      <Newline />
      <TextInput
        value={state.name}
        onChange={(value) => setState({ ...state, name: value })}
        onSubmit={next}
        placeholder="anonymous"
      />
    </Box>
  );
}

function LanguageStep({ state, setState, next }) {
  return (
    <Box flexDirection="column">
      <Text>
        pick a language, <Text color="cyan">{state.name || "stranger"}</Text>.
      </Text>
      <Newline />
      <Select
        items={Object.keys(FRAMEWORKS)}
        onSelect={(language) => {
          setState({ ...state, language, framework: null });
          next();
        }}
      />
    </Box>
  );
}

function FrameworkStep({ state, setState, next }) {
  const options = FRAMEWORKS[state.language] ?? [];
  return (
    <Box flexDirection="column">
      <Text>
        which <Text color="cyan">{state.language}</Text> framework?
      </Text>
      <Newline />
      <Select
        items={options}
        onSelect={(framework) => {
          setState({ ...state, framework });
          next();
        }}
      />
    </Box>
  );
}

function NotesStep({ state, setState, next }) {
  return (
    <Box flexDirection="column">
      <Text>any notes? (shift+enter for newline)</Text>
      <Newline />
      <TextArea
        value={state.notes}
        onChange={(value) => setState({ ...state, notes: value })}
        onSubmit={next}
        placeholder="optional thoughts…"
        borderColor="cyan"
      />
    </Box>
  );
}

function SummaryStep({ state, restart }) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.return) restart();
    else if (input === "q") exit();
  });

  const notesPreview = (state.notes || "").trim();
  const summary = [
    `name      · ${state.name || "anonymous"}`,
    `language  · ${state.language ?? "—"}`,
    `framework · ${state.framework ?? "—"}`,
    `notes     · ${notesPreview ? notesPreview.split("\n").join(" ⏎ ") : "(none)"}`,
  ];

  return (
    <Box flexDirection="column">
      <Text color="green" bold>review</Text>
      <Newline />
      <Box borderStyle="round" borderColor="green" paddingX={1} flexDirection="column">
        <List items={summary} bullet="·" />
      </Box>
      <Newline />
      <Text color="gray">enter restart · q quit</Text>
    </Box>
  );
}

function Demo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState(EMPTY);

  const next = () => setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
  const restart = () => {
    setState(EMPTY);
    setStepIndex(0);
  };

  const stepKey = STEPS[stepIndex].key;

  let content = null;
  if (stepKey === "name") content = <NameStep state={state} setState={setState} next={next} />;
  else if (stepKey === "language") content = <LanguageStep state={state} setState={setState} next={next} />;
  else if (stepKey === "framework") content = <FrameworkStep state={state} setState={setState} next={next} />;
  else if (stepKey === "notes") content = <NotesStep state={state} setState={setState} next={next} />;
  else if (stepKey === "summary") content = <SummaryStep state={state} restart={restart} />;

  return (
    <Box flexDirection="column">
      <Header stepKey={stepKey} />
      <Box flexDirection="row">
        <Stepper stepIndex={stepIndex} />
        <Box flexDirection="column" flexGrow={1} paddingTop={1}>
          {content}
        </Box>
      </Box>
      <Footer stepKey={stepKey} />
    </Box>
  );
}

render(<Demo />);
