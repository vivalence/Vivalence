
<script>
  import { Header, Paragraph, Text } from "@vivalence/drapes";
  import { Plane, Box, Shelve } from "@vivalence/drapes";
</script>

<div class="max-w-4xl space-y-12">
  <div>
    <Header size="3xl">Triage</Header>
    <Paragraph class="mt-2">
      Layout primitives based on CSS Grid for structuring your interface.
      BSP-inspired spatial organization.
    </Paragraph>
  </div>

  <section class="space-y-4">
    <Header size="2xl">Plane</Header>
    <Paragraph>
      Base grid container. All layouts start with a Plane.
    </Paragraph>

    <div class="space-y-3">
      <Text weight="medium">Basic Plane</Text>
      <Plane class="h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded p-4">
        <Text>Content inside a plane</Text>
      </Plane>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Plane with multiple children</Text>
      <Plane class="h-64 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text>Child 1</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text>Child 2</Text>
        </Box>
        <Box class="bg-theme-accent-surface p-4 rounded">
          <Text>Child 3</Text>
        </Box>
      </Plane>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Shelve</Header>
    <Paragraph>
      Directional layout container. Use =across= or =down= to set flow direction.
    </Paragraph>

    <div class="space-y-3">
      <Text weight="medium">Horizontal Shelve (across)</Text>
      <Shelve across class="h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text>Item 1</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text>Item 2</Text>
        </Box>
        <Box class="bg-theme-accent-surface p-4 rounded">
          <Text>Item 3</Text>
        </Box>
      </Shelve>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Vertical Shelve (down)</Text>
      <Shelve down class="h-64 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text>Item 1</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text>Item 2</Text>
        </Box>
        <Box class="bg-theme-accent-surface p-4 rounded">
          <Text>Item 3</Text>
        </Box>
      </Shelve>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Box</Header>
    <Paragraph>
      Individual container within a layout. Wraps Plane with semantic naming.
    </Paragraph>

    <div class="space-y-3">
      <Text weight="medium">Boxes in a Shelve</Text>
      <Shelve across class="h-48 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="bg-theme-primary-surface p-6 rounded flex items-center justify-center">
          <div class="text-center">
            <Text variant="heading" size="xl">Box 1</Text>
            <Text size="sm" class="mt-2">Primary content area</Text>
          </div>
        </Box>
        <Box class="bg-theme-secondary-surface p-6 rounded flex items-center justify-center">
          <div class="text-center">
            <Text variant="heading" size="xl">Box 2</Text>
            <Text size="sm" class="mt-2">Secondary content</Text>
          </div>
        </Box>
      </Shelve>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Complex Layouts</Header>
    <Paragraph>
      Combining Shelve and Box to create sophisticated layouts.
    </Paragraph>

    <div class="space-y-3">
      <Text weight="medium">Nested Layout (Sidebar + Main)</Text>
      <Shelve across class="h-96 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="w-48 bg-skeleton-3-surface p-4 rounded">
          <Text variant="heading" size="lg" class="mb-4">Sidebar</Text>
          <Shelve down class="gap-2">
            <Box class="bg-skeleton-1-surface p-2 rounded">
              <Text size="sm">Nav Item 1</Text>
            </Box>
            <Box class="bg-skeleton-1-surface p-2 rounded">
              <Text size="sm">Nav Item 2</Text>
            </Box>
            <Box class="bg-skeleton-1-surface p-2 rounded">
              <Text size="sm">Nav Item 3</Text>
            </Box>
          </Shelve>
        </Box>
        
        <Box class="flex-1 bg-skeleton-3-surface p-4 rounded">
          <Text variant="heading" size="lg" class="mb-4">Main Content</Text>
          <Paragraph>
            This is the main content area. It takes up remaining space
            while the sidebar has a fixed width.
          </Paragraph>
        </Box>
      </Shelve>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Three Column Layout</Text>
      <Shelve across class="h-96 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="flex-1 bg-theme-primary-surface p-4 rounded">
          <Text variant="heading" size="lg">Left</Text>
        </Box>
        <Box class="flex-[2] bg-theme-secondary-surface p-4 rounded">
          <Text variant="heading" size="lg">Center (2x width)</Text>
        </Box>
        <Box class="flex-1 bg-theme-accent-surface p-4 rounded">
          <Text variant="heading" size="lg">Right</Text>
        </Box>
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
          <Paragraph>
            Main content goes here. This takes up the remaining vertical space.
          </Paragraph>
        </Box>
        
        <Box class="h-12 bg-skeleton-3-surface p-4 rounded flex items-center justify-between">
          <Text>Footer</Text>
          <Text size="sm">© 2024</Text>
        </Box>
      </Shelve>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Grid Classes</Header>
    <Paragraph>
      Use BSP grid utility classes directly on Plane for precise control.
    </Paragraph>

    <div class="space-y-3">
      <Text weight="medium">V2 - Two Rows</Text>
      <Plane class="v2 h-48 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text>Row 1</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text>Row 2</Text>
        </Box>
      </Plane>
    </div>

    <div class="space-y-3">
      <Text weight="medium">H3 - Three Columns</Text>
      <Plane class="h3 h-64 bg-skeleton-2-surface border border-skeleton-1-boundary rounded gap-2 p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text>Col 1</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text>Col 2</Text>
        </Box>
        <Box class="bg-theme-accent-surface p-4 rounded">
          <Text>Col 3</Text>
        </Box>
      </Plane>
    </div>

    <div class="space-y-3">
      <Text weight="medium">Gap Utilities</Text>
      <Shelve across class="h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text size="sm">No gap (default)</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text size="sm">Between boxes</Text>
        </Box>
      </Shelve>
      
      <Shelve across class="gap-4 h-32 bg-skeleton-2-surface border border-skeleton-1-boundary rounded p-2">
        <Box class="bg-theme-primary-surface p-4 rounded">
          <Text size="sm">gap-4</Text>
        </Box>
        <Box class="bg-theme-secondary-surface p-4 rounded">
          <Text size="sm">Between boxes</Text>
        </Box>
      </Shelve>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Usage Guidelines</Header>
    
    <div class="p-6 bg-skeleton-2-surface rounded-lg space-y-4">
      <div>
        <Text weight="medium" class="mb-2">When to use Plane</Text>
        <Paragraph size="sm">
          Use Plane when you need a simple grid container without directional
          flow. Good for custom grid templates or when you need direct access
          to CSS Grid properties.
        </Paragraph>
      </div>

      <div>
        <Text weight="medium" class="mb-2">When to use Shelve</Text>
        <Paragraph size="sm">
          Use Shelve for directional layouts. =across= for horizontal flow
          (navigation bars, toolbars), =down= for vertical flow (sidebars,
          forms, content sections).
        </Paragraph>
      </div>

      <div>
        <Text weight="medium" class="mb-2">When to use Box</Text>
        <Paragraph size="sm">
          Use Box as semantic containers within Shelve/Plane. They're thin
          wrappers that make layout intention clearer and accept area
          properties for named grid areas.
        </Paragraph>
      </div>

      <div>
        <Text weight="medium" class="mb-2">Combining with Tailwind</Text>
        <Paragraph size="sm">
          All triage components accept standard Tailwind classes. Use flex
          utilities (flex-1, flex-[2]) for proportional sizing, standard
          spacing (gap-2, gap-4) for gaps, and positioning utilities as needed.
        </Paragraph>
      </div>
    </div>
  </section>
</div>
