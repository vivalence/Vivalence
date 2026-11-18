import { Icon } from "./Icon.jsx";

const TAILS = [
  [(text, tail) => text === "" && tail === "", () => "listening"],
  [(text, tail) => text === "" || tail === "", (text, tail) => tail],
  [() => true, (text, tail) => ` ${tail}`],
];

const tailed = (text, tail) => TAILS.find(([test]) => test(text, tail))[1](text, tail);

export const Dictfault = (props) => (
  <div class="dictline fault">
    <span class="words" title={props.message}>
      <span class="spoken">dictation failed</span>
      <span class="tail">{` ${props.message}`}</span>
    </span>
    <button
      class="iconbtn trash"
      aria-label="dismiss the fault"
      title="dismiss · /dictate/trash"
      onClick={() => props.onTrash()}>
      <Icon name="trash" size={14} />
    </button>
  </div>
);

export const Dictline = (props) => (
  <div class="dictline">
    <span class="words">
      <span class="spoken">{props.text}</span>
      <span class="tail">{tailed(props.text, props.tail)}</span>
      <span class="live">▍</span>
    </span>
    <button
      class="iconbtn trash"
      aria-label="trash the words"
      title="trash · /dictate/trash"
      onClick={() => props.onTrash()}>
      <Icon name="trash" size={14} />
    </button>
  </div>
);
