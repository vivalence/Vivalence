<script>
  import { untrack } from "svelte";
  import { SETS, CHECKS, ENUMS, ONTOLOGIES, TRAIT_SCHEMA, OPS, ALL_VERBS } from "./schema.js";

  const { terminal } = $props();
  const daemon = terminal.daemon;

  const ROW_H = 26;
  const PAGE_SIZES = [100, 250, 500, 1000];
  const ER_W = 180;
  const ER_LH = 14;
  const ER_HOME = {
    literal: [40, 40], symbol: [40, 250], mode: [400, 20], user: [760, 20],
    intent: [400, 230], thread: [760, 200], buffer: [400, 420], turn: [760, 430],
    activity: [40, 420],
  };
  const MIN = { catalog: 160, editor: 280, meta: 200, wire: 40, foot: 0 };
  const MAX = { catalog: 520, editor: 720, meta: 520, wire: 400, foot: 700 };

  let datamap = $state(null);
  let doors = $state({});
  let counts = $state({});
  let booted = $state(false);
  let bootError = $state("");

  let entity = $state("literal");
  let clauses = $state([]);
  let populate = $state([]);
  let sortKey = $state("slug");
  let sortDir = $state("asc");
  let limit = $state(250);
  let offset = $state(0);
  let newField = $state("slug");
  let newOp = $state("$eq");
  let newValue = $state("");

  let request = $state({ status: "idle", rows: [], total: 0, message: "", partial: false });
  let loadToken = 0;

  let screen = $state("grid");
  let queryTab = $state("builder");
  let rawText = $state("");
  let rawError = $state("");
  let catalogOpen = $state(true);
  let wireOpen = $state(true);
  let erMetaOpen = $state(true);
  let editorHidden = $state(false);
  let colsOpen = $state(false);
  let colTick = $state(0);

  let selectedId = $state(null);
  let selection = $state([]);
  let anchorId = $state(null);
  let lastCell = $state(null);
  let copyFmt = $state("json");
  let toast = $state("");
  let toastTimer = null;

  let creating = $state(false);
  let draft = $state(null);
  let original = $state(null);
  let editorMode = $state("form");
  let confirmRemove = $state(false);
  let confirmBulk = $state(false);
  let customTrait = $state("");
  let busy = $state(false);
  let candidates = $state({});
  const candidateLoads = {};

  let live = $state(false);
  let badges = $state({});
  let pulse = $state(0);

  let crumbs = $state([]);
  let saved = $state([]);
  let folds = $state({});

  let sizes = $state({ catalog: 236, editor: 380, meta: 280, wire: 118, foot: 260 });
  let seam = $state(null);

  let erPos = $state({});
  let erSel = $state(null);
  let erHover = $state(null);
  let canvas = $state({ x: 24, y: 24, z: 1 });
  let panning = $state(false);
  let erRef = $state(null);
  let erDrag = null;
  let erMoved = false;
  let pan = null;
  let dragCol = null;

  let wire = $state([]);
  let took = $state(0);

  function log(verb, path, body) {
    const at = new Date().toISOString().slice(11, 23);
    const entry = { at, verb, path, body: body ?? "" };
    wire = [entry, ...untrack(() => wire)].slice(0, 40);
  }

  function repoFor(name) {
    const repo = daemon?.entities?.[name];
    return repo && typeof repo.findAndCount === "function" ? repo : null;
  }
  function doorOf(name) { return doors[name] ?? null; }
  function mountOf(name) { return doors[name]?.mount ?? `/entities/${name}`; }
  function scopedNote(name) {
    const door = doorOf(name);
    if (!door) return "";
    if (!door.scoped) return "unscoped · every user sees every row";
    const shape = name === "buffer" || name === "turn" ? "{thread:{user}}" : "{user}";
    return `scoped · where ⊕ ${shape} at the door`;
  }

  function readDoors(node) {
    const out = {};
    const harvest = (branch, prefix) => {
      const entities = branch?.branches?.entities?.branches;
      if (!entities) return;
      for (const [name, leaf] of Object.entries(entities)) {
        const keys = Object.keys(leaf?.branches ?? {});
        const verbs = keys.filter((k) => ALL_VERBS.includes(k));
        if (!verbs.length) continue;
        out[name] = {
          mount: `${prefix}/entities/${name}`,
          verbs,
          extra: keys.filter((k) => !ALL_VERBS.includes(k)),
          scoped: prefix.startsWith("/userspace"),
        };
      }
    };
    harvest(node, "");
    harvest(node?.branches?.userspace, "/userspace");
    return out;
  }

  async function boot() {
    try {
      datamap = daemon?.entities?.datamap ?? await daemon.connection.call("/datamap");
      log("POST", "/datamap", "");
      const aperture = await daemon.connection.call("/metadata/aperture");
      log("POST", "/metadata/aperture", "");
      doors = readDoors(aperture);
      booted = true;
      await refreshCounts();
      await load();
    } catch (error) {
      bootError = String(error?.message ?? error);
    }
  }

  async function refreshCounts() {
    const names = Object.keys(doors).filter((name) => repoFor(name));
    log("POST", "<door>/count", `${names.length} entities`);
    const pairs = await Promise.all(names.map(async (name) => {
      try { return [name, await repoFor(name).count({})]; } catch { return [name, null]; }
    }));
    counts = Object.fromEntries(pairs);
  }

  function coerce(value) {
    if (value === "null") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    if (value !== "" && !isNaN(Number(value))) return Number(value);
    return value;
  }

  function buildWhere() {
    const where = {};
    for (const clause of clauses) {
      if (clause.op === "traits") { where.traits = [clause.value]; continue; }
      let expression;
      if (clause.op === "$null") expression = null;
      else if (clause.op === "$in" || clause.op === "$nin")
        expression = { [clause.op]: clause.value.split(",").map((part) => coerce(part.trim())) };
      else if (clause.op === "$eq") expression = coerce(clause.value);
      else expression = { [clause.op]: coerce(clause.value) };
      if (clause.field in where) {
        where.$and = where.$and ?? [];
        where.$and.push({ [clause.field]: expression });
      } else where[clause.field] = expression;
    }
    return where;
  }

  function buildOptions() {
    return {
      ...(populate.length ? { populate: [...populate] } : {}),
      orderBy: { [sortKey]: sortDir },
      limit,
      offset,
    };
  }

  async function load() {
    const token = ++loadToken;
    const name = entity;
    const repo = repoFor(name);
    if (!repo) {
      request = { status: "error", rows: [], total: 0, message: `no client repository for "${name}"`, partial: false };
      return;
    }
    const where = buildWhere();
    const options = buildOptions();
    const traitClause = clauses.some((clause) => clause.op === "traits");
    const verb = traitClause ? "find" : "findAndCount";
    request = { status: "loading", rows: [], total: 0, message: "", partial: false };
    log("POST", `${mountOf(name)}/${verb}`, JSON.stringify({ where, options }));
    const started = performance.now();
    try {
      let rows, total;
      if (traitClause) { rows = await repo.find(where, options); total = rows.length; }
      else { [rows, total] = await repo.findAndCount(where, options); }
      if (token !== loadToken) return;
      took = Math.round(performance.now() - started);
      request = { status: "ready", rows, total, message: "", partial: traitClause };
    } catch (error) {
      if (token !== loadToken) return;
      took = Math.round(performance.now() - started);
      request = { status: "error", rows: [], total: 0, message: String(error?.message ?? error), partial: false };
    }
  }

  function query(patch = {}, opts = {}) {
    for (const [key, value] of Object.entries(patch)) {
      if (key === "clauses") clauses = value;
      else if (key === "populate") populate = value;
      else if (key === "sortKey") sortKey = value;
      else if (key === "sortDir") sortDir = value;
      else if (key === "limit") limit = value;
      else if (key === "entity") entity = value;
      else if (key === "newField") newField = value;
      else if (key === "newValue") newValue = value;
      else if (key === "rawError") rawError = value;
    }
    if (!opts.keepOffset) offset = 0;
    confirmRemove = false;
    load();
  }

  function goEntity(name, next = [], extra = {}) {
    const cols = columnsFor(name);
    const sortable = cols.filter((col) => !["1:m", "m:n", "m:1"].includes(col.type)).map((col) => col.key);
    const key = sortable.includes("slug") ? "slug" : sortable.includes("index") ? "index" : "createdAt";
    entity = name;
    clauses = next;
    populate = [];
    sortKey = key;
    sortDir = key === "createdAt" ? "desc" : "asc";
    newField = sortable[0] ?? "id";
    newOp = "$eq";
    newValue = "";
    selectedId = extra.selectedId ?? null;
    original = extra.original ?? null;
    draft = extra.draft ?? null;
    creating = false;
    selection = [];
    anchorId = null;
    lastCell = null;
    if ("crumbs" in extra) crumbs = extra.crumbs;
    if ("screen" in extra) screen = extra.screen;
    if ("erSel" in extra) erSel = extra.erSel;
    offset = 0;
    load();
  }

  function crumbLabel() {
    const tail = clauses.length ? ` · ${clauses.map((c) => `${c.field} ${c.op} ${c.value}`).join(", ")}` : "";
    return `${entity}${tail}`;
  }

  function columnsFor(name) {
    const meta = datamap?.[name];
    if (!meta) return [];
    const widths = {
      slug: 230, description: 320, name: 170, data: 240, parts: 220,
      meta: 180, steps: 200, traits: 430, trait: 280, symbol: 150,
    };
    const cols = [{ key: "id", type: "id", width: 100 }];
    for (const [key, col] of Object.entries(meta.columns ?? {})) {
      if (["id", "createdAt", "updatedAt"].includes(key)) continue;
      const width = widths[key] ?? (col.type === "integer" ? 80 : col.type === "JsonType" ? 220 : col.type === "EnumArrayType" ? 300 : 160);
      cols.push({ key, type: col.type, nullable: !!col.nullable, width });
    }
    for (const [key, prop] of Object.entries(meta.properties ?? {}))
      if (prop.kind === "m:1") cols.push({ key, type: "m:1", target: prop.target, nullable: !!prop.nullable, width: 170 });
    for (const [key, prop] of Object.entries(meta.properties ?? {}))
      if (prop.kind !== "m:1") cols.push({ key, type: prop.kind, target: prop.target, mappedBy: prop.mappedBy, width: 96 });
    cols.push({ key: "createdAt", type: "Date", width: 130 }, { key: "updatedAt", type: "Date", width: 130 });
    return cols;
  }

  function typeLabel(col) {
    if (col.type === "m:1") return `→ ${col.target}`;
    if (col.type === "1:m" || col.type === "m:n") return `${col.type} ${col.target}`;
    if (col.type === "JsonType") return "json";
    if (col.type === "EnumArrayType") return "enum[]";
    if (col.type === "integer") return "int";
    if (col.type === "Date") return "date";
    if (col.type === "id") return "uuid";
    return col.type;
  }

  function read(row, key) { try { return row?.[key]; } catch { return undefined; } }
  function short(id) { return String(id ?? "").slice(0, 8); }
  function fmtDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return isNaN(date) ? String(value) : date.toISOString().slice(5, 19).replace("T", " ");
  }

  function identify(name, row) {
    if (!row) return null;
    const labeled = read(row, "trait")?.LABELED?.name;
    if (name === "mode") return `${read(row, "type")}/${read(row, "slug")}`;
    if (name === "thread") return labeled ?? `${read(row, "phase")} · ${short(read(row, "id"))}`;
    if (name === "buffer") return labeled ?? `${read(row, "status")}#${read(row, "index")}`;
    if (name === "turn") return `${read(row, "role")} · ${(read(row, "parts") ?? []).length} · ${short(read(row, "id"))}`;
    if (name === "user") return short(read(row, "id"));
    if (name === "activity") return `${read(row, "type")} · ${read(row, "status")}`;
    return read(row, "slug") ?? short(read(row, "id"));
  }

  function plainRow(row, name) {
    const out = {};
    for (const col of columnsFor(name)) {
      const value = read(row, col.key);
      if (value === undefined) continue;
      if (col.type === "m:1") out[col.key] = value == null ? null : typeof value === "object" ? value.id : value;
      else if (col.type === "1:m" || col.type === "m:n") {
        if (Array.isArray(value)) out[col.key] = value.map((item) => (typeof item === "object" ? item?.id : item));
      } else if (value instanceof Date) out[col.key] = value.toISOString();
      else out[col.key] = value;
    }
    return out;
  }

  function prefsFor(name) {
    try {
      const all = JSON.parse(localStorage.getItem("dataspace.v2.columns") || "{}");
      return all[name] ?? { order: [], hidden: [] };
    } catch { return { order: [], hidden: [] }; }
  }
  function savePrefs(name, prefs) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem("dataspace.v2.columns") || "{}"); } catch {}
    all[name] = prefs;
    try { localStorage.setItem("dataspace.v2.columns", JSON.stringify(all)); } catch {}
    colTick += 1;
  }
  function applyPrefs(cols, name) {
    const prefs = prefsFor(name);
    const rank = (key) => {
      const index = prefs.order.indexOf(key);
      return index === -1 ? 1000 + cols.findIndex((col) => col.key === key) : index;
    };
    return [...cols].sort((a, b) => rank(a.key) - rank(b.key));
  }

  function toggleColumn(event) {
    const key = event.currentTarget.dataset.col;
    const prefs = prefsFor(entity);
    prefs.hidden = prefs.hidden.includes(key) ? prefs.hidden.filter((x) => x !== key) : [...prefs.hidden, key];
    savePrefs(entity, prefs);
  }
  function resetColumns() { savePrefs(entity, { order: [], hidden: [] }); }
  function colDragStart(event) {
    dragCol = event.currentTarget.dataset.col;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dragCol);
  }
  function colDragOver(event) { if (dragCol) event.preventDefault(); }
  function colDrop(event) {
    event.preventDefault();
    const to = event.currentTarget.dataset.col;
    const from = dragCol;
    dragCol = null;
    if (!from || !to || from === to || to === "_sel") return;
    const order = applyPrefs(columnsFor(entity), entity).map((col) => col.key).filter((key) => key !== from);
    order.splice(order.indexOf(to), 0, from);
    const prefs = prefsFor(entity);
    prefs.order = order;
    savePrefs(entity, prefs);
  }

  function seamDown(event) {
    const key = event.currentTarget.dataset.seam;
    const start = { x: event.clientX, y: event.clientY, value: sizes[key] };
    const move = (moved) => {
      const delta = key === "catalog"
        ? moved.clientX - start.x
        : key === "wire" || key === "foot" ? start.y - moved.clientY : start.x - moved.clientX;
      sizes = { ...sizes, [key]: Math.max(MIN[key], Math.min(MAX[key], start.value + delta)) };
      seam = key;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      seam = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    event.preventDefault();
  }

  function isOpen(key, fallback = true) {
    const value = folds[key];
    return value === undefined ? fallback : !value;
  }
  function toggleFold(event) {
    const { key, open } = event.currentTarget.dataset;
    folds = { ...folds, [key]: open === "true" };
  }

  function symbolTree(rows, active) {
    const root = { children: {}, count: 0 };
    for (const row of rows) {
      const parts = String(read(row, "slug") ?? "").split(".");
      let node = root;
      let path = "";
      for (const part of parts) {
        path = path ? `${path}.${part}` : part;
        node.children[part] = node.children[part] ?? { name: part, path, children: {}, count: 0 };
        node = node.children[part];
        node.count += 1;
      }
    }
    const out = [];
    const walk = (node, depth) => {
      const kids = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));
      for (const kid of kids) {
        const hasKids = Object.keys(kid.children).length > 0;
        const open = isOpen(`tree:${kid.path}`, false);
        const exact = kid.count === 1 && !hasKids;
        const value = exact ? kid.path : `${kid.path}.%`;
        const on = active && clauses.some((clause) => clause.field === "slug" && clause.value === value);
        out.push({
          label: kid.name, field: "slug", op: exact ? "$eq" : "$like", value, count: kid.count,
          indent: depth * 10, leaf: !hasKids, open,
          caret: !hasKids ? "" : open ? "▾" : "▸", foldKey: `tree:${kid.path}`, on,
        });
        if (hasKids && open) walk(kid, depth + 1);
      }
    };
    walk(root, 0);
    return out;
  }

  function draftFrom(row, name) {
    const out = {};
    for (const col of columnsFor(name)) {
      if (["id", "createdAt", "updatedAt"].includes(col.key)) continue;
      if (col.type === "1:m" || (col.type === "m:n" && col.mappedBy)) continue;
      const value = row ? read(row, col.key) : undefined;
      if (col.type === "m:n")
        out[col.key] = Array.isArray(value) ? value.map((x) => (typeof x === "object" ? x?.id : x)).join("\n") : "";
      else if (col.type === "JsonType" && col.key !== "traits")
        out[col.key] = value == null ? "" : JSON.stringify(value, null, 1).replace(/\n\s*/g, " ");
      else if (col.type === "JsonType" || col.type === "EnumArrayType")
        out[col.key] = Array.isArray(value) ? [...value] : [];
      else if (col.type === "m:1") out[col.key] = value == null ? "" : typeof value === "object" ? value.id : value;
      else if (!row && CHECKS[`${name}.${col.key}`]) out[col.key] = CHECKS[`${name}.${col.key}`][0];
      else out[col.key] = value == null ? "" : String(value);
    }
    if ("trait" in out) {
      const trait = row ? read(row, "trait") : null;
      out._trait = JSON.parse(JSON.stringify(trait ?? {}));
    }
    return out;
  }

  function patchFrom(current, name, base) {
    const out = {};
    for (const col of columnsFor(name)) {
      if (!(col.key in current)) continue;
      let value = current[col.key];
      if (col.key === "trait") {
        value = current._trait;
        if (value && Object.values(value).some((x) => x && typeof x === "object" && "__raw" in x)) value = "__INVALID__";
      } else if (col.type === "m:n") value = String(value).split(/\s+/).filter(Boolean);
      else if (col.type === "JsonType" && col.key !== "traits") {
        try { value = value === "" ? null : JSON.parse(value); } catch { value = "__INVALID__"; }
      } else if (col.type === "integer") value = value === "" ? null : Number(value);
      else if (col.type === "m:1" || col.nullable) value = value === "" ? null : value;
      if (!base) {
        const blank = value === null || value === ""
          || (Array.isArray(value) && value.length === 0)
          || (col.key === "trait" && value && typeof value === "object" && !Object.keys(value).length);
        if (!blank) out[col.key] = value;
        continue;
      }
      const was = plainRow(base, name)[col.key] ?? null;
      if (JSON.stringify(value) !== JSON.stringify(was)) out[col.key] = value;
    }
    return out;
  }

  function editField(event) {
    const { field } = event.currentTarget.dataset;
    draft = { ...draft, [field]: event.currentTarget.value };
  }
  function nullField(event) {
    draft = { ...draft, [event.currentTarget.dataset.field]: "" };
  }
  function toggleTrait(event) {
    const name = event.currentTarget.dataset.trait;
    const traits = draft.traits.includes(name) ? draft.traits.filter((x) => x !== name) : [...draft.traits, name];
    const trait = { ...draft._trait };
    if (!traits.includes(name)) delete trait[name];
    else trait[name] = trait[name] ?? {};
    draft = { ...draft, traits, _trait: trait };
  }
  function setCustomTrait(event) { customTrait = event.currentTarget.value.toUpperCase(); }
  function customTraitKey(event) {
    if (event.key !== "Enter") return;
    const name = customTrait.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
    customTrait = "";
    if (!name || draft.traits.includes(name)) return;
    draft = { ...draft, traits: [...draft.traits, name], _trait: { ...(draft._trait ?? {}), [name]: {} } };
  }
  function editTraitJson(event) {
    const name = event.currentTarget.dataset.trait;
    const raw = event.currentTarget.value;
    let value;
    try { value = JSON.parse(raw); } catch { value = { __raw: raw }; }
    draft = { ...draft, _trait: { ...draft._trait, [name]: value } };
  }
  function editTraitField(event) {
    const { trait, key, kind } = event.currentTarget.dataset;
    const raw = event.currentTarget.value;
    let value = raw;
    if (raw === "") value = undefined;
    else if (kind === "boolean") value = raw === "true";
    else if (kind === "integer" || kind === "number") value = Number(raw);
    else if (kind === "json") { try { value = JSON.parse(raw); } catch { value = raw; } }
    const next = { ...draft._trait, [trait]: { ...(draft._trait[trait] ?? {}) } };
    if (value === undefined) delete next[trait][key];
    else next[trait][key] = value;
    draft = { ...draft, _trait: next };
  }

  async function saveDraft() {
    const repo = repoFor(entity);
    const patch = patchFrom(draft, entity, creating ? null : original);
    if (!repo || Object.values(patch).includes("__INVALID__")) return;
    busy = true;
    try {
      if (creating) {
        log("POST", `${mountOf(entity)}/create`, JSON.stringify({ data: patch }));
        const row = await repo.create(patch);
        creating = false;
        selectedId = read(row, "id");
        original = row;
        draft = draftFrom(row, entity);
        flash(selectedId, "create");
      } else {
        log("POST", `${mountOf(entity)}/updateOne`, JSON.stringify({ where: { id: selectedId }, data: patch }));
        const row = await repo.updateOne({ id: selectedId }, patch);
        original = row ?? original;
        draft = draftFrom(original, entity);
        flash(selectedId, "update");
      }
      await refreshCounts();
      await load();
    } catch (error) {
      request = { ...request, message: String(error?.message ?? error), status: "error" };
    } finally { busy = false; }
  }

  function revertDraft() {
    draft = draftFrom(original, entity);
    confirmRemove = false;
  }

  async function removeRow() {
    if (!confirmRemove) { confirmRemove = true; return; }
    const repo = repoFor(entity);
    const id = selectedId;
    confirmRemove = false;
    busy = true;
    try {
      log("POST", `${mountOf(entity)}/removeOne`, JSON.stringify({ where: { id } }));
      await repo.removeOne({ id });
      selectedId = null;
      draft = null;
      original = null;
      await refreshCounts();
      await load();
    } catch (error) {
      request = { ...request, message: String(error?.message ?? error), status: "error" };
    } finally { busy = false; }
  }

  async function removeSelected() {
    if (!confirmBulk) { confirmBulk = true; return; }
    const repo = repoFor(entity);
    const ids = [...selection];
    confirmBulk = false;
    busy = true;
    try {
      log("POST", `${mountOf(entity)}/remove`, JSON.stringify({ where: { id: { $in: ids } } }));
      await repo.remove({ id: { $in: ids } });
      selection = [];
      anchorId = null;
      if (ids.includes(selectedId)) { selectedId = null; draft = null; original = null; }
      await refreshCounts();
      await load();
    } catch (error) {
      request = { ...request, message: String(error?.message ?? error), status: "error" };
    } finally { busy = false; }
  }

  function flash(id, op) {
    badges = { ...badges, [id]: op };
    setTimeout(() => {
      const next = { ...badges };
      delete next[id];
      badges = next;
    }, 4000);
  }

  function loadCandidates(name) {
    for (const col of columnsFor(name)) {
      if (col.type !== "m:1") continue;
      const target = col.target;
      if (candidates[target] || candidateLoads[target]) continue;
      const repo = repoFor(target);
      if (!repo) continue;
      candidateLoads[target] = repo.find({}, { limit: 200 })
        .then((rows) => {
          candidates = {
            ...candidates,
            [target]: rows.map((row) => ({ id: read(row, "id"), label: `${identify(target, row)} · ${short(read(row, "id"))}` })),
          };
        })
        .catch(() => { candidates = { ...candidates, [target]: [] }; })
        .finally(() => { delete candidateLoads[target]; });
    }
  }

  function openCreate() {
    if (!doorOf(entity)?.verbs.includes("create")) return;
    loadCandidates(entity);
    const blank = draftFrom(null, entity);
    const ontology = clauses.find((clause) => clause.field === "ontology");
    if ("ontology" in blank && ontology) blank.ontology = ontology.value;
    creating = true;
    selectedId = null;
    original = null;
    draft = blank;
    editorMode = "form";
    confirmRemove = false;
    editorHidden = false;
    customTrait = "";
  }
  function closeEditor() { editorHidden = true; creating = false; }

  function selectRow(event) {
    const id = event.currentTarget.dataset.id;
    const onBox = !!event.target.closest?.('[data-col="_sel"]');
    if (onBox || event.metaKey || event.ctrlKey || event.shiftKey) { toggleSel(id, event.shiftKey); return; }
    if (selectedId === id) { selectedId = null; draft = null; original = null; creating = false; return; }
    const row = request.rows.find((candidate) => read(candidate, "id") === id);
    selectedId = id;
    creating = false;
    original = row;
    draft = draftFrom(row, entity);
    confirmRemove = false;
    customTrait = "";
    editorHidden = false;
    loadCandidates(entity);
  }
  function toggleSel(id, range) {
    if (range && anchorId) {
      const ids = request.rows.map((row) => read(row, "id"));
      const from = ids.indexOf(anchorId);
      const to = ids.indexOf(id);
      if (from >= 0 && to >= 0) {
        const [lo, hi] = from < to ? [from, to] : [to, from];
        selection = [...new Set([...selection, ...ids.slice(lo, hi + 1)])];
        confirmBulk = false;
        return;
      }
    }
    selection = selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id];
    anchorId = id;
    confirmBulk = false;
  }
  function togglePageSel() {
    const ids = request.rows.map((row) => read(row, "id"));
    const all = ids.length > 0 && ids.every((id) => selection.includes(id));
    selection = all ? selection.filter((id) => !ids.includes(id)) : [...new Set([...selection, ...ids])];
    confirmBulk = false;
  }
  function clearSelection() { selection = []; anchorId = null; confirmBulk = false; }
  function focusCell(event) {
    const col = event.currentTarget.dataset.col;
    if (col === "_sel") return;
    const id = event.currentTarget.parentElement?.dataset.id;
    if (id) lastCell = { id, col };
  }

  function csv(rows, cols) {
    const quote = (value) => {
      const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const keys = cols.filter((col) => !["1:m", "m:n"].includes(col.type)).map((col) => col.key);
    return [keys.join(","), ...rows.map((row) => keys.map((key) => quote(row[key])).join(","))].join("\n");
  }

  async function copy(event) {
    const scope = event.currentTarget.dataset.scope;
    let text = "";
    let label = "";
    if (scope === "cell" && lastCell) {
      const row = request.rows.find((candidate) => read(candidate, "id") === lastCell.id);
      const value = read(row, lastCell.col);
      text = value == null ? "" : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
      label = `${lastCell.col} of ${short(lastCell.id)}`;
    } else if (scope === "selected") {
      text = JSON.stringify(creating ? patchFrom(draft, entity, null) : plainRow(original, entity), null, 2);
      label = "row json";
    } else {
      let rows;
      if (scope === "rows") rows = request.rows.filter((row) => selection.includes(read(row, "id")));
      else if (scope === "page") rows = request.rows;
      else {
        const repo = repoFor(entity);
        log("POST", `${mountOf(entity)}/find`, JSON.stringify({ where: buildWhere(), options: { orderBy: { [sortKey]: sortDir } } }));
        rows = await repo.find(buildWhere(), { orderBy: { [sortKey]: sortDir } });
      }
      const clean = rows.map((row) => plainRow(row, entity));
      text = copyFmt === "csv" ? csv(clean, cols) : JSON.stringify(clean, null, 2);
      label = `${clean.length} ${entity} row${clean.length === 1 ? "" : "s"} · ${copyFmt}`;
    }
    try { await navigator.clipboard?.writeText(text); } catch {}
    toast = `copied ${label}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = ""), 2200);
  }

  function setQueryTab(event) {
    queryTab = event.currentTarget.dataset.tab;
    rawText = JSON.stringify({ where: buildWhere(), options: buildOptions() }, null, 2);
    rawError = "";
  }
  function runRaw() {
    try {
      const body = JSON.parse(rawText);
      const next = [];
      for (const [field, value] of Object.entries(body.where ?? {})) {
        if (field === "traits") for (const trait of [].concat(value)) next.push({ field, op: "traits", value: String(trait) });
        else if (value === null) next.push({ field, op: "$null", value: "" });
        else if (typeof value !== "object") next.push({ field, op: "$eq", value: String(value) });
        else for (const [op, operand] of Object.entries(value))
          next.push({ field, op, value: Array.isArray(operand) ? operand.join(",") : String(operand) });
      }
      const options = body.options ?? {};
      const key = options.orderBy ? Object.keys(options.orderBy)[0] : sortKey;
      query({
        clauses: next, populate: options.populate ?? [], sortKey: key,
        sortDir: options.orderBy?.[key] ?? "asc", limit: options.limit ?? limit, rawError: "",
      });
    } catch (error) { rawError = String(error.message); }
  }

  function addClause() {
    if (newValue === "" && newOp !== "$null") return;
    query({ clauses: [...clauses, { field: newField, op: newOp, value: newValue }], newValue: "" });
  }
  function clauseKey(event) { if (event.key === "Enter") addClause(); }
  function dropClause(event) {
    const index = Number(event.currentTarget.dataset.index);
    query({ clauses: clauses.filter((_, position) => position !== index) });
  }
  function clearQuery() { query({ clauses: [], populate: [] }); }
  function saveQuery() {
    const name = clauses.length
      ? clauses.map((c) => `${c.field}${c.op === "$eq" ? "=" : ` ${c.op} `}${c.value}`).join(" & ")
      : `all ${entity}`;
    saved = [...saved, { entity, name, clauses: [...clauses], populate: [...populate], sortKey, sortDir }];
    try { localStorage.setItem("dataspace.v2.saved", JSON.stringify(saved)); } catch {}
  }
  function loadSaved(event) {
    const query_ = saved[Number(event.currentTarget.dataset.index)];
    query({ clauses: query_.clauses, populate: query_.populate, sortKey: query_.sortKey, sortDir: query_.sortDir });
  }
  function dropSaved(event) {
    const index = Number(event.currentTarget.dataset.index);
    saved = saved.filter((_, position) => position !== index);
    try { localStorage.setItem("dataspace.v2.saved", JSON.stringify(saved)); } catch {}
  }

  function togglePopulate(event) {
    const relation = event.currentTarget.dataset.rel;
    query({ populate: populate.includes(relation) ? populate.filter((x) => x !== relation) : [...populate, relation] }, { keepOffset: true });
  }
  function sortBy(event) {
    const key = event.currentTarget.dataset.col;
    if (key === "_sel") { togglePageSel(); return; }
    const col = columnsFor(entity).find((candidate) => candidate.key === key);
    if (!col || ["1:m", "m:n"].includes(col.type)) return;
    query(key === sortKey ? { sortDir: sortDir === "asc" ? "desc" : "asc" } : { sortKey: key, sortDir: "asc" });
  }
  function page(direction) {
    offset = Math.max(0, offset + direction * limit);
    load();
  }

  function pickEntity(event) {
    const name = event.currentTarget.dataset.entity;
    if (!doorOf(name) || !repoFor(name)) return;
    goEntity(name, [], { crumbs: [], screen: "grid", erSel: null });
  }
  function pickFacet(event) {
    const { entity: name, field, value, op } = event.currentTarget.dataset;
    goEntity(name, [{ field, op: op || "$eq", value }], { crumbs: [] });
  }
  function jumpRel(event) {
    event.stopPropagation();
    const { relEntity, relId, relField } = event.currentTarget.dataset;
    if (!relId || !doorOf(relEntity) || !repoFor(relEntity)) return;
    const crumb = { label: crumbLabel(), entity, clauses: [...clauses], populate: [...populate], sortKey, sortDir };
    if (relField) goEntity(relEntity, [{ field: relField, op: "$eq", value: relId }], { crumbs: [...crumbs, crumb] });
    else goEntity(relEntity, [{ field: "id", op: "$eq", value: relId }], { crumbs: [...crumbs, crumb] });
  }
  function jumpCrumb(event) {
    const index = Number(event.currentTarget.dataset.index);
    const crumb = crumbs[index];
    crumbs = crumbs.slice(0, index);
    goEntity(crumb.entity, crumb.clauses, { crumbs: crumbs.slice(0, index) });
    populate = crumb.populate;
    sortKey = crumb.sortKey;
    sortDir = crumb.sortDir;
  }

  function togglePanel(event) {
    const key = event.currentTarget.dataset.panel;
    if (key === "catalog") catalogOpen = !catalogOpen;
    else if (key === "inspector") editorHidden = !editorHidden;
    else if (key === "wire") wireOpen = !wireOpen;
    else erMetaOpen = !erMetaOpen;
  }

  function toCanvas(event) {
    const rect = erRef.getBoundingClientRect();
    return [(event.clientX - rect.left - canvas.x) / canvas.z, (event.clientY - rect.top - canvas.y) / canvas.z];
  }
  function erPosOf(name) { return erPos[name] ?? ER_HOME[name] ?? [0, 0]; }
  function erDown(event) {
    event.stopPropagation();
    const name = event.currentTarget.dataset.entity;
    const [x, y] = erPosOf(name);
    const [cx, cy] = toCanvas(event);
    erDrag = { name, dx: cx - x, dy: cy - y };
    erMoved = false;
    event.preventDefault();
  }
  function panDown(event) {
    if (event.target.closest("[data-entity],[data-edge]")) return;
    pan = { x: event.clientX, y: event.clientY, vx: canvas.x, vy: canvas.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function erMove(event) {
    if (pan) {
      canvas = { ...canvas, x: pan.vx + (event.clientX - pan.x), y: pan.vy + (event.clientY - pan.y) };
      panning = true;
      return;
    }
    if (!erDrag) return;
    const [cx, cy] = toCanvas(event);
    erMoved = true;
    erPos = { ...erPos, [erDrag.name]: [Math.round(cx - erDrag.dx), Math.round(cy - erDrag.dy)] };
  }
  function erUp() {
    erDrag = null;
    if (pan) { pan = null; panning = false; }
  }
  function erWheel(event) {
    const rect = erRef.getBoundingClientRect();
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp(-event.deltaY * 0.01);
      const z = Math.max(0.2, Math.min(3, canvas.z * factor));
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      canvas = { x: mx - (mx - canvas.x) * (z / canvas.z), y: my - (my - canvas.y) * (z / canvas.z), z };
    } else canvas = { ...canvas, x: canvas.x - event.deltaX, y: canvas.y - event.deltaY };
  }
  function erReset(event) {
    if (event.target.closest("[data-entity],[data-edge]")) return;
    canvas = { x: 24, y: 24, z: 1 };
  }
  function selectNode(event) {
    if (erMoved) { erMoved = false; return; }
    const id = event.currentTarget.dataset.entity;
    erSel = erSel?.id === id && erSel.kind === "node" ? null : { kind: "node", id };
  }
  function selectEdge(event) {
    event.stopPropagation();
    const id = event.currentTarget.dataset.edge;
    erSel = erSel?.id === id && erSel.kind === "edge" ? null : { kind: "edge", id };
  }
  function hoverNode(event) { if (!erDrag) erHover = { kind: "node", id: event.currentTarget.dataset.entity }; }
  function hoverEdge(event) { if (!erDrag) erHover = { kind: "edge", id: event.currentTarget.dataset.edge }; }
  function unhover() { erHover = null; }

  function toggleLive() {
    live = !live;
    if (live) log("GET", `${mountOf(entity)}/subscribe`, JSON.stringify({ where: buildWhere() }));
  }

  $effect(() => {
    if (!live || !booted) return;
    const name = entity;
    const repo = repoFor(name);
    if (!repo || !doorOf(name)?.verbs.includes("subscribe")) return;
    const off = repo.subscribe({}, (row, event) => {
      const id = row ? read(row, "id") : event?.entity?.id ?? event?.entity;
      log("SSE", `${mountOf(name)}/subscribe`, JSON.stringify({ op: event?.op, id }));
      badges = { ...badges, [id]: event?.op ?? "update" };
      setTimeout(() => {
        const next = { ...badges };
        delete next[id];
        badges = next;
      }, 4000);
      if (event?.op === "delete") request = { ...request, rows: request.rows.filter((r) => read(r, "id") !== id) };
      else pulse += 1;
    });
    return () => { try { off?.(); } catch {} };
  });

  const cols = $derived.by(() => {
    colTick;
    const all = applyPrefs(columnsFor(entity), entity);
    const hidden = prefsFor(entity).hidden;
    return all.filter((col) => !hidden.includes(col.key));
  });
  const colsAll = $derived.by(() => { colTick; return applyPrefs(columnsFor(entity), entity); });
  const hiddenKeys = $derived.by(() => { colTick; return prefsFor(entity).hidden; });
  const template = $derived(["34px", ...cols.map((col) => `${col.width}px`)].join(" "));
  const scalarKeys = $derived(cols.filter((col) => !["1:m", "m:n"].includes(col.type)).map((col) => col.key));
  const relsM1 = $derived(cols.filter((col) => col.type === "m:1"));
  const door = $derived(doorOf(entity));
  const opOptions = $derived(newField === "traits" ? ["traits"] : OPS.filter((op) => op !== "traits"));

  const catalog = $derived.by(() => {
    if (!datamap) return [];
    return SETS.map((set) => {
      const entities = set.entities.filter((name) => datamap[name]).map((name) => {
        const entry = doorOf(name);
        const active = name === entity;
        const writes = !!entry?.verbs.includes("create");
        const facets = name === "literal"
          ? Object.keys(ONTOLOGIES).map((ontology) => ({
              label: ontology, field: "ontology", op: "$eq", value: ontology, count: "",
              indent: 0, leaf: true, caret: "", foldKey: "",
              on: active && clauses.some((c) => c.field === "ontology" && c.value === ontology),
            }))
          : name === "mode" && entity === "mode"
          ? [...new Set(request.rows.map((row) => read(row, "type")))].map((type) => ({
              label: type, field: "type", op: "$eq", value: type, count: "",
              indent: 0, leaf: true, caret: "", foldKey: "",
              on: clauses.some((c) => c.field === "type" && c.value === type),
            }))
          : name === "symbol" && entity === "symbol"
          ? symbolTree(request.rows, true)
          : [];
        const foldKey = `ent:${name}`;
        const folded = !isOpen(foldKey, false);
        return {
          name, noDoor: !entry, count: entry ? String(counts[name] ?? "—") : "via thread",
          facets, showFacets: facets.length > 0 && !folded,
          foldKey, caret: facets.length ? (folded ? "▸" : "▾") : "", hasFacets: facets.length > 0,
          active, writes,
          doorTitle: !entry ? "no door on this daemon"
            : writes ? `${entry.verbs.length} doors · read/write/subscribe`
            : "read-only · find…count + subscribe",
        };
      });
      const key = `set:${set.name}`;
      return { name: set.name, key, open: isOpen(key), caret: isOpen(key) ? "▾" : "▸", entities };
    }).filter((set) => set.entities.length);
  });

  const schemaColumns = $derived(
    cols.filter((col) => !["m:1", "1:m", "m:n", "id"].includes(col.type))
      .map((col) => ({ key: col.key, label: typeLabel(col) + (col.nullable ? "?" : "") })),
  );
  const schemaRelations = $derived(
    cols.filter((col) => ["m:1", "1:m", "m:n"].includes(col.type))
      .map((col) => ({ key: col.key, kind: col.type, target: col.target })),
  );

  function cellOf(col, row) {
    const value = read(row, col.key);
    const base = { kind: "text", text: "", muted: false, italic: false, title: "" };
    if (col.type === "id") return { ...base, text: short(value), muted: true, title: String(value ?? "") };
    if (col.type === "Date") return { ...base, text: fmtDate(value), muted: true, title: String(value ?? "") };
    if (col.type === "m:1") {
      if (value == null) return { ...base, text: "—", muted: true };
      const id = typeof value === "object" ? value.id : value;
      const label = typeof value === "object" ? identify(col.target, value) : short(id);
      if (!doorOf(col.target) || !repoFor(col.target))
        return { ...base, text: label, muted: true, title: `${col.target} · no door on this daemon · ${id}` };
      return { kind: "rel", relEntity: col.target, relId: id, relField: "", text: label, title: `${col.target} ${id}`, muted: false, italic: false };
    }
    if (col.type === "1:m" || col.type === "m:n") {
      const known = Array.isArray(value) ? value.length : null;
      if (!col.mappedBy || !doorOf(col.target) || !repoFor(col.target))
        return { ...base, text: known == null ? "—" : `[ ${known} ]`, muted: true, title: `${col.type} ${col.target}` };
      return {
        kind: "rel", relEntity: col.target, relId: read(row, "id"), relField: col.mappedBy,
        text: known == null ? "→" : String(known), muted: false, italic: false,
        title: `${col.target} where ${col.mappedBy} = ${read(row, "id")}`,
      };
    }
    if (value == null || value === "") return { ...base, text: "—", muted: true };
    if (Array.isArray(value))
      return value.length
        ? { kind: "pills", pills: value.map((x) => (typeof x === "object" ? x?.type ?? "{…}" : String(x))).slice(0, 8), title: JSON.stringify(value) }
        : { ...base, text: "[ ]", muted: true };
    if (typeof value === "object") {
      const leaves = [];
      const walk = (node, prefix) => {
        for (const [key, inner] of Object.entries(node)) {
          if (inner && typeof inner === "object" && !Array.isArray(inner)) walk(inner, prefix ? `${prefix}.${key}` : key);
          else leaves.push(`${prefix ? `${prefix}.` : ""}${key}=${Array.isArray(inner) ? `[${inner.length}]` : inner}`);
        }
      };
      walk(value, "");
      if (!leaves.length) return { ...base, text: "{ }", muted: true };
      return { kind: "text", text: leaves.join("  "), muted: false, italic: true, title: JSON.stringify(value, null, 1), body: true };
    }
    if (["type", "ontology", "phase", "status", "role"].includes(col.key))
      return { kind: "pills", pills: [String(value)], title: String(value) };
    if (col.key === "installed") return { ...base, text: String(value), muted: true, title: "content hash" };
    return { ...base, text: String(value), title: String(value), number: col.type === "integer" };
  }

  const gridRows = $derived.by(() => {
    pulse;
    return request.rows.map((row) => {
      const id = read(row, "id");
      return {
        id,
        selected: id === selectedId,
        picked: selection.includes(id),
        badge: badges[id] ?? "",
        cells: cols.map((col) => ({ key: col.key, ...cellOf(col, row) })),
      };
    });
  });

  const pageIds = $derived(request.rows.map((row) => read(row, "id")));
  const allPageSel = $derived(pageIds.length > 0 && pageIds.every((id) => selection.includes(id)));
  const somePageSel = $derived(pageIds.some((id) => selection.includes(id)));
  const rangeText = $derived(`${request.total ? offset + 1 : 0}–${Math.min(offset + limit, request.total)} / ${request.total}`);
  const wireBody = $derived(JSON.stringify({ where: buildWhere(), options: buildOptions() }));
  const savedHere = $derived(saved.map((q, index) => ({ ...q, index })).filter((q) => q.entity === entity));

  const erNodes = $derived.by(() => {
    if (!datamap) return [];
    return Object.keys(datamap).map((name) => {
      const [x, y] = erPosOf(name);
      const columns = Object.entries(datamap[name].columns ?? {}).filter(([key]) => !["id", "createdAt", "updatedAt"].includes(key));
      return {
        name, x, y, w: ER_W, h: 30 + columns.length * ER_LH,
        noDoor: !doorOf(name), active: name === entity,
        on: erSel?.kind === "node" && erSel.id === name,
        hover: erHover?.kind === "node" && erHover.id === name,
        count: doorOf(name) ? String(counts[name] ?? "—") : "no door",
        cols: columns.map(([key, col]) => ({ text: key + (col.nullable ? "?" : ""), type: typeLabel({ type: col.type }) })),
      };
    });
  });

  const erEdges = $derived.by(() => {
    if (!datamap) return [];
    const byName = Object.fromEntries(erNodes.map((node) => [node.name, node]));
    const out = [];
    for (const [name, meta] of Object.entries(datamap)) {
      for (const [field, prop] of Object.entries(meta.properties ?? {})) {
        if (!prop.owner) continue;
        const a = byName[name];
        const b = byName[prop.target];
        if (!a || !b) continue;
        const id = `${name}.${field}`;
        const on = erSel?.kind === "edge" && erSel.id === id;
        const hover = erHover?.kind === "edge" && erHover.id === id;
        const touch = erSel?.kind === "node" && (erSel.id === name || erSel.id === prop.target);
        const shared = { id, label: field, source: name, target: prop.target, kind: prop.kind, nullable: !!prop.nullable, on, hot: hover || touch };
        if (a === b) {
          const x = a.x + a.w;
          const y = a.y + 10;
          out.push({ ...shared, d: `M ${x} ${y} C ${x + 44} ${y - 30}, ${x + 44} ${y + 34}, ${x} ${y + 24}`, lx: x + 40, ly: y + 2 });
          continue;
        }
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
        const horiz = Math.abs(ax - bx) > Math.abs(ay - by) || Math.abs(ax - bx) > ER_W;
        const sx = horiz ? (ax < bx ? a.x + a.w : a.x) : ax;
        const sy = horiz ? ay : (ay < by ? a.y + a.h : a.y);
        const ex = horiz ? (ax < bx ? b.x : b.x + b.w) : bx;
        const ey = horiz ? by : (ay < by ? b.y : b.y + b.h);
        const mx = (sx + ex) / 2, my = (sy + ey) / 2;
        out.push({
          ...shared,
          d: horiz ? `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}` : `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`,
          lx: mx, ly: my,
        });
      }
    }
    return out;
  });

  const erMeta = $derived.by(() => {
    if (!erSel || !datamap) return null;
    if (erSel.kind === "node") {
      const name = erSel.id;
      const meta = datamap[name];
      const entry = doorOf(name);
      const columns = Object.entries(meta.columns ?? {});
      const relations = Object.entries(meta.properties ?? {});
      return {
        kind: "table", title: name, target: entry ? name : "",
        sections: [
          { name: "table", rows: [
            { k: "rows", v: entry ? String(counts[name] ?? "—") : "no door · via thread.user" },
            { k: "set", v: SETS.find((set) => set.entities.includes(name))?.name ?? "—" },
            { k: "scope", v: entry ? scopedNote(name) : "—", warn: !!entry?.scoped },
            { k: "mount", v: entry ? entry.mount : "—" },
            { k: "doors", v: entry ? `${entry.verbs.length} · ${entry.verbs.includes("create") ? "read/write" : "read-only"}` : "—" },
            { k: "kind", v: name === "activity" ? "VirtualEntity · no table" : "DataEntity" },
          ] },
          { name: `columns · ${columns.length}`, rows: columns.map(([key, col]) => ({ k: key + (col.nullable ? "?" : ""), v: typeLabel({ type: col.type }) })) },
          { name: `relations · ${relations.length}`, rows: relations.map(([key, prop]) => ({
            k: key, v: `${prop.kind} → ${prop.target}${prop.owner ? " · owner" : prop.mappedBy ? ` · by ${prop.mappedBy}` : ""}${prop.nullable ? " · ?" : ""}`,
          })) },
        ],
      };
    }
    const edge = erEdges.find((candidate) => candidate.id === erSel.id);
    if (!edge) return null;
    const prop = datamap[edge.source].properties[edge.label];
    const inverse = Object.entries(datamap[edge.target].properties ?? {})
      .find(([, other]) => other.mappedBy === edge.label && other.target === edge.source);
    return {
      kind: "relation", title: `${edge.source}.${edge.label}`, target: edge.target,
      sections: [
        { name: "relation", rows: [
          { k: "kind", v: edge.kind },
          { k: "from", v: edge.source },
          { k: "to", v: edge.target },
          { k: "owner", v: prop.owner ? `yes · fk column on ${edge.source}` : "no" },
          { k: "nullable", v: edge.nullable ? "yes" : "no", warn: edge.nullable },
          { k: "inverse", v: inverse ? `${edge.target}.${inverse[0]} (${inverse[1].kind})` : "none · one-way" },
          { k: "populate", v: `options.populate: ["${edge.label}"]` },
        ] },
        { name: "cast", rows: [
          { k: "client", v: edge.kind === "m:1" ? "resolve inward → identity map" : `computed outward $${edge.label}` },
        ] },
      ],
    };
  });

  const editorOpen = $derived(!!(draft && (selectedId || creating)) && !editorHidden);
  const patch = $derived(draft ? patchFrom(draft, entity, creating ? null : original) : {});
  const dirty = $derived(Object.keys(patch).length > 0);
  const invalid = $derived(Object.values(patch).includes("__INVALID__"));
  const canWrite = $derived(!!door?.verbs.includes(creating ? "create" : "updateOne"));

  const traitOptions = $derived.by(() => {
    if (!draft) return [];
    if (entity === "literal") return ONTOLOGIES[draft.ontology] ?? [...new Set(Object.values(ONTOLOGIES).flat())];
    return ENUMS[entity] ?? [];
  });

  const formFields = $derived.by(() => {
    if (!draft) return [];
    return cols.filter((col) => col.key in draft).map((col) => {
      if (col.key === "trait") return null;
      const value = draft[col.key];
      const enumKey = `${entity}.${col.key}`;
      const field = {
        name: col.key, type: typeLabel(col) + (col.nullable ? "?" : ""),
        nullable: !!col.nullable && col.key !== "traits",
        value: Array.isArray(value) ? "" : value,
        modified: !creating && col.key in patch,
        flag: !creating && col.key in patch ? (patch[col.key] === "__INVALID__" ? "invalid json" : "modified") : "",
        bad: patch[col.key] === "__INVALID__",
        placeholder: col.nullable ? "null" : col.type === "m:1" ? `— pick a ${col.target} —` : "",
        kind: "text", options: [], target: col.target ?? "",
        big: col.key === "data" || col.key === "parts",
        hint: "",
      };
      if (col.type === "m:1") {
        field.kind = "rel";
        const known = candidates[col.target] ?? null;
        field.options = known ? [...known] : [];
        if (value && known && !known.some((option) => option.id === value))
          field.options = [{ id: value, label: `${short(value)} · not loaded` }, ...field.options];
        field.pending = known === null;
        field.relLabel = known?.find((option) => option.id === value)?.label.split(" · ")[0] ?? (value ? short(value) : "—");
        field.canJump = !!value && !!doorOf(col.target) && !!repoFor(col.target);
      } else if (col.type === "m:n") {
        field.kind = "ids";
        field.hint = `m:n owner · ${String(value).split(/\s+/).filter(Boolean).length} ${col.target} ids · written as [{id}] on ${creating ? "create" : "updateOne"}`;
      } else if (col.key === "traits") {
        field.kind = "traits";
        field.traits = [...new Set([...traitOptions, ...(Array.isArray(value) ? value : [])])].map((name) => ({
          name, held: (value ?? []).includes(name),
          title: traitOptions.includes(name)
            ? ((value ?? []).includes(name) ? "claimed · click to drop" : "allowed · click to claim")
            : "custom claim · not in the enum",
        }));
        field.hint = entity === "literal"
          ? (draft.ontology ? `ONTOLOGIES.${draft.ontology} allows ${traitOptions.length} traits · mint refuses others` : "pick an ontology to narrow the allowed traits")
          : ENUMS[entity] ? `${entity} enum · ${traitOptions.length} traits` : "free json array";
      } else if (col.type === "JsonType") field.kind = "json";
      else if (col.type === "integer") field.kind = "int";
      else if (col.type === "string" && CHECKS[enumKey]) {
        field.kind = "enum";
        field.options = CHECKS[enumKey];
      } else field.kind = "text";
      return field;
    }).filter(Boolean);
  });

  const traitForms = $derived.by(() => {
    if (!draft || !("_trait" in draft)) return [];
    return (draft.traits ?? []).map((name) => {
      const schema = TRAIT_SCHEMA[name];
      const values = draft._trait[name] ?? {};
      const bad = values && "__raw" in values;
      return {
        name, free: !schema, bad,
        json: bad ? values.__raw : JSON.stringify(values),
        note: schema
          ? (schema.length ? `${schema.filter((k) => !k.optional).length} required · ${schema.filter((k) => k.optional).length} optional` : "claim only · no payload")
          : bad ? "invalid json" : "no schema known · free json payload",
        fields: (schema ?? []).map((key) => {
          const raw = values[key.key];
          return {
            key: key.key, kind: key.kind,
            value: raw === undefined ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw),
            required: !key.optional, options: key.options ?? [],
          };
        }),
      };
    });
  });

  const collections = $derived(
    creating || !selectedId ? [] :
    cols.filter((col) => (col.type === "1:m" || col.type === "m:n") && col.mappedBy && doorOf(col.target) && repoFor(col.target))
      .map((col) => ({ name: col.key, target: col.target, mappedBy: col.mappedBy })),
  );

  const traitSchemaSource = $derived(
    entity === "literal" || entity === "symbol" ? "assembly domain · schematics.js"
    : entity === "thread" ? "typology · schematics/entities/thread.js"
    : "local table · not on the wire",
  );

  const panels = $derived([
    { key: "catalog", glyph: "▤", label: "catalog", on: catalogOpen, title: "entity catalog · datamap sets", dim: false },
    { key: "inspector", glyph: "▥", label: "inspector", on: editorOpen, title: draft ? "row inspector / editor" : "row inspector · select a row first", dim: !draft },
    { key: "wire", glyph: "≡", label: "wire", on: wireOpen, title: "wire log · every call this view makes", dim: false },
    ...(screen === "schema" ? [{ key: "meta", glyph: "▦", label: "metadata", on: erMetaOpen, title: "schema metadata sidebar", dim: false }] : []),
  ]);

  try { saved = JSON.parse(localStorage.getItem("dataspace.v2.saved") || "[]"); } catch {}
  boot();
</script>

<div class="dataspace">
  <div class="bar">
    <span class="brand">dataspace</span>
    <span class="origin">{daemon?.manifest?.slug ?? "daemon"} · {daemon?.mount?.absolute ?? ""}</span>
    <div class="crumbs">
      {#each crumbs as crumb, index}
        <button class="crumb" data-index={index} onclick={jumpCrumb}>{crumb.label}</button>
        <span class="crumb-sep">›</span>
      {/each}
      <span class="here">{crumbLabel()}</span>
    </div>
    <div class="group">
      <button class="tab" class:on={screen === "grid"} onclick={() => (screen = "grid")}>grid</button>
      <button class="tab" class:on={screen === "schema"} onclick={() => (screen = "schema")}>schema</button>
    </div>
    <button class="livebtn" class:on={live} onclick={toggleLive} title="subscribe to the current entity">
      <span class="dot" class:lit={live}></span>
      <span>live</span>
    </button>
    <div class="group" title="panels">
      {#each panels as panel}
        <button class="tab" class:on={panel.on} class:dim={panel.dim} data-panel={panel.key} onclick={togglePanel} title={panel.title}>
          <span class="glyph">{panel.glyph}</span><span>{panel.label}</span>
        </button>
      {/each}
    </div>
    <button class="mint" onclick={openCreate} disabled={!door?.verbs.includes("create")} title="new row">+ {entity}</button>
  </div>

  <div class="body">
    {#if catalogOpen}
      <div class="catalog" style="flex:0 0 {sizes.catalog}px">
        <div class="catalog-scroll">
          {#each catalog as set}
            <div class="set-head">
              <button class="set-btn" data-key={set.key} data-open={set.open} onclick={toggleFold}>
                <span class="caret-slot"><span class="caret">{set.caret}</span></span>
                <span class="set-name">{set.name}</span>
                <span class="rule"></span>
              </button>
            </div>
            {#if set.open}
              {#each set.entities as row}
                <div class="ent-line">
                  <button class="caret-btn" data-key={row.foldKey} data-open={!row.showFacets ? "false" : "true"} onclick={toggleFold} disabled={!row.hasFacets}>
                    <span class="caret" class:hide={!row.hasFacets}>{row.caret}</span>
                  </button>
                  <button class="ent" class:active={row.active} class:nodoor={row.noDoor} data-entity={row.name} onclick={pickEntity}>
                    <span class="pip" class:writes={row.writes} class:reads={!row.writes && !row.noDoor} title={row.doorTitle}></span>
                    <span class="ent-name">{row.name}</span>
                    <span class="ent-count">{row.count}</span>
                  </button>
                </div>
                {#if row.showFacets}
                  <div class="facets">
                    {#each row.facets as facet}
                      <div class="facet" style="padding-left:{facet.indent}px">
                        <button class="caret-btn small" data-key={facet.foldKey} data-open={facet.open} onclick={toggleFold} disabled={facet.leaf}>
                          <span class="caret" class:hide={facet.leaf}>{facet.caret}</span>
                        </button>
                        <button class="facet-btn" class:on={facet.on} data-entity={row.name} data-field={facet.field} data-op={facet.op} data-value={facet.value} onclick={pickFacet}>
                          <span class="facet-label">{facet.label}</span>
                          <span class="facet-count">{facet.count}</span>
                        </button>
                      </div>
                    {/each}
                  </div>
                {/if}
              {/each}
            {/if}
          {/each}
        </div>
        <div class="seam-h" class:hot={seam === "foot"} data-seam="foot" onpointerdown={seamDown} title="drag to resize"></div>
        <div class="catalog-foot" style="flex:0 0 {sizes.foot}px">
          <div class="foot-head">
            <span class="set-name">{entity}</span>
            <span class="rule"></span>
            <span class="mount">{door ? door.mount : "no door"}</span>
          </div>
          <div class="kv-list">
            {#each schemaColumns as column}
              <div class="kv"><span class="k">{column.key}</span><span class="dots"></span><span class="v">{column.label}</span></div>
            {/each}
            {#each schemaRelations as relation}
              <div class="kv"><span class="k rel">{relation.key}</span><span class="dots"></span><span class="v">{relation.kind} → {relation.target}</span></div>
            {/each}
          </div>
          <div class="verbs">
            {#each ALL_VERBS as verb}
              <span class="verb" class:has={door?.verbs.includes(verb)} class:write={/create|upsert|ensure|update|remove/.test(verb)} class:sub={verb === "subscribe"}>{verb}</span>
            {/each}
          </div>
        </div>
      </div>
      <div class="seam-v" class:hot={seam === "catalog"} data-seam="catalog" onpointerdown={seamDown} title="drag to resize"></div>
    {/if}

    <div class="main">
      {#if screen === "grid"}
        <div class="query">
          <div class="query-top">
            <div class="tabs">
              <button class="qtab" class:on={queryTab === "builder"} data-tab="builder" onclick={setQueryTab}>where</button>
              <button class="qtab" class:on={queryTab === "raw"} data-tab="raw" onclick={setQueryTab}>raw</button>
            </div>
            <span class="spacer"></span>
            {#each savedHere as item}
              <span class="saved">
                <button class="saved-load" data-index={item.index} onclick={loadSaved}>★ {item.name}</button>
                <button class="saved-drop" data-index={item.index} onclick={dropSaved}>×</button>
              </span>
            {/each}
            <button class="chip" class:on={colsOpen || hiddenKeys.length} onclick={() => (colsOpen = !colsOpen)} title="show/hide and reorder columns">
              ▥ columns {hiddenKeys.length ? `${cols.length}/${colsAll.length}` : ""}
            </button>
            <button class="chip" onclick={saveQuery} title="save query (localStorage)">☆ save</button>
            <button class="chip" onclick={clearQuery}>reset</button>
          </div>

          {#if queryTab === "builder"}
            <div class="clauses">
              {#each clauses as clause, index}
                <span class="clause">
                  <span class="cl-field">{clause.field}</span>
                  <span class="cl-op">{clause.op}</span>
                  <span class="cl-val">{clause.op === "$null" ? "null" : clause.value}</span>
                  <button class="cl-x" data-index={index} onclick={dropClause}>×</button>
                </span>
              {/each}
              <span class="clause new">
                <select bind:value={newField}>
                  {#each scalarKeys as key}<option value={key}>{key}</option>{/each}
                </select>
                <select bind:value={newOp}>
                  {#each opOptions as op}<option value={op}>{op}</option>{/each}
                </select>
                <input bind:value={newValue} onkeydown={clauseKey}
                  placeholder={newOp === "$like" ? "%arm%" : newOp === "$in" ? "a, b, c" : newOp === "traits" ? "PLACED" : "value"} />
                <button class="cl-add" onclick={addClause}>+</button>
              </span>
              <span class="hint">
                {newOp === "traits" ? "resolveTraits → LIKE '%T%' · find only, count skips it" : newOp === "$like" ? "% and _ wildcards" : ""}
              </span>
            </div>
            <div class="opts">
              <span class="opt">
                <span class="opt-label">populate</span>
                {#each relsM1 as relation}
                  <button class="chip" class:on={populate.includes(relation.key)} data-rel={relation.key} onclick={togglePopulate}>{relation.key}</button>
                {/each}
                {#if !relsM1.length}<span class="faint">no m:1 relations</span>{/if}
              </span>
              <span class="opt">
                <span class="opt-label">orderBy</span>
                <select bind:value={sortKey} onchange={() => query({})}>
                  {#each scalarKeys as key}<option value={key}>{key}</option>{/each}
                </select>
                <button class="chip" onclick={() => query({ sortDir: sortDir === "asc" ? "desc" : "asc" })}>{sortDir}</button>
              </span>
              <span class="opt">
                <span class="opt-label">limit</span>
                {#each PAGE_SIZES as size}
                  <button class="chip" class:on={limit === size} onclick={() => query({ limit: size })}>{size}</button>
                {/each}
              </span>
              <span class="spacer"></span>
              <span class="scope">{scopedNote(entity)}</span>
            </div>
          {/if}

          {#if colsOpen}
            <div class="colprefs">
              <span class="opt-label">columns · drag to reorder · click to toggle</span>
              {#each colsAll as column}
                <button class="colchip" class:hidden={hiddenKeys.includes(column.key)} data-col={column.key} draggable="true"
                  ondragstart={colDragStart} ondragover={colDragOver} ondrop={colDrop} onclick={toggleColumn}
                  title={hiddenKeys.includes(column.key) ? "hidden · click to show" : "shown · click to hide"}>
                  <span class="grip">⋮⋮</span><span>{column.key}</span><span class="colchip-type">{typeLabel(column)}</span>
                </button>
              {/each}
              <button class="chip push" onclick={resetColumns}>reset</button>
            </div>
          {/if}

          {#if queryTab === "raw"}
            <div class="raw">
              <textarea bind:value={rawText} spellcheck="false"></textarea>
              <div class="raw-side">
                <button class="run" onclick={runRaw}>▶ run</button>
                <span class="faint">daemon.entities.{entity}.find(body)</span>
                {#if rawError}<span class="err">{rawError}</span>{/if}
              </div>
            </div>
          {/if}
        </div>

        <div class="grid-scroll">
          {#if request.status === "loading"}
            <div class="notice">loading…</div>
          {:else if request.status === "error"}
            <div class="notice err">{request.message}</div>
          {:else if gridRows.length === 0}
            <div class="notice empty">
              <span class="empty-head">{request.total === 0 && !clauses.length ? `no ${entity} rows` : "no rows match"}</span>
              <span class="empty-line">
                {request.total === 0 && !clauses.length
                  ? (door?.verbs.includes("create") ? `POST ${door.mount}/create to mint one — or + ${entity} above` : `${entity} is read-only on this daemon`)
                  : `where ${JSON.stringify(buildWhere())} · reset to widen`}
              </span>
            </div>
          {:else}
            <div class="grid" style="width:max-content;min-width:100%">
              <div class="grid-head" style="grid-template-columns:{template}">
                <button class="hcell sel" data-col="_sel" onclick={sortBy} title={allPageSel ? "deselect page" : "select page · ⇧-click rows for a range"}>
                  <span class="box" class:on={allPageSel} class:some={somePageSel && !allPageSel}>{allPageSel ? "✓" : somePageSel ? "–" : ""}</span>
                </button>
                {#each cols as column}
                  <button class="hcell" class:sorted={column.key === sortKey} data-col={column.key} draggable="true"
                    ondragstart={colDragStart} ondragover={colDragOver} ondrop={colDrop} onclick={sortBy}
                    title={["1:m", "m:n"].includes(column.type) ? "collection · not sortable" : `orderBy ${column.key} · drag to reorder`}>
                    <span class="hlabel">{column.key}</span>
                    <span class="htype">{typeLabel(column)}</span>
                    <span class="chev">{column.key === sortKey ? (sortDir === "asc" ? "▴" : "▾") : ""}</span>
                  </button>
                {/each}
              </div>
              {#each gridRows as row (row.id)}
                <div class="grid-row" class:selected={row.selected} class:picked={row.picked}
                  class:badged={!!row.badge} data-id={row.id} data-badge={row.badge}
                  style="grid-template-columns:{template}" onclick={selectRow}>
                  <div class="cell sel" data-col="_sel" style="height:{ROW_H}px">
                    <span class="box" class:on={row.picked}>{row.picked ? "✓" : ""}</span>
                  </div>
                  {#each row.cells as cell}
                    <div class="cell" data-col={cell.key} title={cell.title} style="height:{ROW_H}px" onclick={focusCell}>
                      {#if cell.kind === "pills"}
                        <span class="pills">{#each cell.pills as pill}<span class="pill">{pill}</span>{/each}</span>
                      {:else if cell.kind === "rel"}
                        <button class="reljump" data-rel-entity={cell.relEntity} data-rel-id={cell.relId} data-rel-field={cell.relField} onclick={jumpRel}>{cell.text} ↗</button>
                      {:else}
                        <span class="text" class:muted={cell.muted} class:italic={cell.italic} class:body={cell.body} class:number={cell.number}>{cell.text}</span>
                      {/if}
                    </div>
                  {/each}
                  {#if row.badge}<span class="badge" data-badge={row.badge}>{row.badge}</span>{/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="statusbar">
          <span class="wireline">
            <span class="verb-post">POST</span>
            <span class="wirepath">{mountOf(entity)}/{request.partial ? "find" : "findAndCount"}</span>
            <span class="wirebody">{wireBody}</span>
            <span class="took">{took} ms</span>
          </span>
          {#if request.partial}
            <span class="scope">traits clause · count skipped, total is this page</span>
          {/if}
          <span class="copybar">
            <span class="opt-label">copy</span>
            <button class="chip left" class:on={copyFmt === "json"} onclick={() => (copyFmt = "json")}>json</button>
            <button class="chip right" class:on={copyFmt === "csv"} onclick={() => (copyFmt = "csv")}>csv</button>
            <button class="chip" data-scope="cell" onclick={copy} disabled={!lastCell} title={lastCell ? `${lastCell.col} · ${short(lastCell.id)}` : "click a cell first"}>
              {lastCell ? `cell · ${lastCell.col}` : "cell"}
            </button>
            <button class="chip" data-scope="rows" onclick={copy} disabled={!selection.length} title="selected rows · ⌘/ctrl-click to multi-select, ⇧-click for a range">rows {selection.length || ""}</button>
            <button class="chip" data-scope="page" onclick={copy} title="this page">page</button>
            <button class="chip" data-scope="all" onclick={copy} title="every row matching where">all</button>
            {#if toast}<span class="toast">{toast}</span>{/if}
          </span>
          {#if selection.length}
            <span class="selbar">
              <span class="selcount">{selection.length} selected</span>
              <button class="link" onclick={clearSelection}>clear</button>
              {#if door?.verbs.includes("remove")}
                <button class="bulk" class:armed={confirmBulk} onclick={removeSelected} disabled={busy}>
                  {confirmBulk ? `confirm remove ${selection.length}` : `remove ${selection.length}`}
                </button>
              {/if}
            </span>
          {/if}
          <span class="pager">
            <button class="chip" onclick={() => page(-1)} disabled={offset === 0}>‹</button>
            <span class="range">{rangeText}</span>
            <button class="chip" onclick={() => page(1)} disabled={offset + limit >= request.total}>›</button>
          </span>
        </div>
      {/if}

      {#if screen === "schema"}
        <div class="er-bar">
          <span class="er-title">/datamap</span>
          <span>{erNodes.length} entities · {erEdges.length} owned edges</span>
          <span class="er-hint">drag a table to move it · click to inspect · double-click to query</span>
        </div>
        <div class="er-body">
          <div class="er" bind:this={erRef} class:panning
            onpointerdown={panDown} onpointermove={erMove} onpointerup={erUp} onpointerleave={erUp}
            onwheel={erWheel} ondblclick={erReset}
            style="background-size:{Math.round(24 * canvas.z)}px {Math.round(24 * canvas.z)}px;background-position:{canvas.x}px {canvas.y}px">
            <div class="zoomtag">{Math.round(canvas.z * 100)}% · drag empty space to pan · ⌘/ctrl-wheel to zoom · double-click to reset</div>
            <div class="er-plane" style="transform:translate({canvas.x}px, {canvas.y}px) scale({canvas.z})">
              <svg width="1" height="1" class="er-svg">
                {#each erEdges as edge}
                  <path class="edge" class:on={edge.on} class:hot={edge.hot} class:mn={edge.kind === "m:n"} d={edge.d} fill="none"></path>
                  <path class="edge-hit" data-edge={edge.id} d={edge.d} fill="none" stroke="transparent" stroke-width="12"
                    onclick={selectEdge} onpointerenter={hoverEdge} onpointerleave={unhover}></path>
                {/each}
              </svg>
              {#each erEdges as edge}
                <button class="edge-label" class:on={edge.on} class:hot={edge.hot} data-edge={edge.id}
                  style="left:{edge.lx}px;top:{edge.ly}px" onclick={selectEdge} onpointerenter={hoverEdge} onpointerleave={unhover}>{edge.label}</button>
              {/each}
              {#each erNodes as node}
                <div class="er-node" class:on={node.on} class:active={node.active} class:hover={node.hover} class:nodoor={node.noDoor}
                  data-entity={node.name} style="left:{node.x}px;top:{node.y}px;width:{node.w}px"
                  onclick={selectNode} ondblclick={pickEntity} onpointerenter={hoverNode} onpointerleave={unhover}>
                  <div class="er-head" data-entity={node.name} onpointerdown={erDown}>
                    <span class="grip">⋮⋮</span>
                    <span class="er-name">{node.name}</span>
                    <span class="er-count">{node.count}</span>
                  </div>
                  <div class="er-cols">
                    {#each node.cols as column}
                      <div class="er-col"><span class="er-col-name">{column.text}</span><span class="er-col-type">{column.type}</span></div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
          {#if erMetaOpen}
            <div class="seam-v" class:hot={seam === "meta"} data-seam="meta" onpointerdown={seamDown} title="drag to resize"></div>
            <div class="meta" style="flex:0 0 {sizes.meta}px">
              <div class="meta-head">
                <span class="set-name">{erMeta ? erMeta.kind : "metadata"}</span>
                <span class="meta-title">{erMeta?.title ?? ""}</span>
                {#if erMeta?.target}
                  <button class="mint" data-entity={erMeta.target} onclick={pickEntity}>query ↗</button>
                {/if}
              </div>
              <div class="meta-body">
                {#if !erMeta}
                  <span class="faint">select a table or a relation to inspect it here — rows, doors, scope, columns, edges.</span>
                {/if}
                {#each erMeta?.sections ?? [] as section}
                  <div class="meta-section">
                    <div class="foot-head"><span class="set-name">{section.name}</span><span class="rule"></span></div>
                    {#each section.rows as row}
                      <div class="kv"><span class="k">{row.k}</span><span class="dots"></span><span class="v" class:warn={row.warn}>{row.v}</span></div>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if editorOpen}
      <div class="seam-v" class:hot={seam === "editor"} data-seam="editor" onpointerdown={seamDown} title="drag to resize"></div>
      <div class="editor" style="flex:0 0 {sizes.editor}px">
        <div class="editor-head">
          <span class="brand">{entity}</span>
          <span class="editor-title">{creating ? "new row" : identify(entity, original) ?? ""}</span>
          <div class="group">
            <button class="tab" class:on={editorMode === "form"} onclick={() => (editorMode = "form")}>form</button>
            <button class="tab" class:on={editorMode === "json"} onclick={() => (editorMode = "json")}>json</button>
          </div>
          <button class="x" onclick={closeEditor}>×</button>
        </div>

        {#if editorMode === "form"}
          <div class="editor-body">
            <div class="ids">
              <div class="kv2"><span class="k2">id</span><span class="v2">{creating ? "— minted by /create" : read(original, "id")}</span></div>
              <div class="kv2"><span class="k2">createdAt</span><span class="v2">{creating ? "—" : fmtDate(read(original, "createdAt"))}</span></div>
              <div class="kv2"><span class="k2">updatedAt</span><span class="v2">{creating ? "—" : fmtDate(read(original, "updatedAt"))}</span></div>
            </div>

            {#each formFields as field}
              <div class="field">
                <div class="field-head">
                  <span class="field-name" class:modified={field.modified}>{field.name}</span>
                  <span class="field-type">{field.type}</span>
                  {#if field.flag}<span class="field-flag">{field.flag}</span>{/if}
                  {#if field.nullable}
                    <button class="nullbtn" class:on={field.value === ""} data-field={field.name} onclick={nullField} title="set null">∅ null</button>
                  {/if}
                </div>
                {#if field.kind === "text"}
                  <input data-field={field.name} value={field.value} oninput={editField} placeholder={field.placeholder} />
                {:else if field.kind === "int"}
                  <input class="int" type="number" data-field={field.name} value={field.value} oninput={editField} />
                {:else if field.kind === "enum"}
                  <select data-field={field.name} value={field.value} onchange={editField}>
                    {#each field.options as option}<option value={option}>{option}</option>{/each}
                  </select>
                {:else if field.kind === "json"}
                  <textarea class:bad={field.bad} class:big={field.big} data-field={field.name} value={field.value} oninput={editField} spellcheck="false"></textarea>
                {:else if field.kind === "rel"}
                  <div class="relrow">
                    {#if field.pending}
                      <input data-field={field.name} value={field.value} oninput={editField} placeholder="loading {field.target}…" />
                    {:else}
                      <select data-field={field.name} value={field.value} onchange={editField}>
                        <option value="">{field.placeholder}</option>
                        {#each field.options as option}<option value={option.id}>{option.label}</option>{/each}
                      </select>
                    {/if}
                    <button class="chip" data-rel-entity={field.target} data-rel-id={field.value} onclick={jumpRel} disabled={!field.canJump} title="open {field.target}">
                      {field.relLabel} ↗
                    </button>
                  </div>
                {:else if field.kind === "ids"}
                  <textarea data-field={field.name} value={field.value} oninput={editField} spellcheck="false" placeholder="one {field.target} id per line"></textarea>
                  <span class="faint">{field.hint}</span>
                {:else if field.kind === "traits"}
                  <div class="traitchips">
                    {#each field.traits as trait}
                      <button class="traitchip" class:held={trait.held} data-trait={trait.name} onclick={toggleTrait} title={trait.title}>{trait.name}</button>
                    {/each}
                    <input class="traitnew" value={customTrait} oninput={setCustomTrait} onkeydown={customTraitKey} placeholder="+ TRAIT ⏎" />
                  </div>
                  <span class="faint">{field.hint}</span>
                {/if}
              </div>
            {/each}

            {#if traitForms.length}
              <div class="foot-head"><span class="set-name">trait</span><span class="rule"></span><span class="mount">{traitSchemaSource}</span></div>
              {#each traitForms as form}
                <div class="traitform">
                  <div class="traitform-head">
                    <span class="traitform-name">{form.name}</span>
                    <span class="faint">{form.note}</span>
                    <button class="x small" data-trait={form.name} onclick={toggleTrait} title="drop claim">×</button>
                  </div>
                  {#if form.free}
                    <textarea class:bad={form.bad} data-trait={form.name} value={form.json} oninput={editTraitJson} spellcheck="false"></textarea>
                  {/if}
                  {#each form.fields as field}
                    <div class="traitrow">
                      <span class="traitkey" class:required={field.required}>{field.key}{field.required ? "*" : ""}</span>
                      {#if field.kind === "enum"}
                        <select data-trait={form.name} data-key={field.key} data-kind="enum" value={field.value} onchange={editTraitField}>
                          <option value="">—</option>
                          {#each field.options as option}<option value={option}>{option}</option>{/each}
                        </select>
                      {:else if field.kind === "boolean"}
                        <select data-trait={form.name} data-key={field.key} data-kind="boolean" value={field.value} onchange={editTraitField}>
                          <option value="">—</option><option value="true">true</option><option value="false">false</option>
                        </select>
                      {:else}
                        <input data-trait={form.name} data-key={field.key} data-kind={field.kind} value={field.value} oninput={editTraitField} placeholder={field.kind} />
                      {/if}
                    </div>
                  {/each}
                </div>
              {/each}
            {/if}

            {#if collections.length}
              <div class="foot-head"><span class="set-name">collections</span><span class="rule"></span></div>
              <div class="colls">
                {#each collections as collection}
                  <button class="chip" data-rel-entity={collection.target} data-rel-id={selectedId} data-rel-field={collection.mappedBy} onclick={jumpRel}>
                    {collection.name} ↗
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="editor-foot">
            <div class="editor-actions">
              <span class="dirty" class:warn={dirty} class:bad={invalid}>
                {!canWrite ? "read-only door" : invalid ? "invalid json in a field" : dirty ? `${Object.keys(patch).length} field${Object.keys(patch).length > 1 ? "s" : ""} changed` : "no changes"}
              </span>
              <span class="spacer"></span>
              {#if !creating && door?.verbs.includes("removeOne")}
                <button class="remove" class:armed={confirmRemove} onclick={removeRow} disabled={busy}>{confirmRemove ? "confirm remove" : "remove"}</button>
              {/if}
              <button class="chip" onclick={revertDraft} disabled={!dirty || busy}>revert</button>
              <button class="save" onclick={saveDraft} disabled={!dirty || invalid || !canWrite || busy}>{creating ? "create" : "save"}</button>
            </div>
            <div class="editor-wire">
              <span class="verb-post">POST </span><span class="wirepath">{mountOf(entity)}/{creating ? "create" : "updateOne"}</span>
              {"\n"}{JSON.stringify(creating ? { data: patch } : { where: { id: selectedId }, data: patch })}
            </div>
          </div>
        {:else}
          <div class="jsonview">
            <div class="jsonbar">
              <button class="chip" data-scope="selected" onclick={copy}>⧉ copy json</button>
            </div>
            <pre>{JSON.stringify(creating ? patch : plainRow(original, entity), null, 2)}</pre>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if wireOpen}
    <div class="seam-h" class:hot={seam === "wire"} data-seam="wire" onpointerdown={seamDown} title="drag to resize"></div>
    <div class="wire" style="flex:0 0 {sizes.wire}px">
      {#each wire as entry}
        <div class="wire-row">
          <span class="wire-at">{entry.at}</span>
          <span class="wire-verb" data-verb={entry.verb}>{entry.verb}</span>
          <span class="wire-path">{entry.path}</span>
          <span class="wire-body">{entry.body}</span>
        </div>
      {/each}
      {#if bootError}<div class="wire-row"><span class="wire-verb" data-verb="ERR">ERR</span><span class="wire-path">{bootError}</span></div>{/if}
    </div>
  {/if}
</div>

<style>
  .dataspace {
    --s0: var(--colors-skeleton-0-surface);
    --s1: var(--colors-skeleton-1-surface);
    --s2: var(--colors-skeleton-2-surface);
    --s3: var(--colors-skeleton-3-surface);
    --c0: var(--colors-skeleton-0-contrast);
    --c1: var(--colors-skeleton-1-contrast);
    --b1: var(--colors-skeleton-1-boundary);
    --b2: var(--colors-skeleton-2-boundary);
    --b3: var(--colors-skeleton-3-boundary);
    --primary: var(--colors-skeleton-0-primary-base);
    --primary-hover: var(--colors-skeleton-0-primary-hover);
    --secondary: var(--colors-skeleton-0-secondary-base);
    --success: var(--colors-skeleton-0-success-base);
    --warning: var(--colors-skeleton-0-warning-base);
    --danger: var(--colors-skeleton-0-danger-base);
    --body: var(--text-body);
    --support: var(--text-support);
    --shadow: var(--shadow-soft);
    --fz-2xs: var(--font-size-2xs);
    --fz-xs: var(--font-size-xs);
    --fz-sm: var(--font-size-sm);
    --fz-cell: 0.75rem;
    --fz-val: 0.7rem;
    --fz-mid: 0.65rem;

    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--s0);
    color: var(--c0);
    font-family: var(--font-family-code);
    font-size: var(--fz-sm);
    overflow: hidden;
  }

  button, input, select, textarea { font: inherit; color: inherit; font-family: var(--font-family-code); }
  input, select, textarea { outline: none; }

  .bar {
    flex: 0 0 40px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
    border-bottom: 1px solid var(--b1);
    background: var(--s1);
  }
  .brand {
    font-size: var(--fz-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--primary);
    white-space: nowrap;
  }
  .origin { font-size: var(--fz-xs); letter-spacing: 0.08em; color: var(--support); white-space: nowrap; }
  .crumbs { flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px; overflow: hidden; padding-left: 8px; }
  .crumb { border: none; background: transparent; color: var(--support); font-size: var(--fz-xs); padding: 2px 4px; cursor: pointer; white-space: nowrap; }
  .crumb:hover { color: var(--c0); }
  .crumb-sep { color: var(--b3); font-size: var(--fz-xs); }
  .here { font-size: var(--fz-xs); color: var(--c0); padding: 2px 4px; white-space: nowrap; }

  .group { display: flex; gap: 2px; border: 1px solid var(--b1); border-radius: 3px; padding: 2px; flex: none; }
  .tab {
    border: none;
    border-radius: 2px;
    height: 24px;
    padding: 0 12px;
    font-size: var(--fz-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    background: transparent;
    color: var(--support);
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .tab.on { background: var(--s3); color: var(--primary); }
  .tab.dim { color: var(--b3); }
  .glyph { font-size: var(--fz-val); line-height: 1; }

  .livebtn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 10px;
    border: 1px solid var(--b1);
    border-radius: 3px;
    background: transparent;
    color: var(--support);
    font-size: var(--fz-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .livebtn.on { border-color: var(--primary); color: var(--primary); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--b3); }
  .dot.lit { background: var(--success); box-shadow: 0 0 6px var(--success); }

  .mint {
    height: 26px;
    padding: 0 10px;
    border: 1px solid var(--primary);
    border-radius: 3px;
    background: transparent;
    color: var(--primary);
    font-size: var(--fz-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    flex: none;
  }
  .mint:disabled { border-color: var(--b1); color: var(--b3); cursor: default; }

  .body { flex: 1; min-height: 0; display: flex; }
  .seam-v { flex: 0 0 4px; background: var(--b1); cursor: ew-resize; touch-action: none; transition: background 0.12s; }
  .seam-h { flex: 0 0 4px; background: var(--b1); cursor: ns-resize; touch-action: none; transition: background 0.12s; }
  .seam-v.hot, .seam-h.hot { background: var(--primary); }

  .catalog { display: flex; flex-direction: column; min-height: 0; background: var(--s1); }
  .catalog-scroll { flex: 1; min-height: 0; overflow: auto; padding: 10px 8px; }
  .set-head { display: flex; align-items: center; gap: 2px; padding: 10px 0 4px; color: var(--support); }
  .set-btn { flex: 1; display: flex; align-items: center; gap: 8px; border: none; background: transparent; cursor: pointer; text-align: left; color: var(--support); padding: 0; }
  .caret-slot { width: 22px; display: grid; place-items: center; flex: none; }
  .caret {
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--s3);
    color: var(--c1);
    font-size: 0.85rem;
    line-height: 1;
  }
  .caret.hide { visibility: hidden; }
  .set-name { font-size: var(--fz-2xs); letter-spacing: 0.16em; text-transform: uppercase; white-space: nowrap; }
  .rule { flex: 1; height: 1px; background: var(--b2); }

  .ent-line { display: flex; align-items: stretch; gap: 2px; margin-bottom: 2px; }
  .caret-btn { width: 22px; border: none; background: transparent; cursor: pointer; padding: 0; display: grid; place-items: center; }
  .caret-btn.small { width: 20px; }
  .caret-btn.small .caret { width: 16px; height: 16px; font-size: var(--fz-cell); }
  .ent {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    color: var(--c1);
    cursor: pointer;
    text-align: left;
  }
  .ent.active { border-color: var(--primary); background: var(--s3); color: var(--primary); }
  .ent.nodoor { color: var(--support); cursor: default; }
  .pip { width: 7px; height: 7px; border-radius: 50%; background: transparent; flex: none; }
  .pip.writes { background: var(--success); box-shadow: 0 0 4px var(--success); }
  .pip.reads { background: var(--warning); box-shadow: 0 0 4px var(--warning); }
  .ent-name { flex: 1; font-size: var(--fz-sm); letter-spacing: 0.02em; }
  .ent-count { font-size: var(--fz-xs); color: var(--support); }

  .facets { display: flex; flex-direction: column; gap: 1px; padding: 0 0 4px 22px; }
  .facet { display: flex; align-items: stretch; border-left: 1px solid var(--b2); }
  .facet-btn { flex: 1; display: flex; align-items: center; gap: 8px; padding: 2px 6px; border: none; background: transparent; color: var(--body); cursor: pointer; text-align: left; }
  .facet-btn.on { color: var(--primary); }
  .facet-label { flex: 1; font-size: var(--fz-val); }
  .facet-count { font-size: var(--fz-2xs); color: var(--support); }

  .catalog-foot { overflow: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
  .foot-head { display: flex; align-items: center; gap: 8px; color: var(--support); }
  .mount { font-size: var(--fz-2xs); color: var(--support); }
  .kv-list { display: flex; flex-direction: column; gap: 2px; }
  .kv { display: flex; gap: 8px; font-size: var(--fz-val); line-height: 1.5; align-items: baseline; }
  .k { color: var(--c1); white-space: nowrap; }
  .k.rel { color: var(--secondary); }
  .dots { flex: 1; border-bottom: 1px dotted var(--b2); margin-bottom: 4px; min-width: 8px; }
  .v { color: var(--support); text-align: right; word-break: break-all; }
  .v.warn { color: var(--warning); }
  .verbs { display: flex; flex-wrap: wrap; gap: 3px; }
  .verb { font-size: var(--fz-2xs); padding: 1px 5px; border: 1px solid transparent; border-radius: 2px; color: var(--b3); }
  .verb.has { border-color: var(--b3); color: var(--c1); }
  .verb.has.write { color: var(--success); }
  .verb.has.sub { color: var(--warning); }

  .main { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }

  .query { flex: 0 0 auto; display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border-bottom: 1px solid var(--b1); background: var(--s1); }
  .query-top { display: flex; align-items: center; gap: 8px; }
  .tabs { display: flex; gap: 1px; }
  .qtab { border: none; padding: 3px 8px; font-size: var(--fz-xs); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; background: transparent; color: var(--support); border-bottom: 1px solid transparent; }
  .qtab.on { color: var(--primary); border-bottom-color: var(--primary); }
  .spacer { flex: 1; }
  .saved { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--b1); border-radius: 3px; padding: 2px 6px; font-size: var(--fz-xs); }
  .saved-load { border: none; background: transparent; color: var(--c1); cursor: pointer; padding: 0; font-size: var(--fz-xs); }
  .saved-drop { border: none; background: transparent; color: var(--danger); cursor: pointer; padding: 0; font-size: var(--fz-xs); }

  .chip {
    height: 22px;
    padding: 0 8px;
    border: 1px solid var(--b1);
    border-radius: 3px;
    background: transparent;
    color: var(--support);
    font-size: var(--fz-xs);
    cursor: pointer;
    white-space: nowrap;
    flex: none;
  }
  .chip.on { border-color: var(--primary); color: var(--primary); }
  .chip:disabled { color: var(--b3); cursor: default; }
  .chip.left { border-radius: 3px 0 0 3px; }
  .chip.right { border-radius: 0 3px 3px 0; margin-left: -5px; }
  .chip.push { margin-left: auto; }

  .clauses { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .clause { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 4px 0 8px; border: 1px solid var(--primary); border-radius: 3px; font-size: var(--fz-val); }
  .clause.new { border: 1px dashed var(--b3); padding: 0 4px; gap: 4px; }
  .clause select, .clause input { border: none; background: transparent; font-size: var(--fz-val); }
  .clause select { cursor: pointer; }
  .clause input { width: 150px; padding: 0 4px; color: var(--success); }
  .cl-field { color: var(--c1); }
  .cl-op { color: var(--primary); }
  .cl-val { color: var(--success); }
  .cl-x { border: none; background: transparent; color: var(--danger); cursor: pointer; padding: 0 2px; font-size: var(--fz-sm); line-height: 1; }
  .cl-add { border: none; background: transparent; color: var(--primary); cursor: pointer; font-size: var(--fz-sm); padding: 0 4px; }
  .hint { font-size: var(--fz-xs); color: var(--support); margin-left: 4px; }

  .opts { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; font-size: var(--fz-xs); color: var(--support); }
  .opt { display: inline-flex; align-items: center; gap: 4px; }
  .opt-label { letter-spacing: 0.12em; text-transform: uppercase; }
  .opt select { height: 20px; border: 1px solid var(--b1); border-radius: 3px; background: transparent; color: var(--c1); font-size: var(--fz-xs); cursor: pointer; }
  .opt .chip { height: 20px; padding: 0 6px; }
  .faint { color: var(--support); opacity: 0.8; }
  .scope { color: var(--warning); font-size: var(--fz-xs); }

  .colprefs { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; border: 1px solid var(--b1); border-radius: 3px; background: var(--s2); align-items: center; }
  .colchip { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border: 1px solid var(--b3); border-radius: 3px; background: var(--s1); color: var(--c1); font-size: var(--fz-xs); cursor: grab; white-space: nowrap; }
  .colchip.hidden { border-color: var(--b1); background: transparent; color: var(--support); text-decoration: line-through; }
  .colchip-type { font-size: var(--fz-2xs); color: var(--support); }
  .grip { color: var(--b3); letter-spacing: -2px; font-size: var(--fz-xs); }

  .raw { display: flex; gap: 8px; align-items: stretch; }
  .raw textarea { flex: 1; min-height: 120px; resize: vertical; padding: 8px 10px; border: 1px solid var(--b1); border-radius: 3px; background: var(--s2); color: var(--c1); font-size: var(--fz-val); line-height: 1.5; white-space: pre; }
  .raw-side { display: flex; flex-direction: column; gap: 6px; width: 200px; }
  .run { height: 26px; border: 1px solid var(--primary); border-radius: 3px; background: transparent; color: var(--primary); font-size: var(--fz-xs); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; }
  .err { color: var(--danger); font-size: var(--fz-xs); line-height: 1.5; }

  .grid-scroll { flex: 1; min-height: 0; overflow: auto; position: relative; background: var(--s0); }
  .notice { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--support); font-size: var(--fz-xs); letter-spacing: 0.06em; }
  .empty-head { font-size: var(--fz-xs); letter-spacing: 0.16em; text-transform: uppercase; }
  .empty-line { font-size: var(--fz-xs); opacity: 0.8; }

  .grid-head { display: grid; position: sticky; top: 0; z-index: 2; background: var(--s0); border-bottom: 1px solid var(--b1); }
  .hcell {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    border: none;
    border-right: 1px solid var(--b2);
    background: transparent;
    color: var(--support);
    font-size: var(--fz-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
  }
  .hcell.sorted { color: var(--primary); }
  .hlabel { flex: none; }
  .htype { font-size: var(--fz-2xs); letter-spacing: 0.02em; text-transform: none; color: var(--support); opacity: 0.7; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .chev { margin-left: auto; color: var(--primary); }
  .box { width: 12px; height: 12px; border: 1px solid var(--b3); border-radius: 2px; display: grid; place-items: center; color: var(--s0); font-size: var(--fz-2xs); line-height: 1; }
  .box.on { border-color: var(--primary); background: var(--primary); }
  .box.some { border-color: var(--primary); }

  .grid-row { display: grid; position: relative; cursor: pointer; border-left: 2px solid transparent; user-select: none; }
  .grid-row:hover { background: color-mix(in srgb, var(--c0) 4%, transparent); }
  .grid-row.picked { background: color-mix(in srgb, var(--primary) 8%, transparent); border-left-color: var(--primary-hover); }
  .grid-row.selected { background: var(--s3); border-left-color: var(--primary); }
  .grid-row.badged[data-badge="create"] { border-left-color: var(--success); }
  .grid-row.badged[data-badge="update"] { border-left-color: var(--warning); }
  .grid-row.badged[data-badge="delete"] { border-left-color: var(--danger); }
  .cell { display: flex; align-items: center; gap: 4px; padding: 0 10px; border-bottom: 1px solid var(--b2); overflow: hidden; white-space: nowrap; }
  .text { color: var(--c1); font-size: var(--fz-cell); overflow: hidden; text-overflow: ellipsis; }
  .text.muted { color: var(--support); }
  .text.body { color: var(--body); }
  .text.italic { font-style: italic; }
  .text.number { color: var(--primary); }
  .pills { display: inline-flex; gap: 3px; overflow: hidden; }
  .pill { font-size: var(--fz-xs); letter-spacing: 0.04em; padding: 1px 6px; border: 1px solid var(--b3); border-radius: 2px; color: var(--c1); white-space: nowrap; }
  .reljump { border: none; background: transparent; padding: 0; color: var(--primary); cursor: pointer; font-size: var(--fz-cell); text-decoration: underline dotted; text-underline-offset: 3px; white-space: nowrap; }
  .badge { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: var(--fz-2xs); letter-spacing: 0.12em; text-transform: uppercase; padding: 1px 6px; border-radius: 2px; color: var(--s0); pointer-events: none; }
  .badge[data-badge="create"] { background: var(--success); }
  .badge[data-badge="update"] { background: var(--warning); }
  .badge[data-badge="delete"] { background: var(--danger); }

  .statusbar {
    flex: 0 0 auto;
    min-height: 30px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    padding: 4px 10px;
    border-top: 1px solid var(--b1);
    background: var(--s1);
    font-size: var(--fz-xs);
    color: var(--support);
    white-space: nowrap;
  }
  .wireline { display: inline-flex; align-items: center; gap: 8px; flex: 1 1 260px; min-width: 0; }
  .verb-post { color: var(--primary); letter-spacing: 0.08em; flex: none; }
  .wirepath { color: var(--c1); flex: none; }
  .wirebody { opacity: 0.8; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
  .took { flex: none; }
  .copybar { display: inline-flex; align-items: center; gap: 4px; flex: none; }
  .toast { color: var(--success); }
  .selbar { display: inline-flex; align-items: center; gap: 6px; flex: none; padding: 0 8px; border: 1px solid var(--primary); border-radius: 3px; height: 22px; }
  .selcount { color: var(--primary); }
  .link { border: none; background: transparent; color: var(--support); cursor: pointer; font-size: var(--fz-xs); padding: 0 2px; }
  .bulk { border: none; background: transparent; color: var(--danger); cursor: pointer; font-size: var(--fz-xs); padding: 1px 6px; border-radius: 2px; }
  .bulk.armed { background: var(--danger); color: var(--s0); }
  .pager { display: inline-flex; align-items: center; gap: 8px; flex: none; }
  .pager .chip { width: 22px; height: 20px; padding: 0; text-align: center; color: var(--c1); }
  .range { color: var(--c1); }

  .er-bar { flex: 0 0 34px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border-bottom: 1px solid var(--b1); background: var(--s1); font-size: var(--fz-xs); letter-spacing: 0.12em; text-transform: uppercase; color: var(--support); white-space: nowrap; overflow: hidden; }
  .er-title { color: var(--c1); }
  .er-hint { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; text-transform: none; letter-spacing: 0.04em; }
  .er-body { flex: 1; min-height: 0; display: flex; }
  .er {
    flex: 1;
    min-width: 0;
    position: relative;
    overflow: hidden;
    background-color: var(--s0);
    background-image: radial-gradient(var(--b2) 1px, transparent 1px);
    touch-action: none;
  }
  .er.panning { cursor: grabbing; }
  .zoomtag { position: absolute; right: 10px; bottom: 8px; font-size: var(--fz-2xs); color: var(--support); z-index: 30; pointer-events: none; white-space: nowrap; }
  .er-plane { position: absolute; left: 0; top: 0; transform-origin: 0 0; width: 0; height: 0; }
  .er-svg { position: absolute; left: 0; top: 0; overflow: visible; }
  .edge { stroke: var(--b3); stroke-width: 1; }
  .edge.mn { stroke: var(--secondary); stroke-dasharray: 4 3; }
  .edge.hot { stroke: var(--primary-hover); stroke-width: 1.5; }
  .edge.on { stroke: var(--primary); stroke-width: 2; }
  .edge-hit { cursor: pointer; pointer-events: stroke; }
  .edge-label {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: var(--fz-2xs);
    letter-spacing: 0.04em;
    color: var(--support);
    background: var(--s0);
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 1px 5px;
    cursor: pointer;
    line-height: 1.4;
    white-space: nowrap;
  }
  .edge-label.hot { color: var(--c1); border-color: var(--b3); }
  .edge-label.on { color: var(--primary); border-color: var(--primary); }
  .er-node { position: absolute; box-sizing: border-box; border: 1px solid var(--b2); border-radius: 3px; background: var(--s1); cursor: pointer; overflow: hidden; user-select: none; }
  .er-node.nodoor { border-style: dashed; }
  .er-node.hover { border-color: var(--b3); box-shadow: 0 4px 12px var(--shadow); z-index: 4; }
  .er-node.active { border-color: var(--primary-hover); }
  .er-node.on { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 6px 18px var(--shadow); z-index: 5; }
  .er-head { display: flex; align-items: center; gap: 6px; height: 22px; padding: 0 6px 0 8px; background: var(--s2); border-bottom: 1px solid var(--b2); cursor: grab; touch-action: none; }
  .er-node.on .er-head, .er-node.active .er-head { background: var(--s3); }
  .er-name { flex: 1; font-size: var(--fz-xs); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c1); white-space: nowrap; }
  .er-node.on .er-name, .er-node.active .er-name { color: var(--primary); }
  .er-count { font-size: var(--fz-2xs); color: var(--support); white-space: nowrap; }
  .er-cols { display: flex; flex-direction: column; padding: 4px 8px 5px; }
  .er-col { display: flex; gap: 6px; align-items: baseline; line-height: 14px; white-space: nowrap; }
  .er-col-name { flex: 1; font-size: var(--fz-xs); color: var(--body); overflow: hidden; text-overflow: ellipsis; }
  .er-col-type { font-size: var(--fz-2xs); color: var(--support); }

  .meta { display: flex; flex-direction: column; min-height: 0; background: var(--s1); }
  .meta-head { flex: 0 0 40px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid var(--b1); }
  .meta-title { font-size: var(--fz-val); color: var(--primary); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .meta-body { flex: 1; min-height: 0; overflow: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; font-size: var(--fz-xs); }
  .meta-section { display: flex; flex-direction: column; gap: 3px; }

  .editor { display: flex; flex-direction: column; min-height: 0; background: var(--s1); }
  .editor-head { flex: 0 0 40px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-bottom: 1px solid var(--b1); }
  .editor-title { font-size: var(--fz-val); color: var(--c1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .x { width: 24px; height: 24px; border: 1px solid var(--b1); border-radius: 3px; background: transparent; color: var(--support); cursor: pointer; padding: 0; }
  .x.small { width: auto; height: auto; border: none; color: var(--danger); font-size: var(--fz-val); padding: 0 2px; line-height: 1; }
  .editor-body { flex: 1; min-height: 0; overflow: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; }
  .ids { display: flex; flex-direction: column; gap: 2px; font-size: var(--fz-xs); color: var(--support); }
  .kv2 { display: flex; gap: 8px; }
  .k2 { width: 76px; flex: none; }
  .v2 { color: var(--c1); word-break: break-all; }

  .field { display: flex; flex-direction: column; gap: 3px; }
  .field-head { display: flex; align-items: baseline; gap: 6px; }
  .field-name { font-size: var(--fz-xs); letter-spacing: 0.08em; color: var(--support); }
  .field-name.modified { color: var(--warning); }
  .field-type { font-size: var(--fz-2xs); color: var(--support); opacity: 0.8; }
  .field-flag { font-size: var(--fz-2xs); color: var(--warning); margin-left: auto; }
  .nullbtn { height: 16px; padding: 0 5px; border: 1px solid var(--b1); border-radius: 2px; background: transparent; color: var(--support); font-size: var(--fz-2xs); cursor: pointer; }
  .nullbtn.on { color: var(--warning); }
  .field input, .field select, .field textarea {
    padding: 0 8px;
    border: 1px solid var(--b1);
    border-radius: 3px;
    background: var(--s2);
    color: var(--c1);
    font-size: var(--fz-cell);
  }
  .field input, .field select { height: 26px; }
  .field input.int { width: 120px; }
  .field select { cursor: pointer; padding: 0 6px; }
  .field textarea { min-height: 56px; resize: vertical; padding: 6px 8px; font-size: var(--fz-val); line-height: 1.5; white-space: pre; }
  .field textarea.big { min-height: 96px; }
  .field textarea.bad { border-color: var(--danger); }
  .relrow { display: flex; gap: 4px; align-items: center; }
  .relrow input, .relrow select { flex: 1; min-width: 0; }
  .relrow .chip { height: 26px; }
  .traitchips { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
  .traitchip { height: 22px; padding: 0 8px; border: 1px solid var(--b1); border-radius: 3px; background: transparent; color: var(--support); font-size: var(--fz-xs); letter-spacing: 0.06em; cursor: pointer; }
  .traitchip.held { border-color: var(--primary); color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, transparent); }
  .traitnew { height: 22px; width: 110px; padding: 0 8px; border: 1px dashed var(--b3); border-radius: 3px; background: transparent; color: var(--c1); font-size: var(--fz-xs); letter-spacing: 0.06em; text-transform: uppercase; }

  .traitform { display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; border: 1px solid var(--b2); border-radius: 3px; background: var(--s2); }
  .traitform-head { display: flex; align-items: center; gap: 6px; }
  .traitform-name { font-size: var(--fz-xs); letter-spacing: 0.1em; color: var(--primary); font-weight: 600; }
  .traitform .faint { flex: 1; font-size: var(--fz-2xs); }
  .traitform textarea { min-height: 40px; resize: vertical; padding: 6px 8px; border: 1px solid var(--b1); border-radius: 3px; background: var(--s1); color: var(--c1); font-size: var(--fz-mid); line-height: 1.5; white-space: pre; }
  .traitform textarea.bad { border-color: var(--danger); }
  .traitrow { display: flex; align-items: center; gap: 8px; }
  .traitkey { width: 84px; flex: none; font-size: var(--fz-xs); color: var(--support); }
  .traitkey.required { color: var(--c1); }
  .traitrow input, .traitrow select { flex: 1; min-width: 0; height: 24px; padding: 0 8px; border: 1px solid var(--b1); border-radius: 3px; background: var(--s1); color: var(--c1); font-size: var(--fz-val); }
  .traitrow select { cursor: pointer; padding: 0 6px; }
  .colls { display: flex; flex-wrap: wrap; gap: 4px; }
  .colls .chip { height: 24px; color: var(--secondary); }

  .editor-foot { flex: 0 0 auto; border-top: 1px solid var(--b1); padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; }
  .editor-actions { display: flex; align-items: center; gap: 6px; }
  .dirty { font-size: var(--fz-xs); color: var(--support); }
  .dirty.warn { color: var(--warning); }
  .dirty.bad { color: var(--danger); }
  .remove { height: 26px; padding: 0 10px; border: 1px solid var(--danger); border-radius: 3px; background: transparent; color: var(--danger); font-size: var(--fz-xs); letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .remove.armed { background: var(--danger); color: var(--s0); }
  .editor-actions .chip { height: 26px; letter-spacing: 0.1em; text-transform: uppercase; }
  .save { height: 26px; padding: 0 12px; border: 1px solid var(--primary); border-radius: 3px; background: var(--primary); color: var(--s0); font-size: var(--fz-xs); letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .save:disabled { background: transparent; color: var(--support); border-color: var(--b1); cursor: default; }
  .editor-wire { font-size: var(--fz-xs); color: var(--support); line-height: 1.5; max-height: 96px; overflow: auto; white-space: pre-wrap; word-break: break-all; padding: 6px 8px; border: 1px solid var(--b2); border-radius: 3px; background: var(--s2); }

  .jsonview { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  .jsonbar { display: flex; justify-content: flex-end; padding: 6px 12px 0; }
  .jsonview pre { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 8px 12px; font-size: var(--fz-2xs); line-height: 1.45; color: var(--c1); white-space: pre; }

  .wire { overflow: auto; background: var(--s2); padding: 4px 10px; display: flex; flex-direction: column; gap: 1px; font-size: var(--fz-xs); box-sizing: border-box; }
  .wire-row { display: flex; gap: 10px; align-items: baseline; white-space: nowrap; }
  .wire-at { color: var(--support); width: 64px; flex: none; }
  .wire-verb { letter-spacing: 0.08em; width: 36px; flex: none; color: var(--primary); }
  .wire-verb[data-verb="SSE"] { color: var(--warning); }
  .wire-verb[data-verb="GET"] { color: var(--secondary); }
  .wire-verb[data-verb="ERR"] { color: var(--danger); }
  .wire-path { color: var(--c1); flex: none; }
  .wire-body { color: var(--support); overflow: hidden; text-overflow: ellipsis; min-width: 0; }
</style>
