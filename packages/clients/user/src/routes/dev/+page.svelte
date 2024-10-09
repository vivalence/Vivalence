<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { Canvas } from "@threlte/core";
  import { PerfMonitor } from "@threlte/extras";
  import { World } from "@threlte/rapier";
  import Demo from "./Demo.svelte";
  /* import Scene from "./Scene.svelte"; */

  export let data;
  const tags = data.tags.sort((a, b) => a.slug.localeCompare(b.slug));

  const parents = new Map(
    tags
      .filter((tag) => !tag.data.ONTOLOGICAL.leaf)
      .map((tag) => [tag.data.ONTOLOGICAL.branch, tag]),
  );

  const nodes = [];
  const links = [];

  tags.map((tag) => {
    const node = { id: tag.slug, name: tag.name, level: 0, data: tag };

    if (tag.data.ONTOLOGICAL.leaf) {
      node.level = 1;
      const parent = parents.get(tag.data.ONTOLOGICAL.branch);
      if (parent) {
        links.push({ source: parent.slug, target: tag.slug });
      }
    }

    nodes.push(node);
  });

  let width = 0;
  let height = 0;
  onMount(() => {
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  });

  const graphData = { nodes, links };
</script>

{#if browser}
  <div>
    <Canvas size={{ height, width }}>
      <PerfMonitor />
      <World gravity={[0, 0, 0]}>
        <Demo data={graphData} />
      </World>
    </Canvas>
  </div>
{/if}

<style>
  div {
    height: 100%;
    background-color: gray;
  }
</style>
