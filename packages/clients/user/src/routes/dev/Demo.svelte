<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import { Grid, MeshLineGeometry, MeshLineMaterial, Text3DGeometry } from "@threlte/extras";
  import { OrbitControls, interactivity } from "@threlte/extras";
  import RAPIER from "@dimforge/rapier3d-compat";
  import {
    useRapier,
    Debug,
    World,
    RigidBody,
    Attractor,
    AutoColliders,
    Collider,
  } from "@threlte/rapier";

  function getNodeColor(node) {
    let hash = 0;
    for (let i = 0; i < node.id.length; i++) {
      hash = node.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = hash & 0x00ffffff;
    return new THREE.Color(`hsl(${hash % 360}, 70%, 50%)`);
  }

  import * as THREE from "three";
  import { Vector3, CatmullRomCurve3, Color } from "three";

  export let data;
  const NODE_RADIUS = 3;
  const LINK_RADIUS = 0.25;

  let nodes = new Map();
  let links = [];

  interactivity();
  const { world, ...rapier } = useRapier();
  const threlte = useThrelte();

  console.log("threlte", threlte);
  console.log("RAPIER", RAPIER);
  console.log("rapier", rapier);
  console.log("world", world);

  function loadGraph(graphData) {
    const parents = graphData.nodes.filter((n) => n.level === 0);
    const children = graphData.nodes.filter((n) => n.level === 1);

    const numberOfParents = parents.length;
    const numberOfChildren = children.length;

    const parentsSpread = 25;
    const childrenSpread = 10;
    parents.forEach((node, index) => {
      const position = new RAPIER.Vector3(
        index * parentsSpread - (numberOfParents / 2) * parentsSpread,
        100,
        0,
        //
      );
      nodes.set(node.id, { ...node, position });
    });

    children.forEach((node, index) => {
      const position = new RAPIER.Vector3(
        index * childrenSpread - (numberOfChildren / 2) * childrenSpread,
        0,
        0,
        //
      );
      nodes.set(node.id, { ...node, position });
    });

    links = graphData.links.map((link) => {
      const source = nodes.get(link.source);
      const target = nodes.get(link.target);
      const position = [...Object.values(source.position), ...Object.values(target.position)];
      return { ...link, source, target, startPosition: position, position };
    });
  }
  loadGraph(data);

  function add(arr1, arr2) {
    return arr1.map((num, index) => num + (arr2[index] || 0));
  }

  console.log(nodes);
  let count = 0;

  useTask(() => {
    nodes = new Map(
      [...nodes].map(([key, node]) => {
        const child = node.ref.children[0];
        const body = child.userData.rigidBody;
        // if (node.id === "gender:*") console.log(body.linvel());
        child.position.z = 0;
        return [key, node];
      }),
    );

    links = links.map((link) => {
      const newPosition = [
        ...Object.values(link.source.ref.children[0].position),
        ...Object.values(link.target.ref.children[0].position),
      ];

      link.position = add(link.startPosition, newPosition);
      return link;
    });
    count++;
  });
</script>

<Attractor range={1000} strength={50} gravityType="static">
  {#each nodes.values() as node (node.id)}
    <T.Group position={[node.position.x, node.position.y, node.position.z]} bind:ref={node.ref}>
      <RigidBody>
        <Attractor range={500} strength={0.25} gravityType="linear">
          <Attractor range={30} strength={-55} gravityType="linear">
            <AutoColliders shape="convexHull">
              <T.Mesh>
                <T.SphereGeometry args={[3, 8, 8]} />
                <T.MeshStandardMaterial color={getNodeColor(node)} />
              </T.Mesh>
            </AutoColliders>
          </Attractor>
        </Attractor>
      </RigidBody>
    </T.Group>
  {/each}
</Attractor>
{#each links as link (link.source.id + "->" + link.target.id)}
  <T.Line>
    <T.BufferGeometry>
      <T.Float32BufferAttribute attach="attributes.position" args={[link.position, 3]} />
    </T.BufferGeometry>
    <T.LineBasicMaterial color="red" />
  </T.Line>
{/each}

<T.PerspectiveCamera makeDefault position={[0, 0, 800]} fov={55}>
  <OrbitControls autoRotateSpeed={3} autoRotate />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[1, 1, 1]} intensity={0.8} />
<T.DirectionalLight position.y={10} position.z={10} />

<Grid plane="xy" type="polar" fadeDistance={2000} infiniteGrid cellSize={10} />

<!-- <Attractor range={50} strength={-60} position={[0, 0, 0]} gravityType="linear" /> -->
<!-- <Attractor range={1000} strength={5} position={[0, 0, 0]} gravityType="linear" /> -->
<!-- <Debug /> -->
