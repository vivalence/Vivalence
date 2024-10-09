// Force-Directed Graph for Threlte
// System Layout:
// 1. Main ForceGraph component
// 2. Node component
// 3. Link component
// 4. Force simulation (using d3-force or a custom implementation)
// 5. Rendering logic (using Threlte's components)

// Important parts:
// - Graph data management
// - Force simulation
// - 3D object creation and management
// - User interaction (dragging, zooming, etc.)
// - Performance optimizations

// Primary data types:
// - GraphData: { nodes: Node[], links: Link[] }
// - Node: { id: string, x?: number, y?: number, z?: number, ... }
// - Link: { source: string | Node, target: string | Node, ... }

import { onMount, onDestroy } from "svelte";
import { T } from "@threlte/core";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3-force-3d";

export function createForceGraph(container, options = {}) {
  let nodes = [];
  let links = [];
  let simulation;

  function initSimulation() {
    simulation = forceSimulation(nodes, 3)
      .force(
        "link",
        forceLink(links).id((d) => d.id),
      )
      .force("charge", forceManyBody())
      .force("center", forceCenter());
  }

  function updateGraph(newNodes, newLinks) {
    nodes = newNodes;
    links = newLinks;
    if (simulation) {
      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    } else {
      initSimulation();
    }
  }

  onMount(() => {
    initSimulation();
  });

  onDestroy(() => {
    if (simulation) {
      simulation.stop();
    }
  });

  return {
    updateGraph,
    // Add more methods as needed
  };
}

// Main ForceGraph component
export function ForceGraph(props) {
  const graph = createForceGraph();

  // Implement rendering logic using Threlte components
  return (
    <T.Group>
      {/* Render nodes */}
      {props.nodes.map((node) => (
        <Node key={node.id} data={node} />
      ))}
      {/* Render links */}
      {props.links.map((link, index) => (
        <Link key={index} data={link} />
      ))}
    </T.Group>
  );
}

// Node component
function Node({ data }) {
  return (
    <T.Mesh position={[data.x, data.y, data.z]}>
      <T.SphereGeometry args={[1, 16, 16]} />
      <T.MeshBasicMaterial color={data.color || 0xffffff} />
    </T.Mesh>
  );
}

// Link component
function Link({ data }) {
  return (
    <T.Line>
      <T.BufferGeometry>
        <T.BufferAttribute
          attach="attributes-position"
          count={2}
          array={
            new Float32Array([
              data.source.x,
              data.source.y,
              data.source.z,
              data.target.x,
              data.target.y,
              data.target.z,
            ])
          }
          itemSize={3}
        />
      </T.BufferGeometry>
      <T.LineBasicMaterial color={data.color || 0xcccccc} />
    </T.Line>
  );
}
