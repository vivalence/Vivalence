<script>
  import { useDecorum, setZone } from "./decorum.js";

  let { skeleton = 1, children } = $props();

  const decorum = useDecorum();
  const zone = decorum.use({ skeleton });
  setZone(zone);
</script>

<div
  class="zone"
  style:--surface="var(--colors-skeleton-{skeleton}-surface)"
  style:--contrast="var(--colors-skeleton-{skeleton}-contrast)"
  style:--boundary="var(--colors-skeleton-{skeleton}-boundary)"
  style:--primary-base="var(--colors-skeleton-{skeleton}-primary-base)"
  style:--primary-hover="var(--colors-skeleton-{skeleton}-primary-hover)"
  style:--primary-active="var(--colors-skeleton-{skeleton}-primary-active)"
  style:--secondary-base="var(--colors-skeleton-{skeleton}-secondary-base)"
  style:--secondary-hover="var(--colors-skeleton-{skeleton}-secondary-hover)"
  style:--secondary-active="var(--colors-skeleton-{skeleton}-secondary-active)"
  style:--accent-base="var(--colors-skeleton-{skeleton}-accent-base)"
  style:--accent-hover="var(--colors-skeleton-{skeleton}-accent-hover)"
  style:--accent-active="var(--colors-skeleton-{skeleton}-accent-active)"
  style:--info-base="var(--colors-skeleton-{skeleton}-info-base)"
  style:--success-base="var(--colors-skeleton-{skeleton}-success-base)"
  style:--warning-base="var(--colors-skeleton-{skeleton}-warning-base)"
  style:--danger-base="var(--colors-skeleton-{skeleton}-danger-base)"
>
  {@render children?.()}
</div>

<style>
  .zone {
    display: contents;
  }
</style>
