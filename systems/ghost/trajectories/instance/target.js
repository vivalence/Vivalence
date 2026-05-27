import paladin from "@vivalence/paladin";

const CHILDREN = {
  runtime: { task: "runtime/run" },
  kajuit: { task: "kajuit/watch" },
};

export function specs(param, { attachment = "inherit" } = {}) {
  const target = param ?? "all";
  const known = ["all", ...Object.keys(CHILDREN)];
  if (!known.includes(target)) {
    throw new Error(`instance: unknown target '${target}' — expected ${known.join(" | ")}`);
  }

  const variant = paladin.scope.variant;
  if (!variant) throw new Error("instance: no variant mounted — set VIVA_VARIANT_MOUNT");

  const mount = variant.absolute;
  const slug = mount.split("/").filter(Boolean).pop(); // @beef ugly and stupid
  const config = `${paladin.scope.repository.absolute}/deno.jsonc`;

  const chosen = target === "all" ? Object.keys(CHILDREN) : [target];
  return chosen.map((type) => ({
    type,
    slug,
    mount,
    attachment,
    cmd: ["deno", "task", "--config", config, "-q", CHILDREN[type].task],
    env: { VIVA_VARIANT_MOUNT: mount },
  }));
}
