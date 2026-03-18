<script module>
  const STYLE = "position:fixed;opacity:0;height:1px;overflow:hidden;left:-9999px"
</script>

<script>
  let { oninput = () => {}, inputmode = "text" } = $props()
  let input = $state()

  export const focus = () => input?.focus()
  export const blur = () => input?.blur()
  export const guard = (event) => { event.preventDefault(); input?.focus() }
</script>

<input
  bind:this={input}
  style={STYLE}
  {inputmode}
  autocomplete="off"
  oninput={(event) => { oninput(event.target.value); event.target.value = "" }}
/>
