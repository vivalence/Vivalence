// limit: 5200 chars
// probe: the copy's own stage kit in a real page — does a piece's colour show on a fully metallic printed file?
// serves the kit, three 0.186.0 (deno's npm cache) and his freight on a FREE port; the page mounts six nodes
// through the kit's world(): tail_half_a (metallic 1) plain · hex · role · hex, frame_bottom (metallic 0) plain · hex,
// dresses each solid, and leaves per node its mean drawn colour on window.probe.
// run: deno run -A --no-check .ikiro/reference/m127/page.probe.js <root holding edit/>   → prints the url, serves until killed
const KIT = `${Deno.args[0]}/edit/assembly/modes/guide/editor/buffer/kit`;
const THREE = `${Deno.env.get("HOME")}/Library/Caches/deno/npm/registry.npmjs.org/three/0.186.0`;
const PARTS = "/Users/finn/.viva/registry/droneaid/topographies/models/freight/parts";
const MOUNTS = [["/kit/", KIT], ["/three/", THREE], ["/parts/", PARTS]];
const TYPES = { js: "text/javascript", glb: "model/gltf-binary" };

const PAGE = `<!doctype html>
<script type="importmap">
{ "imports": { "three": "/three/build/three.module.js", "three/addons/": "/three/examples/jsm/" } }
</script>
<style>
  body { margin: 0; background: #eef0f3; }
  #stage { position: relative; width: 1100px; height: 520px;
    --stage-fresh: #f6c630; --stage-picked: #3b82f6; --stage-ghost: #9aa3b5; --stage-edge: #1a1d24;
    --stage-edge-light: #9aa1ad; --stage-edge-fresh: #6b4e00; --stage-edge-ghost: #5b6475; --stage-edge-picked: #1d4ed8;
    --tint-info: #3b6fd1; --tint-success: #4f9a47; --tint-warning: #d98a1c; --tint-danger: #c0392b;
    --tint-accent: #7c5cc4; --tint-contrast: #9aa3b5; }
</style>
<div id="stage"></div>
<script type="module">
  import * as THREE from "three";
  import { world } from "/kit/scene.js";
  const made = world(document.getElementById("stage"));
  const node = (ref, k, colour) => ({ path: ref + "." + k, slug: ref + "." + k, translation: [k * 0.13, 0, 0], ...(colour && { colour }) });
  const NODES = [
    node("tail_half_a", 0), node("tail_half_a", 1, "#e8590c"), node("tail_half_a", 2, "warning"), node("tail_half_a", 3, "#2f6fd0"),
    node("frame_bottom", 4), node("frame_bottom", 6, "#e8590c"),
  ];
  const entries = ["tail_half_a", "frame_bottom"].map((id) => ({ id, url: "/parts/" + id + ".glb", nodes: NODES.filter((one) => one.path.startsWith(id)) }));
  const malformed = made.raise(await made.load(entries));
  for (const group of made.groups.values()) made.dress(group, { status: "solid", edges: false });
  made.renderer.setSize(1100, 520, false);
  made.camera.aspect = 1100 / 520;
  made.go(made.pose("top"), 0);
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  const gl = made.renderer.getContext();
  const [W, H] = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  const pixels = new Uint8Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const out = {};
  for (const [path, group] of made.groups) {
    const box = new THREE.Box3().setFromObject(group);
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => new THREE.Vector3(k & 1 ? box.max.x : box.min.x, k & 2 ? box.max.y : box.min.y, k & 4 ? box.max.z : box.min.z).project(made.camera));
    const xs = corners.map((one) => Math.round(((one.x + 1) / 2) * W));
    const ys = corners.map((one) => Math.round(((one.y + 1) / 2) * H));
    const mid = [Math.round((Math.min(...xs) + Math.max(...xs)) / 2), Math.round((Math.min(...ys) + Math.max(...ys)) / 2)];
    const sum = [0, 0, 0];
    let n = 0;
    for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
      for (let x = Math.min(...xs); x <= Math.max(...xs); x++) {
        const at = (y * W + x) * 4;
        if (pixels[at + 3] < 250) continue;
        sum[0] += pixels[at]; sum[1] += pixels[at + 1]; sum[2] += pixels[at + 2];
        n++;
      }
    }
    const material = [];
    group.traverse((child) => child.isMesh && material.push({ metalness: child.material.metalness, roughness: child.material.roughness, colour: "#" + child.material.color.getHexString() }));
    out[path] = { mean: sum.map((one) => Math.round(one / Math.max(1, n))), pixels: n, mid, material: material[0] };
  }
  window.probe = { malformed, out };
  document.title = "probed";
</script>`;

const server = Deno.serve({ port: 0, onListen: ({ port }) => console.log(`http://localhost:${port}/`) }, async (request) => {
  const { pathname } = new URL(request.url);
  if (pathname === "/") return new Response(PAGE, { headers: { "content-type": "text/html" } });
  const mount = MOUNTS.find(([prefix]) => pathname.startsWith(prefix));
  if (!mount) return new Response("no", { status: 404 });
  const bytes = await Deno.readFile(mount[1] + "/" + pathname.slice(mount[0].length)).catch(() => null);
  if (!bytes) return new Response("no", { status: 404 });
  return new Response(bytes, { headers: { "content-type": TYPES[pathname.split(".").pop()] ?? "application/octet-stream" } });
});
await server.finished;
