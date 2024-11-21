<script lang="ts">
  import { Text, Button, Tag, Icon } from "@vivalence/ui";

  const { onButtonClick, onTitleClick, dependency, isExpanded } = $props<{
    onButtonClick: () => void;
    onTitleClick: () => void;
    isExpanded?: boolean;
    dependency: {
      name: string;
      description: string;
      available: boolean;
      satisfied: boolean;
      conditions: Array<{ name: string; met: boolean; scope: any }>;
    };
  }>();

  const disabled = !dependency.available;
  const completedConditions = $derived(dependency.conditions.filter((c) => c.met).length);
  const totalConditions = $derived(dependency.conditions.length);
</script>

<div class="card">
  <div class="header">
    <a href="" onclick={onTitleClick}>
      <Text variant="title" spacing="xs">{dependency.name}</Text>
    </a>
  </div>

  <div class="content">
    <Button size="xs" {disabled} variant="primary" onclick={onButtonClick}
      >{dependency.available ? "Practice" : "Preconditions not met"}</Button>

    <Tag class="mb-2" size="sm" variant={dependency.satisfied ? "success" : "default"}
      >{completedConditions} / {totalConditions}</Tag>
  </div>

  <div class="footer">
    <div class="progress-bar">
      {#each dependency.conditions as condition}
        <div class="bar-segment {condition.met ? 'success' : 'incomplete'}" />
      {/each}
    </div>
  </div>

  {#if isExpanded}
    <div class="condition-list">
      {#each dependency.conditions as condition}
        <div class="condition-item">
          <Icon carbon="CheckmarkOutline" size="sm" variant={condition.met ? "success" : "ui"} />
          <Text spacing="none" size="sm" weight="light" class="ml-2 overflow-ellipsis"
            >{condition.name}</Text>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .card {
    @apply flex flex-col bg-skeleton-surface-1 border border-skeleton-boundary-1 rounded-lg p-4;
  }

  .header {
    @apply mb-2;
  }

  .content {
    @apply flex justify-between items-center gap-4;
  }

  .footer {
    @apply flex justify-between items-center gap-4;
  }

  .progress-bar {
    @apply flex-1 flex gap-[2px];

    .bar-segment {
      @apply flex-1 h-3 rounded;

      &.success {
        @apply bg-system-success-surface;
      }

      &.incomplete {
        @apply bg-system-error-surface;
      }
    }
  }

  .condition-list {
    @apply flex flex-col pt-4 gap-2;
  }

  .condition-item {
    @apply flex items-center;
  }

  .text-success {
    @apply text-system-success-contrast;
  }

  .text-gray {
    @apply text-skeleton-contrast-1;
  }
</style>
