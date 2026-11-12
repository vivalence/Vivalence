import { Icon } from "./Icon.jsx";

export const Artchip = (props) => (
  <div class="artchip" classList={{ inframe: props.inframe }}>
    <button class="open" title={`frame · ${props.label}`} onClick={() => props.onOpen()}>
      <span class="sign">◆</span>
      <span class="al">{props.label}</span>
      <span class="am">{props.mode}</span>
    </button>
    <button class="iconbtn full" aria-label="fullscreen" title={`fullscreen · /buffer/full ${props.label}`} onClick={() => props.onFull()}>
      <Icon name="expand" size={12} />
    </button>
  </div>
);
