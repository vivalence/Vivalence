<script>
  import { Text, Pictogram } from "@vivalence/drapes";
  import Page from "../_Page.svelte";
  import Section from "../_Section.svelte";
  import Demo from "../_Demo.svelte";

  const textVariants = [
    ["heading", "xl", "Heading variant (Poppins)"],
    ["text", "md", "Text variant (Inter)"],
    ["serif-heading", "xl", "Serif heading (Sabon)"],
    ["serif-text", "md", "Serif text (Sabon)"],
    ["brand", "lg", "Brand variant (K2D)"],
    ["code", "sm", "Code variant (Source Code Pro)"],
  ];

  const textColors = [
    ["1", "Skeleton 1 (default)"],
    ["2", "Skeleton 2"],
    ["3", "Skeleton 3"],
    ["theme-primary", "Theme primary"],
    ["theme-accent", "Theme accent"],
    ["system-success", "System success"],
    ["system-warning", "System warning"],
    ["system-error", "System error"],
  ];

  const pictoSizes = ["xs","sm","md","lg","xl","2xl"];
  const fits = ["contain","cover","auto"];
  const ratios = [["1/1","square"],["16/9","video"],["4/3","classic"]];
</script>

<Page title="Decor" description="Foundational components for text and media presentation.">

  <Section title="Text" description="Semantic typography with multiple variants, sizes, weights, and color options.">
    <Demo label="Variants" class="space-y-3">
      {#each textVariants as [variant, size, label]}
        <Text {variant} {size}>{label}</Text>
      {/each}
    </Demo>

    <Demo label="Sizes" class="space-y-2">
      {#each ["xs","sm","md","lg","xl","2xl","3xl"] as s}
        <Text size={s}>{s === "md" ? "Medium text (default)" : `${s.toUpperCase()} text`}</Text>
      {/each}
    </Demo>

    <Demo label="Weights" class="space-y-2">
      {#each ["thin","light","regular","medium","bold"] as w}
        <Text weight={w}>{w[0].toUpperCase() + w.slice(1)} weight{w === "regular" ? " (default)" : ""}</Text>
      {/each}
    </Demo>

    <Demo label="Colors" class="space-y-2">
      {#each textColors as [color, label]}
        <Text {color}>{label}</Text>
      {/each}
    </Demo>

    <Demo label="Semantic HTML Elements" class="space-y-2">
      {#each [["h1","3xl"],["h2","2xl"],["h3","xl"]] as [as, size]}
        <Text {as} variant="heading" {size}>{as.toUpperCase()} Heading</Text>
      {/each}
      <Text as="p">Paragraph text</Text>
      <Text as="span">Inline span</Text>
    </Demo>

    <Demo label="Modes" class="space-y-4">
      <Text mode="default">Default mode (left-aligned)</Text>
      <Text mode="centered">Centered mode</Text>
    </Demo>
  </Section>

  <Section title="Pictogram" description="Media component for images, videos, and animated content with semantic sizing.">
    <Demo label="Sizes (aligned with text)" class="flex flex-wrap items-center gap-4">
      {#each pictoSizes as s}
        <Pictogram src="https://api.dicebear.com/7.x/shapes/svg?seed={s}" size={s} alt={s.toUpperCase()} />
      {/each}
    </Demo>

    <Demo label="Object Fit" class="flex flex-wrap gap-4">
      {#each fits as f}
        <div class="text-center space-y-2">
          <Pictogram src="https://picsum.photos/200/300" size="6xl" fit={f} alt={f} />
          <Text size="sm">{f}</Text>
        </div>
      {/each}
    </Demo>

    <Demo label="Aspect Ratios" class="flex flex-wrap gap-4">
      {#each ratios as [ratio, label]}
        <div class="text-center space-y-2">
          <Pictogram src="https://picsum.photos/400/400" aspectRatio={ratio} class="w-32" alt={label} />
          <Text size="sm">{ratio} ({label})</Text>
        </div>
      {/each}
    </Demo>

    <Demo label="Video Support">
      <Pictogram
        type="video"
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        autoplay loop muted
        playbackRate={0.5}
        aspectRatio="16/9"
        class="w-full max-w-md"
      />
      <Text size="sm" class="mt-2">Video with autoplay, loop, mute, and custom playback rate</Text>
    </Demo>
  </Section>

</Page>
