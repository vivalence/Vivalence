import { Instance } from "../s4/paladin/typology.js";

const instance = new Instance();
const serve = instance.runtime.statics.serve;
const slug = instance.daemons[0].manifest.slug;
const mountpoint = instance.daemons[0].mountpoint;
const client = instance.client("ghost");
const requirement = instance.paladin.requirements[0];

console.log(serve, slug, mountpoint, client, requirement);
