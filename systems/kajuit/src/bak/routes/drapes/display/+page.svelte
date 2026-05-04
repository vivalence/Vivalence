<script>
  import { Header, Paragraph, Label, Tag, Button } from "@vivalence/drapes";
  import Page from "../_Page.svelte";
  import Section from "../_Section.svelte";
  import Demo from "../_Demo.svelte";

  let tags = $state([
    { id: 1, text: "Design", variant: "primary" },
    { id: 2, text: "Development", variant: "secondary" },
    { id: 3, text: "Research", variant: "accent" },
  ]);

  const tagVariants = ["default","primary","secondary","accent","info","success","warning","danger","error"];
</script>

<Page title="Display" description="Components for displaying information and content structure.">

  <Section title="Header" description="Semantic heading component with optional actions slot.">
    <Demo label="Sizes" class="space-y-3">
      {#each ["sm","md","lg","xl","2xl","3xl","4xl"] as s}
        <Header size={s}>{s.toUpperCase()} header</Header>
      {/each}
    </Demo>

    <Demo label="With Actions" class="space-y-3">
      <Header size="xl">
        Settings
        {#snippet actions()}
          <Button size="sm" variant="secondary">Edit</Button>
          <Button size="sm" variant="primary">Save</Button>
        {/snippet}
      </Header>
    </Demo>

    <Demo label="Semantic HTML (as prop)" class="space-y-2">
      {#each [["h1","4xl"],["h2","3xl"],["h3","2xl"],["h4","xl"]] as [as, size]}
        <Header {as} {size}>{as.toUpperCase()} Heading</Header>
      {/each}
    </Demo>
  </Section>

  <Section title="Paragraph" description="Semantic prose component with size variants.">
    <Demo class="space-y-3">
      {#each ["sm","md","lg"] as s}
        <Paragraph size={s}>
          {s[0].toUpperCase() + s.slice(1)} paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Paragraph>
      {/each}
    </Demo>
  </Section>

  <Section title="Label" description="Form label component with required indicator support.">
    <Demo class="space-y-3">
      <div><Label>Standard label</Label></div>
      <div><Label required>Required field label</Label></div>
      {#each ["sm","md","lg"] as s}
        <div><Label size={s}>{s[0].toUpperCase() + s.slice(1)} label</Label></div>
      {/each}
    </Demo>
  </Section>

  <Section title="Tag" description="Pill-shaped labels for categorization and status indication.">
    <Demo label="Variants" class="flex flex-wrap gap-2">
      {#each tagVariants as v}
        <Tag variant={v}>{v[0].toUpperCase() + v.slice(1)}</Tag>
      {/each}
    </Demo>

    <Demo label="Sizes" class="flex flex-wrap items-center gap-2">
      {#each ["xs","sm","md","lg"] as s}
        <Tag size={s} variant="primary">{s.toUpperCase()}</Tag>
      {/each}
    </Demo>

    <Demo label="Removable Tags" class="flex flex-wrap gap-2">
      {#each tags as tag (tag.id)}
        <Tag variant={tag.variant} removable onRemove={() => tags = tags.filter(t => t.id !== tag.id)}>
          {tag.text}
        </Tag>
      {/each}
    </Demo>

    <Demo label="Interactive Tags" class="flex flex-wrap gap-2">
      <Tag variant="secondary" onclick={() => alert('Tag clicked!')} class="cursor-pointer hover:opacity-80">
        Clickable
      </Tag>
    </Demo>
  </Section>

</Page>
