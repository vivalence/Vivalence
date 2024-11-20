<script>
  import { goto } from "$app/navigation";
  import { Text } from "@vivalence/ui";
  import DependencyCard from "$components/models/Dependency/Card.svelte";

  const { data } = $props();
  const { dependencies, runtime } = data;

  const rootDependencies = dependencies.filter(
    (d) => !d.preconditions || d.preconditions.length === 0,
  );

  let activeDependencyId = $state(null);

  let activeDependency = $derived(
    activeDependencyId ? dependencies.find((d) => d.id === activeDependencyId) : null,
  );

  let preconditionDependencies = $derived(
    activeDependency
      ? activeDependency.preconditions
          .map((condition) => condition.scope?.dependency?.slug)
          .map((slug) => dependencies.find((dep) => dep.slug === slug))
      : [],
  );

  let dependentDependencies = $derived(
    activeDependency
      ? dependencies.filter((dep) =>
          dep.preconditions.some(
            (condition) => condition.scope?.dependency?.slug === activeDependency.slug,
          ),
        )
      : [],
  );

  function handleButtonClick(dependency) {
    goto(`/runtime/${runtime.slug}/dependencies/practice/${dependency.slug}`);
  }
  function handleTitleClick(dependency) {
    if (dependency?.id !== activeDependencyId) {
      activeDependencyId = dependency.id;
    } else {
      activeDependencyId = null;
    }
  }
</script>

<div class="dependencies">
  <div class="row preconditions">
    {#if activeDependency}
      {#each preconditionDependencies as dependency}
        <DependencyCard
          {dependency}
          onButtonClick={() => handleButtonClick(dependency)}
          onTitleClick={() => handleTitleClick(dependency)} />
      {/each}
    {/if}
  </div>

  <div class="row dependency">
    {#if activeDependency}
      <DependencyCard
        dependency={activeDependency}
        isExpanded={true}
        onButtonClick={() => handleButtonClick(activeDependency)}
        onTitleClick={() => handleTitleClick(activeDependency)} />
    {:else}
      {#each rootDependencies as dependency}
        <DependencyCard
          {dependency}
          onButtonClick={() => handleButtonClick(dependency)}
          onTitleClick={() => handleTitleClick(dependency)} />
      {/each}
    {/if}
  </div>

  <div class="row dependent">
    {#if activeDependency}
      {#each dependentDependencies as dependency}
        <DependencyCard
          {dependency}
          onButtonClick={() => handleButtonClick(dependency)}
          onTitleClick={() => handleTitleClick(dependency)} />
      {/each}
    {/if}
  </div>
</div>

<style>
  .dependencies {
    @apply flex flex-row gap-4 p-4;
  }

  .row {
    @apply flex flex-col gap-4 flex-1;
  }
</style>
