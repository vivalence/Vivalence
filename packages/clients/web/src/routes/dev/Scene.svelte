<script>
  import { T, useFrame } from "@threlte/core";
  import { OrbitControls, interactivity } from "@threlte/extras";
  import * as THREE from "three";
  /* import RAPIER from '@dimforge/rapier3d-compat'; */
  import RAPIER from "@dimforge/rapier3d";
  import { World, RigidBody, Collider } from "@threlte/rapier";

  export let data;
  let nodes = [];
  let links = [];
  const NODE_REL_SIZE = 50;
  const LEVEL_HEIGHT = 30;
  const NODE_SPREAD = 10;
  const LINK_RADIUS = 0.25;

  interactivity();

  $: {
    if (data) {
      updateGraph(data);
    }
  }

  function updateGraph(graphData) {
    nodes = graphData.nodes
      .map((node, index) => ({
        ...node,
        x: ((index % 20) - 10) * NODE_SPREAD,
        y: -node.level * LEVEL_HEIGHT + LEVEL_HEIGHT,
        z: 0,
      }))
      .map((node) => {
        node.x = node.x + Math.random() * NODE_SPREAD - NODE_SPREAD / 2;
        node.y = node.y + Math.random() * NODE_SPREAD - NODE_SPREAD / 2;
        node.z = node.z + Math.random() * NODE_SPREAD - NODE_SPREAD / 2;
        return node;
      });

    links = graphData.links
      .map((link) => ({
        source: nodes.find((n) => n.id === link.source),
        target: nodes.find((n) => n.id === link.target),
      }))
      .map((link) => ({
        ...link,
        position: new THREE.Vector3(
          (link.source.x + link.target.x) / 2,
          (link.source.y + link.target.y) / 2,
          (link.source.z + link.target.z) / 2,
        ),
        quaternion: new THREE.Quaternion(),
        scale: new THREE.Vector3(1, 1, 1),
      }));

    links.forEach((link) => {
      const direction = new THREE.Vector3().subVectors(
        new THREE.Vector3(link.target.x, link.target.y, link.target.z),
        new THREE.Vector3(link.source.x, link.source.y, link.source.z),
      );
      const length = direction.length();
      link.scale.set(LINK_RADIUS, length, LINK_RADIUS);
      link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    });
  }

  function getNodeColor(node) {
    let hash = 0;
    for (let i = 0; i < node.id.length; i++) {
      hash = node.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = hash & 0x00ffffff;
    return new THREE.Color(`hsl(${hash % 360}, ${100 - node.level * 30}%, 50%)`);
  }
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 300]} fov={25}>
  <OrbitControls />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[1, 1, 1]} intensity={0.8} />
<T.DirectionalLight position.y={10} position.z={10} />

<T.Group>
  {#each nodes as node (node.id)}
    <T.Mesh position={[node.x, node.y, node.z]}>
      <T.SphereGeometry args={[3, 16, 16]} />
      <T.MeshStandardMaterial color={getNodeColor(node)} />
    </T.Mesh>
  {/each}

  {#each links as link (link.source.id + "->" + link.target.id)}
    <T.Mesh
      quaternion={[link.quaternion.x, link.quaternion.y, link.quaternion.z, link.quaternion.w]}
      scale={[link.scale.x, link.scale.y, link.scale.z]}
      position={[link.position.x, link.position.y, link.position.z]}>
      <T.CylinderGeometry args={[1, 1, 1, 8]} />
      <T.MeshStandardMaterial color="red" />
    </T.Mesh>
  {/each}
</T.Group>
