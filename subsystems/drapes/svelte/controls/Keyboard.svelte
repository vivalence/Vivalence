<script module>
  const STYLE = "position:fixed;opacity:0;height:1px;width:1px;overflow:hidden;left:-9999px"
</script>

<script>
  import { persist } from "./persist.js"
  let { oninput = () => {}, inputmode = "text", retain = false, ...rest } = $props()
  let input = $state()

  export const focus = () => input?.focus({ preventScroll: true })
  export const blur = () => input?.blur()
  export const guard = (event) => { event.preventDefault(); input?.focus({ preventScroll: true }) }
</script>

<input
  bind:this={input}
  use:persist={{ active: retain }}
  style={STYLE}
  {inputmode}
  autocomplete="off"
  autocapitalize="off"
  autocorrect="off"
  spellcheck="false"
  {...rest}
  oninput={(event) => { oninput(event.target.value); event.target.value = "" }}
/>
