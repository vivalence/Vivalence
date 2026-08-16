import sm2 from "./sm2.js";

const registry = [sm2];

export const drivers = Object.fromEntries(registry.map((d) => [d.type, d]));

export default drivers;
