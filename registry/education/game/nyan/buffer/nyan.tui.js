import {
  GAMEPLAYS,
  analyze,
  ascending,
  createRun,
  defaultConfig,
  fold,
  groupBy,
  liveStats,
  note,
  press,
  project,
  sample,
} from "./engine.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const write = (text) => Deno.stdout.writeSync(encoder.encode(text));

const EN =
  `the of and to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good man think say great where help through much before line right too mean old any same tell follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand again change off play air away animal house point page letter mother answer found study still learn should world high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left dont few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea grow river four carry state once book hear stop without second late miss idea enough eat face watch far really almost let above girl sometimes mountain cut young talk soon list song being leave family`.split(
    " ",
  );

const PT =
  `que não uma para com mais você por isso ela ele como está mas foi bem são dos das tem ser tudo aqui agora muito quando coisa também depois fazer assim porque ainda mesmo casa dia vida tempo ano onde gente nada sempre hoje sim só até obrigado amanhã manhã água família café coração ação atenção informação então irmão pão mão avião lição razão opinião situação grão verão alemão cidadão música número último época médico fácil difícil possível incrível inglês português três mês país após através têm vê voo enjoo saúde júri açúcar órgão bênção ônibus lâmpada câmara ângulo amável nível túnel táxi vovô avô avó nós vós pôr pé fé chá já lá será estará amanhecer começar almoço esforço cabeça criança dança esperança mudança herança presença diferença sentença licença ciência paciência experiência consciência distância importância infância ganância elegância arrogância`.split(
    " ",
  );

const RESET = "\x1b[0m",
  DIM = "\x1b[2m",
  BOLD = "\x1b[1m",
  UNDERLINE = "\x1b[4m";
const GREEN = "\x1b[32m",
  RED = "\x1b[31m",
  YELLOW = "\x1b[33m",
  CYAN = "\x1b[36m",
  MAGENTA = "\x1b[35m";
const TINT = { recall: MAGENTA, spelling: YELLOW, motor: RED, clean: GREEN };
const columns = () => {
  try {
    return Deno.consoleSize().columns;
  } catch {
    return 80;
  }
};

const renderWord = (view, wordIndex) => {
  const target = view.words[wordIndex];
  if (wordIndex < view.wordIndex) {
    const tint = { g: GREEN, y: YELLOW, r: RED }[view.marks[wordIndex]];
    return { text: tint + target + RESET + " ", width: target.length + 1 };
  }
  if (wordIndex > view.wordIndex)
    return { text: DIM + target + RESET + " ", width: target.length + 1 };
  const typed = [...view.typed]
    .map((character, index) => {
      const expected = target[index];
      const tint =
        expected === character
          ? GREEN
          : expected != null && fold(expected) === fold(character)
            ? YELLOW
            : RED;
      return tint + (expected ?? character) + RESET;
    })
    .join("");
  const rest = target.slice(view.typed.length);
  const tail = rest
    ? UNDERLINE + BOLD + rest[0] + RESET + rest.slice(1) + " "
    : UNDERLINE + " " + RESET;
  return { text: typed + tail, width: Math.max(target.length, view.typed.length) + 1 };
};

const wrapTokens = (tokens, limit) =>
  tokens.reduce(
    (lines, token) => {
      const line = lines.at(-1);
      if (line.width && line.width + token.width > limit)
        lines.push({ text: token.text, width: token.width });
      else Object.assign(line, { text: line.text + token.text, width: line.width + token.width });
      return lines;
    },
    [{ text: "", width: 0 }],
  );

const renderPractice = (state) => {
  const view = project(state.run.words, state.run.config, state.run.log);
  const limit = Math.min(columns() - 4, 76);
  const body = wrapTokens(
    view.words.map((_, index) => renderWord(view, index)),
    limit,
  )
    .map((line) => "  " + line.text)
    .join("\n");
  const live =
    state.config.live === "shown" && view.events.length > 1
      ? DIM + "  " + liveStats(view) + RESET
      : "";
  return [
    DIM + "typer · practice" + RESET + live,
    "",
    body,
    "",
    DIM + "  space=next word · esc=end early" + RESET,
  ].join("\n");
};

