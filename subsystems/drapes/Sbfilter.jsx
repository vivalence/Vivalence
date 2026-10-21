import { Icon } from "./Icon.jsx";

export const Sbfilter = (props) => (
  <div class="sbfilter">
    <button
      class={["fpick", props.row.pick && "open", props.row.dim && "dim"].filter((word) => word).join(" ")}
      aria-label="filter by daemon or trait"
      aria-expanded={props.row.pick ? "true" : "false"}
      title="by daemon · trait — /filter/daemon · /filter/trait"
      onClick={() => props.onAct({ fn: "dpick", arg: props.row.kind })}>
      <Icon name="find" size={13} />
    </button>
    <input
      id={`${props.pre}f-${props.row.kind}`}
      data-filter={props.row.kind}
      value={props.row.q}
      placeholder={props.row.ph}
      aria-label={props.row.ph}
      spellcheck="false"
      autocomplete="off"
      onInput={(event) => props.onFilter(props.row.kind, event.target.value)}
    />
    <span>{props.row.count}</span>
  </div>
);
