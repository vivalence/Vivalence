<script>
  import { getContext } from "svelte";
  import { Text } from "@vivalence/drapes";

  const terminal = getContext("terminal");

  const daemon = terminal.$daemon;
  const mode = terminal.$mode;
  const session = terminal.$session;
  const valence = terminal.$valence;
  const phase = terminal.$phase;
  const products = terminal.stall.$queue;
  const status = terminal.stall.$status;
  const active = terminal.stall.$active;
</script>

<div
  class="flex gap-4 px-3 py-1 text-skeleton-1-contrast text-sm border-t border-skeleton-1-boundary font-mono">
  <span>{$daemon?.slug ?? "—"}</span>
  <span>{$mode?.slug ?? "—"}</span>
  <span>{$valence?.slug ?? "—"}</span>
  <span>#{$products.length}</span>
  <span>{$status}</span>
  <span>{$phase}</span>
  <span>{$active?.id?.slice(0, 8) ?? "—"}</span>
  <span class="ml-auto">{$session?.id?.slice(0, 8) ?? "—"}</span>
</div>
