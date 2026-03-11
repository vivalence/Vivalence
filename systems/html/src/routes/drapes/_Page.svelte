<script>
  import { Header, Paragraph } from "@vivalence/drapes";
  let { title, description, children, class: cls = "max-w-3xl" } = $props();
</script>

<div class="{cls} space-y-12">
  <div>
    <Header size="3xl">{title}</Header>
    <Paragraph class="mt-2">{description}</Paragraph>
  </div>
  {@render children()}
</div>