const FIELDS = [
  { key: "source", options: ["en", "pt", "file"] },
  { key: "path", text: true, when: (config) => config.source === "file" },
  { key: "count", step: 5, min: 5 },
  { key: "gameplay", options: Object.keys(GAMEPLAYS) },
  { key: "forgiving", options: ["on", "off"] },
  { key: "recallMs", step: 250, min: 500 },
  { key: "live", options: ["shown", "hidden"] },
];
const visibleFields = (config) => FIELDS.filter((field) => !field.when || field.when(config));

const renderSetup = (state) => {
  const fields = visibleFields(state.config);
  const rows = fields.map((field, index) => {
    const selected = index === state.selected;
    const value =
      String(state.config[field.key]) + (field.text && selected ? UNDERLINE + " " + RESET : "");
    return (
      (selected ? CYAN + "▸ " : "  ") +
      field.key.padEnd(11) +
      (selected ? BOLD : DIM) +
      value +
      RESET
    );
  });
  return [
    BOLD + "typer · setup" + RESET,
    "",
    ...rows,
    "",
    state.error ? RED + "  " + state.error + RESET : "",
    DIM + "  ↑↓ field · ←→ change · type to edit · enter=start · ^c=quit" + RESET,
  ].join("\n");
};

const fit = (text, width) => (text.length > width ? text.slice(0, width - 1) + "…" : text);

const slowest = (units, limit) =>
  units
    .filter((unit) => unit.median != null)
    .sort(ascending((unit) => -unit.median))
    .slice(0, limit);

const renderReview = (state) => {
  const analysis = state.analysis;
  const limit = Math.min(columns() - 4, 90);
  const groups = groupBy(analysis.attempts, (attempt) => attempt.label);
  const splitLine = ["recall", "spelling", "motor", "clean"]
    .map((lane) => TINT[lane] + lane + RESET + DIM + " " + (groups[lane]?.length ?? 0) + RESET)
    .join(" · ");
  const wordLines = ["recall", "spelling", "motor"].flatMap((lane) => {
    const attempts = (groups[lane] ?? []).sort(
      ascending((attempt) => (lane === "recall" ? -attempt.onset : -attempt.median)),
    );
    if (!attempts.length) return [];
    const body = attempts
      .map((attempt) => attempt.target + DIM + "·" + note(attempt) + RESET)
      .join("  ");
    return ["  " + TINT[lane] + lane.padEnd(9) + RESET + fit(body, limit * 2)];
  });
  const slowKeys = slowest(analysis.units.keys, 6);
  const slowPairs = slowest(analysis.units.pairs, 6);
  return [
    BOLD +
      "typer · review" +
      RESET +
      DIM +
      `   ${analysis.span.toFixed(1)}s · ${analysis.attempts.length} words` +
      RESET,
    "",
    `  raw ${analysis.raw.toFixed(1)}  net ${analysis.net.toFixed(1)} wpm` +
      `   acc ${(100 * analysis.accuracy).toFixed(1)}% ${DIM}C${analysis.C} IF${analysis.IF} INF${analysis.INF}${RESET}` +
      `   consistency ${analysis.consistency.toFixed(0)}` +
      (analysis.peak ? `   ${GREEN}peak ${analysis.peak.best | 0}${RESET} ${DIM}floor ${analysis.peak.worst | 0}${RESET}` : ""),
    "",
    BOLD + "  spine — where the time went" + RESET + "   " + splitLine,
    ...wordLines,
    "",
    slowKeys.length
      ? "  " +
        DIM +
        "slow keys " +
        RESET +
        slowKeys.map((unit) => `${unit.unit} ${unit.median | 0}`).join("  ")
      : "",
    slowPairs.length
      ? "  " +
        DIM +
        "slow pairs" +
        RESET +
        " " +
        slowPairs.map((unit) => `${unit.unit} ${unit.median | 0}×${unit.count}`).join("  ")
      : "",
    analysis.transitions.length
      ? "  " +
        DIM +
        "transitions " +
        RESET +
        analysis.transitions
          .map((transition) => `${transition.kind} ${transition.median | 0}×${transition.count}`)
          .join("  ")
      : "",
    analysis.accents ? "  " + DIM + "accent slips " + RESET + YELLOW + analysis.accents + RESET : "",
    "",
    DIM + "  [r] same words · [n] new words · [s] setup · [q] quit" + RESET,
  ]
    .filter((line) => line !== "")
    .join("\n");
};

