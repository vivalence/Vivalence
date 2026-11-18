<script>
  let {
    src = "",
    alt = "",
    type = "image", // "image" | "video" | "gif"
    size = "md", // semantic sizes like Text component
    fit = "contain", // "auto" | "cover" | "contain" - moved object-fit here
    aspectRatio = "auto", // "auto" | "1/1" | "16/9" | "4/3" | etc.
    loading = "lazy",
    autoplay = false,
    loop = false,
    muted = true,
    playbackRate = 1.0,
    class: className = "",
    style = "",
    ...props
  } = $props();

  let element = $state(null);

  $effect(() => {
    if (type === "video" && element && playbackRate !== 1.0) {
      element.playbackRate = playbackRate;
    }
  });


  const sizes = {
    xs: "w-3 h-3",    // ~12px - aligns with text-xs
    sm: "w-4 h-4",    // ~16px - aligns with text-sm  
    md: "w-5 h-5",    // ~20px - aligns with text-base
    lg: "w-6 h-6",    // ~24px - aligns with text-lg
    xl: "w-7 h-7",    // ~28px - aligns with text-xl
    "2xl": "w-8 h-8", // ~32px - aligns with text-2xl
    "3xl": "w-10 h-10", // ~40px - aligns with text-3xl
    "4xl": "w-12 h-12", // ~48px - aligns with text-4xl
    "5xl": "w-16 h-16", // ~64px - aligns with text-5xl
    "6xl": "w-20 h-20", // ~80px - aligns with text-6xl
    "7xl": "w-24 h-24", // ~96px - aligns with text-7xl
    "8xl": "w-28 h-28", // ~112px - aligns with text-8xl
    "9xl": "w-32 h-32", // ~128px - aligns with text-9xl
  };

  const fitClasses = {
    auto: "object-none",
    cover: "object-cover", 
    contain: "object-contain",
  };
  const aspectRatioClasses = {
    auto: "",
    "1/1": "aspect-square",
    "16/9": "aspect-video", 
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
  };

  const baseClasses = "block";
</script>

{#if type === "video"}
  <video
    bind:this={element}
    {src}
    class="{baseClasses} {sizes[size]} {fitClasses[fit]} {aspectRatioClasses[aspectRatio]} {className}"
    {style}
    {autoplay}
    {loop}
    {muted}
    playsinline
    {...props}>
    <track kind="captions" />
  </video>
{:else}
  <img
    bind:this={element}
    {src}
    {alt}
    {loading}
    class="{baseClasses} {sizes[size]} {fitClasses[fit]} {aspectRatioClasses[aspectRatio]} {className}"
    {style}
    {...props} />
{/if}
