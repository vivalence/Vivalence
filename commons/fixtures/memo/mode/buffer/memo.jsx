import { createEffect, createSignal, from, on, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { Empty, paint, usePalette } from "@vivalence/sheets";

const LIMIT = 10;
const GRADES = { 1: "AGAIN", 2: "HARD", 3: "GOOD", 4: "EASY" };

const horizon = (hours) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
};

export function Memo(props) {
  const palette = usePalette();
  const { mode, thread, buffer } = props.terminal;
  const data = from(buffer.$data);
  const [deck, setDeck] = createSignal(null);
  const [at, setAt] = createSignal(0);
  const [revealed, setRevealed] = createSignal(false);
  const [graded, setGraded] = createSignal(0);
  const [fault, setFault] = createSignal(null);

  const hold = (held) => {
    setDeck(held);
    setAt(0);
    setRevealed(false);
  };
  const deal = () => mode.connection.call("/deck", { limit: LIMIT }).then(hold, (error) => setFault(error.message));
  const card = () => (deck() === null || at() >= deck().cards.length ? null : deck().cards[at()]);
  const grade = (signal) => {
    const held = card();
    setRevealed(false);
    setAt(at() + 1);
    setGraded(graded() + 1);
    return mode.connection.call("/grade", { card: held.slug, signal, thread: thread.id }).catch((error) => setFault(error.message));
  };
  const grades = () => Object.entries(GRADES).map(([key, signal]) => `${key} ${signal.toLowerCase()} ${horizon(card().preview[signal])}`).join(" · ");
  const freight = () => [card().voice === null ? null : "♪ voice", card().picture === null ? null : "▣ picture"].filter((held) => held !== null).join(" · ");

  createEffect(on(data, (held) => (held.deck === undefined ? deal() : hold({ language: held.language, cards: held.deck }))));

  useKeyboard((key) => {
    if (deck() === null) return;
    if (key.name === "tab") {
      key.stopPropagation();
      key.preventDefault();
      if (card() === null) deal();
      else setRevealed(true);
      return;
    }
    if (!revealed() || !Object.hasOwn(GRADES, key.name)) return;
    key.stopPropagation();
    key.preventDefault();
    grade(GRADES[key.name]);
  });

  return (
    <box style={{ flexDirection: "column", flexGrow: 1, gap: 1 }}>
      <Show when={fault() !== null}>
        <text fg={palette.signalNegative}>{`✕ ${fault()}`}</text>
      </Show>
      <Show when={deck() !== null} fallback={<Empty>dealing…</Empty>}>
        <Show when={card() !== null} fallback={<Empty>{`sessio peracta · ${graded()} graded — tab deals again`}</Empty>}>
          <text fg={palette.textMuted}>{`${at() + 1}/${deck().cards.length} · ${card().ontology} · ${card().status.toLowerCase()} · ${deck().language.learning}`}</text>
          <text fg={palette.textStrong}>{card().learning}</text>
          <Show when={revealed()} fallback={<text fg={palette.textMuted}>tab reveals</text>}>
            <text fg={palette.textMuted}>{deck().language.known}</text>
            <text fg={palette.textInk}>{card().known}</text>
            <Show when={card().example !== null}>
              <text fg={palette.textMuted}>{`${card().example.learning} — ${card().example.known}`}</text>
            </Show>
            <Show when={freight() !== ""}>
              <text fg={palette.textMuted}>{freight()}</text>
            </Show>
            <text fg={palette.textMuted}>{grades()}</text>
          </Show>
        </Show>
      </Show>
    </box>
  );
}

export default (element, terminal, { renderer, palette }) => ({ destroy: paint(element, renderer, palette, Memo, { terminal }) });
