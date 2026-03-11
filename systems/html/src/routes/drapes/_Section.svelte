<script>
  import { Header, Paragraph } from "@vivalence/drapes";
  let { title, description = "", children } = $props();
</script>

<section class="space-y-4">
  <Header size="2xl">{title}</Header>
  {#if description}<Paragraph>{description}</Paragraph>{/if}
  {@render children()}
</section>
