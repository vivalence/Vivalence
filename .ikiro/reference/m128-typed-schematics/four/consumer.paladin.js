import paladin from "../s4/paladin/mod.js";

const held = paladin.instance;
const serve = paladin.instance.runtime.statics.serve;
const reference = paladin.instance.daemons[0].reference;

console.log(held, serve, reference);
