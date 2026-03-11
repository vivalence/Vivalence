<script>
  import { Text, Paragraph } from "@vivalence/drapes";
  import { Plane, Box, Shelve } from "@vivalence/drapes";
  import Page from "../_Page.svelte";
  import Section from "../_Section.svelte";
  import Demo from "../_Demo.svelte";

  const guidelines = [
    ["When to use Plane", "Use Plane when you need a simple grid container without directional flow. Good for custom grid templates or direct CSS Grid access."],
    ["When to use Shelve", "Use Shelve for directional layouts. =across= for horizontal flow (navigation bars, toolbars), =down= for vertical flow (sidebars, forms, content sections)."],
    ["When to use Box", "Use Box as semantic containers within Shelve/Plane. Thin wrappers that make layout intention clearer and accept area properties for named grid areas."],
    ["Combining with Tailwind", "All triage components accept standard Tailwind classes. Use flex utilities (flex-1, flex-[2]) for proportional sizing, standard spacing (gap-2, gap-4) for gaps, and positioning utilities as needed."],
  ];
</script>

{#snippet colorBox(label, bg)}
  <Box class="{bg} p-4 rounded"><Text>{label}</Text></Box>
{/snippet}

<Page title="Triage" description="Layout primitives based on CSS Grid. BSP-inspired spatial organization." class="max-w-4xl">

  <Section title="Plane" description="Base grid container. All layouts start with a Plane.">
    <div class="space-y-3">
      <Text weight="medium">Basic Plane</Text>
      <Plane class="h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded p-4">
        <Text>Content inside a plane</Text>
      </Plane>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Plane with multiple children</Text>
      <Plane class="h-64 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        {@render colorBox("Child 1", "bg-theme-primary-surface")}
        {@render colorBox("Child 2", "bg-theme-secondary-surface")}
        {@render colorBox("Child 3", "bg-theme-accent-surface")}
      </Plane>
    </div>
  </Section>

  <Section title="Shelve" description="Directional layout container. Use =across= or =down= to set flow direction.">
    <div class="space-y-3">
      <Text weight="medium">Horizontal Shelve (across)</Text>
      <Shelve across class="h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        {@render colorBox("Item 1", "bg-theme-primary-surface")}
        {@render colorBox("Item 2", "bg-theme-secondary-surface")}
        {@render colorBox("Item 3", "bg-theme-accent-surface")}
      </Shelve>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Vertical Shelve (down)</Text>
      <Shelve down class="h-64 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        {@render colorBox("Item 1", "bg-theme-primary-surface")}
        {@render colorBox("Item 2", "bg-theme-secondary-surface")}
        {@render colorBox("Item 3", "bg-theme-accent-surface")}
      </Shelve>
    </div>
  </Section>

  <Section title="Box" description="Individual container within a layout. Wraps Plane with semantic naming.">
    <div class="space-y-3">
      <Text weight="medium">Boxes in a Shelve</Text>
      <Shelve across class="h-48 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        {#each [["Box 1","Primary content area","bg-theme-primary-surface"],["Box 2","Secondary content","bg-theme-secondary-surface"]] as [title, sub, bg]}
          <Box class="{bg} p-6 rounded flex items-center justify-center">
            <div class="text-center">
              <Text variant="heading" size="xl">{title}</Text>
              <Text size="sm" class="mt-2">{sub}</Text>
            </div>
          </Box>
        {/each}
      </Shelve>
    </div>
  </Section>

  <Section title="Complex Layouts" description="Combining Shelve and Box to create sophisticated layouts.">
    <div class="space-y-3">
      <Text weight="medium">Nested Layout (Sidebar + Main)</Text>
      <Shelve across class="h-96 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="w-48 bg-skeleton-3-surface p-4 rounded">
          <Text variant="heading" size="lg" class="mb-4">Sidebar</Text>
          <Shelve down class="gap-2">
            {#each [1,2,3] as n}
              <Box class="bg-skeleton-1-surface p-2 rounded"><Text size="sm">Nav Item {n}</Text></Box>
            {/each}
          </Shelve>
        </Box>
        <Box class="flex-1 bg-skeleton-3-surface p-4 rounded">
          <Text variant="heading" size="lg" class="mb-4">Main Content</Text>
          <Paragraph>Main content area. Takes up remaining space while sidebar has fixed width.</Paragraph>
        </Box>
      </Shelve>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Three Column Layout</Text>
      <Shelve across class="h-96 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="flex-1 bg-theme-primary-surface p-4 rounded"><Text variant="heading" size="lg">Left</Text></Box>
        <Box class="flex-[2] bg-theme-secondary-surface p-4 rounded"><Text variant="heading" size="lg">Center (2x width)</Text></Box>
        <Box class="flex-1 bg-theme-accent-surface p-4 rounded"><Text variant="heading" size="lg">Right</Text></Box>
      </Shelve>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Header + Content + Footer</Text>
      <Shelve down class="h-96 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="h-16 bg-skeleton-3-surface p-4 rounded flex items-center">
          <Text variant="heading" size="lg">Header</Text>
        </Box>
        <Box class="flex-1 bg-skeleton-3-surface p-4 rounded">
          <Text variant="heading" size="lg" class="mb-2">Content Area</Text>
          <Paragraph>Main content goes here. Takes up remaining vertical space.</Paragraph>
        </Box>
        <Box class="h-12 bg-skeleton-3-surface p-4 rounded flex items-center justify-between">
          <Text>Footer</Text>
          <Text size="sm">© 2024</Text>
        </Box>
      </Shelve>
    </div>
  </Section>

  <Section title="Grid Classes" description="Use BSP grid utility classes directly on Plane for precise control.">
    <div class="space-y-3">
      <Text weight="medium">V2 - Two Rows</Text>
      <Plane class="v2 h-48 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        {@render colorBox("Row 1", "bg-theme-primary-surface")}
        {@render colorBox("Row 2", "bg-theme-secondary-surface")}
      </Plane>
    </div>

    <div class="space-y-3">
      <Text weight="medium">H3 - Three Columns</Text>
      <Plane class="h3 h-64 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        {@render colorBox("Col 1", "bg-theme-primary-surface")}
        {@render colorBox("Col 2", "bg-theme-secondary-surface")}
        {@render colorBox("Col 3", "bg-theme-accent-surface")}
      </Plane>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Gap Utilities</Text>
      <Shelve across class="h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded p-2">
        {@render colorBox("No gap (default)", "bg-theme-primary-surface")}
        {@render colorBox("Between boxes", "bg-theme-secondary-surface")}
      </Shelve>
      <Shelve across class="gap-4 h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded p-2">
        {@render colorBox("gap-4", "bg-theme-primary-surface")}
        {@render colorBox("Between boxes", "bg-theme-secondary-surface")}
      </Shelve>
    </div>
  </Section>

  <Section title="Usage Guidelines">
    <div class="p-6 bg-skeleton-2-surface rounded-lg space-y-4">
      {#each guidelines as [title, desc]}
        <div>
          <Text weight="medium" class="mb-2">{title}</Text>
          <Paragraph size="sm">{desc}</Paragraph>
        </div>
      {/each}
    </div>
  </Section>

</Page>