const render = (state) =>
  state.panel === "setup"
    ? renderSetup(state)
    : state.panel === "practice"
      ? renderPractice(state)
      : renderReview(state);

const corpus = (config) =>
  config.source === "en"
    ? EN
    : config.source === "pt"
      ? PT
      : Deno.readTextFileSync(config.path).split(/\s+/).filter(Boolean);

const start = (state, words) => {
  try {
    state.run = createRun(words ?? sample(corpus(state.config), state.config.count), state.config);
    state.panel = "practice";
    state.error = "";
  } catch {
    state.error = "cannot read " + state.config.path;
  }
};

const finish = (state) => {
  const view = project(state.run.words, state.run.config, state.run.log);
  if (!view.events.length) {
    state.panel = "setup";
    return;
  }
  state.analysis = analyze(view);
  state.panel = "review";
};

const setupKey = (state, sequence) => {
  const fields = visibleFields(state.config);
  const field = fields[state.selected];
  if (sequence === "\x1b[A") state.selected = (state.selected + fields.length - 1) % fields.length;
  else if (sequence === "\x1b[B" || sequence === "\t")
    state.selected = (state.selected + 1) % fields.length;
  else if (sequence === "\x1b[D" || sequence === "\x1b[C") {
    const direction = sequence === "\x1b[C" ? 1 : -1;
    if (field.options)
      state.config[field.key] =
        field.options[
          (field.options.indexOf(state.config[field.key]) + direction + field.options.length) %
            field.options.length
        ];
    else if (field.step)
      state.config[field.key] = Math.max(field.min, state.config[field.key] + direction * field.step);
  } else if (sequence === "\r") start(state);
  else if (sequence === "\x7f") {
    if (field.text) state.config[field.key] = state.config[field.key].slice(0, -1);
    else if (field.step)
      state.config[field.key] = Math.max(field.min, Math.floor(state.config[field.key] / 10));
  } else if (field.text && sequence >= " " && !sequence.startsWith("\x1b"))
    state.config[field.key] += sequence;
  else if (field.step && /^\d$/.test(sequence))
    state.config[field.key] = Math.max(field.min, +(String(state.config[field.key]) + sequence));
};

const practiceKey = (state, sequence) => {
  if (sequence === "\x1b") return finish(state);
  if (sequence.startsWith("\x1b")) return;
  for (const character of [...sequence]) {
    press(state.run.log, character);
    const view = project(state.run.words, state.run.config, state.run.log);
    if (view.dead) return start(state, state.run.words);
    if (view.done) return finish(state);
  }
};

const reviewKey = (state, sequence) => {
  if (sequence === "r") start(state, state.run.words);
  else if (sequence === "n") start(state);
  else if (sequence === "s") state.panel = "setup";
  else if (sequence === "q") state.quit = true;
};

const main = async () => {
  const state = {
    panel: "setup",
    selected: 0,
    error: "",
    run: null,
    analysis: null,
    quit: false,
    config: defaultConfig({ path: "" }),
  };
  Deno.stdin.setRaw(true);
  write("\x1b[?25l\x1b[2J");
  const draw = () => write("\x1b[H\x1b[J" + render(state) + "\n");
  try {
    draw();
    for await (const chunk of Deno.stdin.readable) {
      const sequence = decoder.decode(chunk, { stream: true });
      if (sequence === "\x03") break;
      (state.panel === "setup"
        ? setupKey
        : state.panel === "practice"
          ? practiceKey
          : reviewKey)(state, sequence);
      if (state.quit) break;
      draw();
    }
  } finally {
    write("\x1b[?25h" + RESET + "\x1b[2J\x1b[H");
    Deno.stdin.setRaw(false);
  }
};

export * from "./engine.js";
export { EN, PT };

if (import.meta.main) main();
