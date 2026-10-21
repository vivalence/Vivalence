export const CAUTION = 85;

export const Prog = (props) => (
  <div class="block prog">
    <span class="lbl">{props.label}</span>
    <span class="track">
      <span class="fill" classList={{ done: props.done, cau: !props.done && props.pct >= CAUTION }} style={{ width: `${props.pct}%` }} />
    </span>
    <span class="pct">{props.done ? "done" : `${props.pct} %`}</span>
  </div>
);
