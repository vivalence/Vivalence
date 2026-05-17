<!--
  SkeletonProvider — sets the current skeleton level (0..4) on a Svelte
  context. All drapes components within the slot read this via
  `useSkeleton()` to template their tailwind classes.

  Usage:
    <SkeletonProvider level={1}>
      <Button variant="primary">ok</Button>
    </SkeletonProvider>

  See .ikiro/pincer.quest.org § Dapper Skeleton Rebuild.
-->
<script>
  import { setContext } from "svelte";
  import { SKELETON_CONTEXT_KEY } from "./useSkeleton.js";

  let { level = 1, children } = $props();

  // Store as a getter so consumers always read the current value.
  setContext(SKELETON_CONTEXT_KEY, () => level);
</script>

{@render children?.()}
