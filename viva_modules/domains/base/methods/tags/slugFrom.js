export default async function ({ tag }, ctx) {
  let slug;
  if (tag.traits.includes("ONTOLOGICAL")) {
    slug = tag.data.ONTOLOGICAL.branch;
    if (tag.data.ONTOLOGICAL.leaf) slug += ":" + tag.data.ONTOLOGICAL.leaf;
    else slug += ":*";
  } else {
    throw new Error("Can only create a slyg from an ONTOLOGICAL tag.");
  }
  return slug;
}
