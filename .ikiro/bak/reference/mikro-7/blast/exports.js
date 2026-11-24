const version = Deno.args[0];
const packages = ["core", "sqlite", "migrations", ...(version.startsWith("7") ? ["sql"] : ["knex"])];
const exports = {};
for (const name of packages) exports[name] = Object.keys(await import(`npm:@mikro-orm/${name}@${version}`)).sort();
console.log(JSON.stringify(exports));
Deno.exit(0);
