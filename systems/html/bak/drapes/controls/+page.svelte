<script>
  import { Header, Paragraph } from "@vivalence/drapes";
  import { Button, Input, Textarea, Link } from "@vivalence/drapes";

  let inputValue = $state("");
  let textareaValue = $state("");
  let clickCount = $state(0);
</script>

<div class="max-w-3xl space-y-12">

  <div>
    <Header size="3xl">Controls</Header>
    <Paragraph class="mt-2">
      Interactive components for user input and actions.
    </Paragraph>
  </div>

  <section class="space-y-4">
    <Header size="2xl">Button</Header>
    
    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Variants
      </Paragraph>
      <div class="flex flex-wrap gap-2 p-4 bg-skeleton-2-surface rounded">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="error">Error</Button>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Sizes
      </Paragraph>
      <div class="flex flex-wrap items-center gap-2 p-4 bg-skeleton-2-surface rounded">
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button size="md">MD</Button>
        <Button size="lg">LG</Button>
        <Button size="xl">XL</Button>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        States
      </Paragraph>
      <div class="flex flex-wrap gap-2 p-4 bg-skeleton-2-surface rounded">
        <Button onclick={() => clickCount++}>
          Clicked {clickCount} times
        </Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Input</Header>
    
    <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
      <Input 
        bind:value={inputValue}
        placeholder="Type something..."
      />
      <Paragraph size="sm">Value: {inputValue || "(empty)"}</Paragraph>
    </div>

    <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
      <Input 
        placeholder="Small input"
        size="sm"
      />
      <Input 
        placeholder="Medium input (default)"
        size="md"
      />
      <Input 
        placeholder="Large input"
        size="lg"
      />
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Textarea</Header>
    
    <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
      <Textarea 
        bind:value={textareaValue}
        placeholder="Write something longer..."
      />
      <Paragraph size="sm">
        {textareaValue.length} characters
      </Paragraph>
    </div>
  </section>

  <section class="space-y-4">
    <Header size="2xl">Link</Header>
    
    <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
      <div>
        <Link href="/drapes/decor">Default link style</Link>
      </div>
      <div>
        <Link href="/drapes/display" variant="nav">Nav link style</Link>
      </div>
      <div>
        <Link href="/drapes/controls" variant="nav" active>Active nav link</Link>
      </div>
    </div>
  </section>

</div>
