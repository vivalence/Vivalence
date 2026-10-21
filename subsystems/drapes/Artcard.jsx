import { For } from "solid-js";
import { Icon } from "./Icon.jsx";

export const Artcard = (props) => (
  <div class="artcard" classList={{ inframe: props.inframe }}>
    <div class="ah">
      <span class="sign">◆</span>
      <span class="al">artifact</span>
      <span>{props.mode}</span>
      <label class="asel" title={props.picks.map((pick) => pick.title).join("\n")}>
        <select aria-label="artifact" onChange={(event) => props.onPick(event.currentTarget.value)}>
          <For each={props.picks}>
            {(pick) => (
              <option value={pick.signal} selected={pick.current}>
                {pick.label}
              </option>
            )}
          </For>
        </select>
        <Icon name="chev" size={12} />
      </label>
      <button class="iconbtn full" aria-label="fullscreen" title={`fullscreen · /buffer/full ${props.label}`} onClick={() => props.onFull()}>
        <Icon name="expand" />
      </button>
    </div>
    {props.children}
  </div>
);
