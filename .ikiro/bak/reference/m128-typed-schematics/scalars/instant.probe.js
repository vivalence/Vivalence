import { v } from "@vivalence/typology";

console.log(import.meta.resolve("@vivalence/typology"));
console.log(JSON.stringify(v.instant()));
console.log(v.instant().check("2026-11-09T16:11:21.476Z"), v.instant().check("nope"));
console.log(JSON.stringify(v.entities.DataEntitySchema.properties.createdAt));
