import os, re, sys, json, collections

home = os.path.expanduser("~")
repo = "/Users/finn/vivalence/code/vivalence"
roots = [os.path.join(repo, d) for d in ("systems", "subsystems", "commons", "testament", "documentation")] + [os.path.join(home, ".viva/registry")]
skip_dirs = {"node_modules", ".git", ".jj", ".astro", "dist", ".svelte-kit", "bundles", "snapshots"}
extensions = (".js", ".ts", ".mjs", ".jsx", ".tsx", ".svelte", ".mdx", ".md", ".org")

patterns = [
    ("boot", "migrator getter", r"getMigrator\("),
    ("boot", "migrator verbs", r"checkMigrationNeeded|createMigration\(|getPendingMigrations|getExecutedMigrations|createInitialMigration"),
    ("boot", "schema verbs", r"\.(createSchema|refreshDatabase|updateSchema|dropSchema|clearDatabase)\("),
    ("boot", "schema generator getter", r"getSchemaGenerator\("),
    ("boot", "allowGlobalContext", r"allowGlobalContext"),
    ("boot", "config keys flipped/removed", r"\b(forceUtcTimezone|processOnCreateHooksEarly|initSync|preferEnvVars|disableDynamicFileAccess|requireEntitiesArray|alwaysAnalyseProperties)\b"),
    ("boot", "MikroORM.init", r"MikroORM\.init\("),
    ("em", "persistAndFlush/removeAndFlush", r"persistAndFlush|removeAndFlush"),
    ("em", "knex surface", r"getKnex\(|getKnexQuery|knex\.raw|@mikro-orm/knex"),
    ("em", "addFilter", r"\.addFilter\("),
    ("em", "findByCursor", r"findByCursor"),
    ("em", "transactional", r"\.transactional\(|Transactional"),
    ("em", "ArrayCollection", r"ArrayCollection"),
    ("em", "em.create (onCreate now early)", r"\.create\(\s*\w+(Entity|Schema)\b|em\.create\("),
    ("em", "nativeUpdate/Delete/Insert", r"\bnative(Update|Delete|Insert)\("),
    ("em", "raw connection execute", r"getConnection\(\)\s*\.\s*execute\(|connection\.execute\(|\.executeDump\(|loadFile\("),
    ("qb", "createQueryBuilder", r"createQueryBuilder\(|\.qb\("),
    ("qb", "raw()", r"\braw\(\s*[`\"']"),
    ("meta", "getAll()", r"\.getAll\(\)"),
    ("meta", "metadata find/get/has by string", r"(getMetadata\(\)|metadata)\s*\.\s*(find|get|has)\(\s*[\"'`]"),
    ("meta", "pivotEntity/extends/root reads", r"\.pivotEntity\b|meta\.extends\b|meta\.root\b|\.targetMeta\b"),
    ("meta", "entityName reads", r"\.entityName\b"),
    ("meta", "className reads", r"\.className\b"),
    ("schema", "string entity target", r"\bentity\s*:\s*[\"'`]"),
    ("schema", "string extends", r"\bextends\s*:\s*[\"'`]"),
    ("schema", "cascade declarations", r"\bcascade\s*:"),
    ("schema", "onCreate/onUpdate hooks", r"\bon(Create|Update)\s*:"),
    ("schema", "formula", r"\bformula\s*:"),
    ("schema", "expression (virtual)", r"\bexpression\s*:"),
    ("schema", "embedded/embeddable", r"embeddable\s*:\s*true|kind\s*:\s*[\"']embedded"),
    ("schema", "m:1 declarations", r"kind\s*:\s*[\"']m:1"),
    ("schema", "1:1 declarations", r"kind\s*:\s*[\"']1:1"),
    ("schema", "pivotTable", r"\bpivotTable\s*:"),
    ("schema", "abstract", r"\babstract\s*:\s*true"),
    ("schema", "inheritance/discriminator", r"discriminator(Column|Value|Map)|inheritance\s*:"),
    ("schema", "orderBy on relation/entity", r"\borderBy\s*:"),
    ("events", "flush-phase hooks", r"\b(afterFlush|onFlush|beforeFlush)\b|getChangeSets|computeChangeSet|recomputeSingleChangeSet"),
    ("events", "subscriber registration", r"registerSubscriber|getSubscribedEntities"),
    ("events", "entity lifecycle hooks", r"\b(beforeCreate|afterCreate|beforeUpdate|afterUpdate|beforeDelete|afterDelete|onInit|onLoad)\b"),
    ("filters", "filters / setFilterParams", r"setFilterParams|getFilterParams|\bfilters\s*:"),
    ("ctx", "RequestContext", r"RequestContext\."),
    ("sql", "hard-coded pivot names", r"\b(symbol_literals|literal_uses|buffer_literals|buffer_symbols|Identity_daemons)\b"),
    ("sql", "sqlite catalog/pragma", r"sqlite_master|pragma\s+\w+|PRAGMA"),
]

def classify(path):
    if "/bak/" in path or ".bak" in path or "/bak." in path:
        return "dead"
    if path.startswith(os.path.join(repo, "testament")):
        return "testament"
    if "/documentation/" in path or path.endswith((".md", ".org", ".mdx")):
        return "docs"
    return "live"

compiled = [(group, label, re.compile(regex)) for group, label, regex in patterns]
hits = collections.defaultdict(list)
for root in roots:
    for directory, subdirs, files in os.walk(root):
        subdirs[:] = [s for s in subdirs if s not in skip_dirs]
        for file in files:
            if not file.endswith(extensions):
                continue
            path = os.path.join(directory, file)
            try:
                lines = open(path, encoding="utf-8").read().split("\n")
            except Exception:
                continue
            kind = classify(path)
            short = path.replace(repo + "/", "").replace(home, "~")
            for number, text in enumerate(lines, 1):
                for group, label, regex in compiled:
                    if regex.search(text):
                        hits[(group, label)].append((kind, f"{short}:{number}", text.strip()[:150]))

summary = []
for group, label, _ in patterns:
    rows = hits[(group, label)]
    counter = collections.Counter(kind for kind, _, _ in rows)
    summary.append((group, label, counter["live"], len({site.rsplit(':', 1)[0] for kind, site, _ in rows if kind == "live"}), counter["testament"], counter["dead"], counter["docs"]))
print("group | pattern | live hits | live files | testament | dead | docs")
for row in summary:
    print(" | ".join(str(cell) for cell in row))
json.dump({f"{g}|{l}": rows for (g, l), rows in hits.items()}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "sweep.json"), "w"), indent=0)
