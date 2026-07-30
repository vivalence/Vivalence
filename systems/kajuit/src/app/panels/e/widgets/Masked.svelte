<script>
  import { fn } from "@vivalence/typology";
  import FormFromSchema from "./form/FormFromSchema.svelte";
  import { maskSchema } from "./form/schema.js";

  let { thread } = $props();

  let traits = $state([]);
  let trait = $state({});
  let mode = $state(null);

  $effect(() => {
    if (!thread) return;
    const offTraits = thread.$traits.subscribe((value) => (traits = value ?? []));
    const offTrait = thread.$trait.subscribe((value) => (trait = { ...value }));
    const offMode = thread.$mode.subscribe((value) => (mode = value));
    return () => {
      offTraits();
      offTrait();
      offMode();
    };
  });

  let schema = $derived(maskSchema(mode, traits, trait));
  let value = $derived(trait?.MASKED ?? {});

  const persist = fn.debounce((next) => {
    if (!thread) return;
    thread.daemon.entities.thread.updateOne(
      { id: thread.id },
      { trait: { ...thread.trait, MASKED: next } },
    );
  }, 5000);

  function onchange(next) {
    if (!thread) return;
    thread.trait = { ...thread.trait, MASKED: next };
    persist(next);
  }
</script>

{#if schema}
  <FormFromSchema {schema} {value} {onchange} daemon={thread?.daemon} />
{:else}
  <span class="muted">no mask schema {traits?.includes("AIMED") ? "· aim at an emitter" : ""}</span>
{/if}

<style>
  .muted {
    display: block;
    opacity: 0.35;
    font-size: var(--font-size-2xs);
    padding: 6px 8px;
  }
</style>
