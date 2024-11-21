<script>
  let { nav, icon, content, link, size = "md", classes } = $props();

  const sizes = {
    sm: "h-6 max-h-6",
    md: "h-8 max-h-8",
    lg: "h-10 max-h-10",
    xl: "h-12 max-h-12",
  };
</script>

<div class="row {sizes[size]} {classes?.row}">
  <div class="icon icon1 {classes?.nav}">{@render nav?.()}</div>
  <div class="icon icon2 {classes?.icon}">{@render icon?.()}</div>
  <div class="content {classes?.content}">{@render content?.()}</div>
  <div class="icon icon3 {classes?.link}">{@render link?.()}</div>
</div>

<style>
  * {
    /* border: 1px solid red; */
  }
  .row {
    @apply items-center;
    display: grid;
    grid-template-areas: "icon1 icon2 content icon3";
    grid-template-columns: 30px 30px 1fr 40px;
    align-items: center;
    min-width: 0;
  }
  .row > div {
    @apply flex items-center w-full h-full;
  }
  .row > .icon {
    @apply mx-auto justify-center text-center;
  }

  .icon1 {
    grid-area: icon1;
  }
  .icon2 {
    grid-area: icon2;
  }
  .content {
    grid-area: content;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .icon3 {
    grid-area: icon3;
  }
</style>
