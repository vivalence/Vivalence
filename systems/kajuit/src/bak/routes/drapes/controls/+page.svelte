<script>
  import { Button, Input, Textarea, Link } from "@vivalence/drapes";
  import Page from "../_Page.svelte";
  import Section from "../_Section.svelte";
  import Demo from "../_Demo.svelte";
  import { Paragraph } from "@vivalence/drapes";

  let inputValue = $state("");
  let textareaValue = $state("");
  let clickCount = $state(0);
</script>

<Page title="Controls" description="Interactive components for user input and actions.">

  <Section title="Button">
    <Demo label="Variants" class="flex flex-wrap gap-2">
      {#each ["primary","secondary","accent","success","warning","error"] as v}
        <Button variant={v}>{v[0].toUpperCase() + v.slice(1)}</Button>
      {/each}
    </Demo>

    <Demo label="Sizes" class="flex flex-wrap items-center gap-2">
      {#each ["xs","sm","md","lg","xl"] as s}
        <Button size={s}>{s.toUpperCase()}</Button>
      {/each}
    </Demo>

    <Demo label="States" class="flex flex-wrap gap-2">
      <Button onclick={() => clickCount++}>Clicked {clickCount} times</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </Demo>
  </Section>

  <Section title="Input">
    <Demo class="space-y-3">
      <Input bind:value={inputValue} placeholder="Type something..." />
      <Paragraph size="sm">Value: {inputValue || "(empty)"}</Paragraph>
    </Demo>

    <Demo class="space-y-3">
      {#each ["sm","md","lg"] as s}
        <Input placeholder="{s[0].toUpperCase() + s.slice(1)} input" size={s} />
      {/each}
    </Demo>
  </Section>

  <Section title="Textarea">
    <Demo class="space-y-3">
      <Textarea bind:value={textareaValue} placeholder="Write something longer..." />
      <Paragraph size="sm">{textareaValue.length} characters</Paragraph>
    </Demo>
  </Section>

  <Section title="Link">
    <Demo class="space-y-3">
      <div><Link href="/drapes/decor">Default link style</Link></div>
      <div><Link href="/drapes/display" variant="nav">Nav link style</Link></div>
      <div><Link href="/drapes/controls" variant="nav" active>Active nav link</Link></div>
    </Demo>
  </Section>

</Page>
