import * as dapper from "../../../../subsystems/dapper/mod.js";
const held = dapper.THEMES.porcelain;
console.log(Object.keys(held), typeof held);
const built = held.zones ? held : dapper.theme(held);
console.log(dapper.declarations(built.zones[1]).map(([name]) => name).join(" "));
await Deno.writeTextFile(new URL("./porcelain.css", import.meta.url), dapper.emit("porcelain", built));
