<script>
  let { url = "", title = "" } = $props();
</script>

<object data={url} type="application/pdf" {title} class="pdf">
  <a href={url} target="_blank" rel="noreferrer noopener">open {title || "the pdf"}</a>
</object>

<style>
  .pdf {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 60vh;
    border: none;
  }
</style>
