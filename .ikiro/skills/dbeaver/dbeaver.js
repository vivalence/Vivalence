const HOME = Deno.env.get("HOME");
const DEFAULT_REGISTRY =
  `${HOME}/Library/DBeaverData/workspace6/General/.dbeaver/data-sources.json`;
const INSTANCES_LEDGER = `${HOME}/.viva/instances.json`;
const BOOLEAN_FLAGS = new Set(["allow-missing", "dry"]);

function fail(message) {
  console.error(message);
  Deno.exit(1);
}

function parseArguments(argv) {
  const flags = {};
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const name = token.slice(2);
    if (BOOLEAN_FLAGS.has(name)) {
      flags[name] = true;
      continue;
    }
    flags[name] = argv[index + 1];
    index += 1;
  }
  return { verb: positional[0], operands: positional.slice(1), flags };
}

function toAbsolutePath(input) {
  const expanded = input.startsWith("~/") ? `${HOME}${input.slice(1)}` : input;
  return decodeURIComponent(
    new URL(expanded, `file://${Deno.cwd()}/`).pathname,
  );
}

function exists(path) {
  try {
    Deno.statSync(path);
    return true;
  } catch {
    return false;
  }
}

function readRegistry(path) {
  if (!exists(path)) fail(`no such data-sources file: ${path}`);
  const document = JSON.parse(Deno.readTextFileSync(path));
  if (!document.connections) document.connections = {};
  return document;
}

function writeRegistry(path, document) {
  const backup = `${path}.bak`;
  if (!exists(backup)) Deno.copyFileSync(path, backup);
  Deno.writeTextFileSync(path, JSON.stringify(document, null, "\t"));
}

function sqliteEntry(name, databasePath) {
  return {
    provider: "sqlite",
    driver: "sqlite_jdbc",
    name,
    "save-password": true,
    configuration: {
      database: databasePath,
      url: `jdbc:sqlite:${databasePath}`,
      type: "dev",
    },
  };
}

function printTable(headers, rows) {
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => row[column].length))
  );
  const render = (cells) =>
    cells.map((cell, column) => cell.padEnd(widths[column])).join("  ")
      .trimEnd();
  console.log(render(headers));
  console.log(render(widths.map((width) => "-".repeat(width))));
  for (const row of rows) console.log(render(row));
}

function findDatabases(root) {
  const found = [];
  const visit = (directory) => {
    for (const entry of Deno.readDirSync(directory)) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory) visit(path);
      else if (entry.name.endsWith(".viva.db")) found.push(path);
    }
  };
  visit(root);
  return found.sort();
}

const { verb, operands, flags } = parseArguments(Deno.args);
const registryPath = flags.file ? toAbsolutePath(flags.file) : DEFAULT_REGISTRY;
const document = readRegistry(registryPath);
const connections = document.connections;

if (verb === "list") {
  const rows = Object.entries(connections).map(([id, entry]) => [
    id,
    entry.name ?? "",
    entry.configuration?.url ?? "",
  ]);
  printTable(["id", "name", "url"], rows);
} else if (verb === "read") {
  const [id] = operands;
  if (!connections[id]) fail(`unknown connection: ${id}`);
  console.log(JSON.stringify(connections[id], null, "\t"));
} else if (verb === "create") {
  const [id, databaseInput] = operands;
  if (!id || !databaseInput) {
    fail("usage: create <id> <sqlite-path> [--name ...]");
  }
  if (connections[id]) fail(`connection already exists: ${id}`);
  const databasePath = toAbsolutePath(databaseInput);
  if (!exists(databasePath) && !flags["allow-missing"]) {
    fail(
      `no such database file: ${databasePath} (pass --allow-missing to add anyway)`,
    );
  }
  connections[id] = sqliteEntry(flags.name ?? id, databasePath);
  writeRegistry(registryPath, document);
  console.log(`created ${id} -> ${databasePath}`);
} else if (verb === "update") {
  const [id] = operands;
  if (!connections[id]) fail(`unknown connection: ${id}`);
  if (flags.name) connections[id].name = flags.name;
  if (flags.path) {
    const databasePath = toAbsolutePath(flags.path);
    if (!exists(databasePath) && !flags["allow-missing"]) {
      fail(
        `no such database file: ${databasePath} (pass --allow-missing to update anyway)`,
      );
    }
    connections[id].configuration.database = databasePath;
    connections[id].configuration.url = `jdbc:sqlite:${databasePath}`;
  }
  writeRegistry(registryPath, document);
  console.log(`updated ${id}`);
} else if (verb === "delete") {
  const [id] = operands;
  if (!connections[id]) fail(`unknown connection: ${id}`);
  delete connections[id];
  writeRegistry(registryPath, document);
  console.log(`deleted ${id}`);
} else if (verb === "create-instance") {
  const [slug] = operands;
  if (!exists(INSTANCES_LEDGER)) {
    fail(`no such instances ledger: ${INSTANCES_LEDGER}`);
  }
  const instance = JSON.parse(Deno.readTextFileSync(INSTANCES_LEDGER))[slug];
  if (!instance) fail(`unknown instance: ${slug}`);
  const mountpoint = `${instance.mount}/mountpoint`;
  if (!exists(mountpoint)) fail(`no such mountpoint: ${mountpoint}`);
  let written = 0;
  for (const databasePath of findDatabases(mountpoint)) {
    const fileName = databasePath.slice(databasePath.lastIndexOf("/") + 1);
    const id = `viva-${slug}-${fileName.replace(/\.viva\.db$/, "")}`;
    if (connections[id]) {
      console.log(`skipped ${id} (exists)`);
      continue;
    }
    console.log(
      `${flags.dry ? "would create" : "created"} ${id} -> ${databasePath}`,
    );
    connections[id] = sqliteEntry(`viva ${slug} ${fileName}`, databasePath);
    written += 1;
  }
  if (written && !flags.dry) writeRegistry(registryPath, document);
} else {
  fail(
    "verbs: list | read <id> | create <id> <path> | update <id> | delete <id> | create-instance <slug>",
  );
}
