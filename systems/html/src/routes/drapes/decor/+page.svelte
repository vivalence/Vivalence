
<script>
  import { Header, Paragraph } from "@vivalence/drapes";
  import { Text, Pictogram } from "@vivalence/drapes";
</script>

<div class="max-w-3xl space-y-12">

  <div>
    <Header size="3xl">Decor</Header>
    <Paragraph class="mt-2">
      Foundational components for text and media presentation.
    </Paragraph>
  </div>

  <!-- Text Component -->
  <section class="space-y-4">
    <Header size="2xl">Text</Header>
    <Paragraph>
      The Text component provides semantic typography with multiple variants, 
      sizes, weights, and color options.
    </Paragraph>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Variants
      </Paragraph>
      <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
        <Text variant="heading" size="xl">Heading variant (Poppins)</Text>
        <Text variant="text" size="md">Text variant (Inter)</Text>
        <Text variant="serif-heading" size="xl">Serif heading (Sabon)</Text>
        <Text variant="serif-text" size="md">Serif text (Sabon)</Text>
        <Text variant="brand" size="lg">Brand variant (K2D)</Text>
        <Text variant="code" size="sm">Code variant (Source Code Pro)</Text>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Sizes
      </Paragraph>
      <div class="space-y-2 p-4 bg-skeleton-2-surface rounded">
        <Text size="xs">Extra small text</Text>
        <Text size="sm">Small text</Text>
        <Text size="md">Medium text (default)</Text>
        <Text size="lg">Large text</Text>
        <Text size="xl">Extra large text</Text>
        <Text size="2xl">2XL text</Text>
        <Text size="3xl">3XL text</Text>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Weights
      </Paragraph>
      <div class="space-y-2 p-4 bg-skeleton-2-surface rounded">
        <Text weight="thin">Thin weight</Text>
        <Text weight="light">Light weight</Text>
        <Text weight="regular">Regular weight (default)</Text>
        <Text weight="medium">Medium weight</Text>
        <Text weight="bold">Bold weight</Text>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Colors
      </Paragraph>
      <div class="space-y-2 p-4 bg-skeleton-2-surface rounded">
        <Text color="1">Skeleton 1 (default)</Text>
        <Text color="2">Skeleton 2</Text>
        <Text color="3">Skeleton 3</Text>
        <Text color="theme-primary">Theme primary</Text>
        <Text color="theme-accent">Theme accent</Text>
        <Text color="system-success">System success</Text>
        <Text color="system-warning">System warning</Text>
        <Text color="system-error">System error</Text>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Semantic HTML Elements
      </Paragraph>
      <div class="space-y-2 p-4 bg-skeleton-2-surface rounded">
        <Text as="h1" variant="heading" size="3xl">H1 Heading</Text>
        <Text as="h2" variant="heading" size="2xl">H2 Heading</Text>
        <Text as="h3" variant="heading" size="xl">H3 Heading</Text>
        <Text as="p">Paragraph text</Text>
        <Text as="span">Inline span</Text>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Modes
      </Paragraph>
      <div class="space-y-4 p-4 bg-skeleton-2-surface rounded">
        <Text mode="default">Default mode (left-aligned)</Text>
        <Text mode="centered">Centered mode</Text>
      </div>
    </div>
  </section>

  <!-- Pictogram Component -->
  <section class="space-y-4">
    <Header size="2xl">Pictogram</Header>
    <Paragraph>
      Media component for images, videos, and animated content with semantic sizing 
      that aligns with text sizes.
    </Paragraph>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Sizes (aligned with text)
      </Paragraph>
      <div class="flex flex-wrap items-center gap-4 p-4 bg-skeleton-2-surface rounded">
        <Pictogram 
          src="https://api.dicebear.com/7.x/shapes/svg?seed=xs" 
          size="xs" 
          alt="XS"
        />
        <Pictogram 
          src="https://api.dicebear.com/7.x/shapes/svg?seed=sm" 
          size="sm" 
          alt="SM"
        />
        <Pictogram 
          src="https://api.dicebear.com/7.x/shapes/svg?seed=md" 
          size="md" 
          alt="MD"
        />
        <Pictogram 
          src="https://api.dicebear.com/7.x/shapes/svg?seed=lg" 
          size="lg" 
          alt="LG"
        />
        <Pictogram 
          src="https://api.dicebear.com/7.x/shapes/svg?seed=xl" 
          size="xl" 
          alt="XL"
        />
        <Pictogram 
          src="https://api.dicebear.com/7.x/shapes/svg?seed=2xl" 
          size="2xl" 
          alt="2XL"
        />
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Object Fit
      </Paragraph>
      <div class="flex flex-wrap gap-4 p-4 bg-skeleton-2-surface rounded">
        <div class="text-center space-y-2">
          <Pictogram 
            src="https://picsum.photos/200/300" 
            size="6xl" 
            fit="contain"
            alt="Contain"
          />
          <Text size="sm">contain</Text>
        </div>
        <div class="text-center space-y-2">
          <Pictogram 
            src="https://picsum.photos/200/300" 
            size="6xl" 
            fit="cover"
            alt="Cover"
          />
          <Text size="sm">cover</Text>
        </div>
        <div class="text-center space-y-2">
          <Pictogram 
            src="https://picsum.photos/200/300" 
            size="6xl" 
            fit="auto"
            alt="Auto"
          />
          <Text size="sm">auto</Text>
        </div>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Aspect Ratios
      </Paragraph>
      <div class="flex flex-wrap gap-4 p-4 bg-skeleton-2-surface rounded">
        <div class="text-center space-y-2">
          <Pictogram 
            src="https://picsum.photos/400/400" 
            aspectRatio="1/1"
            class="w-32"
            alt="Square"
          />
          <Text size="sm">1/1 (square)</Text>
        </div>
        <div class="text-center space-y-2">
          <Pictogram 
            src="https://picsum.photos/400/300" 
            aspectRatio="16/9"
            class="w-32"
            alt="Video"
          />
          <Text size="sm">16/9 (video)</Text>
        </div>
        <div class="text-center space-y-2">
          <Pictogram 
            src="https://picsum.photos/400/300" 
            aspectRatio="4/3"
            class="w-32"
            alt="Classic"
          />
          <Text size="sm">4/3 (classic)</Text>
        </div>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Video Support
      </Paragraph>
      <div class="p-4 bg-skeleton-2-surface rounded">
        <Pictogram 
          type="video"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          autoplay
          loop
          muted
          playbackRate={0.5}
          aspectRatio="16/9"
          class="w-full max-w-md"
        />
        <Text size="sm" class="mt-2">
          Video with autoplay, loop, mute, and custom playback rate
        </Text>
      </div>
    </div>
  </section>

</div>
