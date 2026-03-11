<script>
  import { page } from "$app/stores";
  import { Shelve, Box } from "@vivalence/drapes";
  import { Text, Link } from "@vivalence/drapes";

  const sections = [
    { name: "Decor", slug: "decor" },
    { name: "Controls", slug: "controls" },
    { name: "Display", slug: "display" },
    { name: "Panels", slug: "panels" },
    { name: "Triage", slug: "triage" },
  ];

  let { children } = $props();
  let currentPath = $derived($page.url.pathname);
</script>

<Shelve across class="">
  <div class="w-52 bg-skeleton-1-surface border-r border-skeleton-1-boundary p-6">
    <Text variant="heading" size="2xl" weight="bold" class="mb-6">
      Drapes
    </Text>
    
    <nav class="space-y-1">
      {#each sections as section}
        <Link 
          href="/drapes/{section.slug}" 
          variant="nav"
          active={currentPath.includes(section.slug)}
        >
          {section.name}
        </Link>
      {/each}
    </nav>
  </div>

  <Box class="p-12">
    {@render children()}
  </Box>
</Shelve>
