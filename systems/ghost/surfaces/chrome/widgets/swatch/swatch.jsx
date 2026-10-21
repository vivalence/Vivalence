export function Swatch(props) {
  return (
    <box style={{ backgroundColor: props.fill, justifyContent: "center", alignItems: "center", ...props.style }}>
      <text fg={props.ink}>
        <b>{props.name}</b>
      </text>
    </box>
  );
}
