"""replay-m96 — the two hand steps around the m96 replay, on a COPY (never the repo).

    python3 replay-m96.py --root <copy> --before [--write]    # HISTORY (Q12 REVERSED 10-21): the move — retired from replay.sh, kept for the record
    python3 replay-m96.py --root <copy> --reverse [--write]   # undoes --before on a copy that had it (the floor copy, 10-21): classes back to systems/runtime, born files carried
    python3 replay-m96.py --root <copy> --after  [--write]    # ORDER deferrals: registry.js bundles ride `hosts` — restored for a floor baseline

--before (m96 `* as code` typology entities/ — the collage block apply-diffs skips): 13 classes + mode/Mode.ts + daemon/Daemon.ts + the runtime
barrel index.ts move; inside typology the heads are relative; seven runtime import sites re-point to @vivalence/typology/entities.
PROBE 10-21: traits.js (`kernel`) moves along — m96 says DELETED, but gather(kernel…) has four product readers and no hunk (rides `hosts`).
--after: APPLICATION · FRAUGHT · MOUNTED back into ModeTraitsEnum (47 readers stand); the registry.js:277 `bundles` back (3 readers).
"""
import os, re, sys

if "--root" not in sys.argv: sys.exit("replay-m96: --root <copy> is required")
ROOT = sys.argv[sys.argv.index("--root") + 1].rstrip("/") + "/"
if ROOT.startswith("/Users/finn/vivalence/code/vivalence/"): sys.exit("replay-m96: --root is the repo — refused")
write = "--write" in sys.argv

CLASSES = ["Activity", "Buffer", "Constraint", "Intent", "Issue", "Literal", "Note", "Process", "Symbol", "Terminal", "Thread", "Turn", "User"]
MOVES = [(f"systems/runtime/entities/{name}.ts", f"subsystems/typology/entities/{name}.ts") for name in CLASSES] + [
    ("systems/runtime/mode/Mode.ts", "subsystems/typology/entities/Mode.ts"),
    ("systems/runtime/daemon/Daemon.ts", "subsystems/typology/entities/Daemon.ts"),
    ("systems/runtime/entities/index.ts", "subsystems/typology/entities/index.ts"),
    ("systems/runtime/entities/traits.js", "subsystems/typology/entities/traits.js"),
]
REPOINTS = [
    ("subsystems/typology/entities/index.ts", 'export * from "@vivalence/typology/entities";', 'export * from "./base/DataEntity.ts";\nexport * from "./base/VirtualEntity.ts";'),
    ("subsystems/typology/entities/index.ts", '"../mode/Mode.ts"', '"./Mode.ts"'),
    ("subsystems/typology/entities/index.ts", '"../daemon/Daemon.ts"', '"./Daemon.ts"'),
    ("subsystems/typology/entities/Mode.ts", 'import { DataRepository, DataEntity, DataSchema } from "../entities/index.ts";', 'import { DataRepository, DataEntity, DataSchema } from "./base/DataEntity.ts";'),
    ("subsystems/typology/entities/Mode.ts", '"../entities/index.ts"', '"./index.ts"'),
    ("subsystems/typology/entities/Daemon.ts", '"../entities/index.ts"', '"./index.ts"'),
    ("systems/runtime/typology.js", '"./entities/index.ts"', '"@vivalence/typology/entities"'),
    ("systems/runtime/runtime/lifecycle/population.js", '"../../entities/index.ts"', '"@vivalence/typology/entities"'),
    ("systems/runtime/daemon/lifecycle/population.js", '"../../entities/index.ts"', '"@vivalence/typology/entities"'),
    ("systems/runtime/daemon/prototype.js", '"../entities/index.ts"', '"@vivalence/typology/entities"'),
    ("systems/runtime/service/prototype.js", '"../entities/index.ts"', '"@vivalence/typology/entities"'),
    ("systems/runtime/tests/scenarios/lighthouse.js", '"../../entities/index.ts"', '"@vivalence/typology/entities"'),
    ("systems/runtime/mode/index.js", 'export * from "./Mode.ts";', 'export { ModeEntity, ModeRepository, ModeSchema } from "@vivalence/typology/entities";'),
    ("systems/runtime/daemon/index.js", 'export * from "./Daemon.ts";', 'export { DaemonEntity, DaemonRepository, DaemonSchema } from "@vivalence/typology/entities";'),
]
DEFERRALS = [
    ("subsystems/paladin/prototypes/registry.js",
     "      return { ...citizen, reference, url: mask.url?.branch(reference.absolute) };",
     "      return { ...citizen, reference, url: mask.url?.branch(reference.absolute), bundles: new Path(`${mask.mountpoint.absolute}/bundles/${type}/${slug}`) };"),
]

def repoint(rows):
    missed = 0
    for path, old, new in rows:
        full = ROOT + path
        if not os.path.exists(full): print(f"MISSING FILE {path}"); missed += 1; continue
        content = open(full, encoding="utf-8").read()
        n = content.count(old)
        if n == 0: print(f"MISS 0x  {path} :: {old[:60]}"); missed += 1; continue
        if write: open(full, "w", encoding="utf-8").write(content.replace(old, new))
        print(f"{'LANDED' if write else 'ok    '} {n:2d}x {path} :: {old[:60]}")
    return missed

if "--before" in sys.argv:
    missed = 0
    for src, dst in MOVES:
        if not os.path.exists(ROOT + src): print(f"MISSING FILE {src}"); missed += 1; continue
        if write: os.makedirs(os.path.dirname(ROOT + dst), exist_ok=True); os.replace(ROOT + src, ROOT + dst)
        print(f"{'MOVED' if write else 'move '}  {src} → {dst}")
    if write and os.path.isdir(ROOT + "systems/runtime/entities"):
        import shutil; shutil.rmtree(ROOT + "systems/runtime/entities")
    missed += repoint(REPOINTS)
    dangling = [l for l in os.popen(f"grep -rn --include='*.js' --include='*.ts' -E 'entities/(index\\.ts|traits\\.js)\"|/(Mode|Daemon)\\.ts\"' {ROOT}systems/runtime | grep -v /bak/").read().splitlines()]
    print(f"\nm96 move: {len(MOVES)} files · repoints {len(REPOINTS)} · missed {missed} · dangling paths after:")
    for line in dangling: print("  " + line.replace(ROOT, ""))
if "--reverse" in sys.argv:
    import shutil, glob
    REPO = "/Users/finn/vivalence/code/vivalence/"
    missed = 0
    for src, dst in MOVES:
        if not os.path.exists(ROOT + dst): print(f"MISSING FILE {dst}"); missed += 1; continue
        if write: os.makedirs(os.path.dirname(ROOT + src), exist_ok=True); os.replace(ROOT + dst, ROOT + src)
        print(f"{'MOVED' if write else 'move '}  {dst} → {src}")
    born = [p for p in glob.glob(ROOT + "subsystems/typology/entities/*.ts") if os.path.basename(p) != "index.ts"]
    for path in born:
        name = os.path.basename(path)
        if write: os.replace(path, ROOT + "systems/runtime/entities/" + name)
        print(f"{'MOVED' if write else 'move '}  subsystems/typology/entities/{name} → systems/runtime/entities/{name}  (born on the copy)")
    if write:
        shutil.copyfile(REPO + "subsystems/typology/entities/index.ts", ROOT + "subsystems/typology/entities/index.ts")
        for extra in ["bak", "todo"]:
            if os.path.exists(REPO + "systems/runtime/entities/" + extra) and not os.path.exists(ROOT + "systems/runtime/entities/" + extra):
                (shutil.copytree if os.path.isdir(REPO + "systems/runtime/entities/" + extra) else shutil.copyfile)(REPO + "systems/runtime/entities/" + extra, ROOT + "systems/runtime/entities/" + extra)
    print("restore  subsystems/typology/entities/index.ts (the repo's barrel) · systems/runtime/entities/{bak,todo}")
    back = [(path.replace("subsystems/typology/entities/Mode.ts", "systems/runtime/mode/Mode.ts").replace("subsystems/typology/entities/Daemon.ts", "systems/runtime/daemon/Daemon.ts"), new, old)
            for path, old, new in REPOINTS if path != "subsystems/typology/entities/index.ts"]
    back.insert(0, ("systems/runtime/entities/index.ts", 'export * from "./base/DataEntity.ts";\nexport * from "./base/VirtualEntity.ts";', 'export * from "@vivalence/typology/entities";'))
    back.insert(1, ("systems/runtime/entities/index.ts", '"./Mode.ts"', '"../mode/Mode.ts"'))
    back.insert(2, ("systems/runtime/entities/index.ts", '"./Daemon.ts"', '"../daemon/Daemon.ts"'))
    for name in [os.path.basename(p) for p in born]:
        back.append(("systems/runtime/entities/" + name, '"./base/DataEntity.ts"', '"./index.ts"'))
    for path in ["systems/runtime/daemon/prototype.js", "systems/runtime/service/prototype.js"]:
        back.append((path, 'import { VirtualSchema } from "../entities/index.ts";', 'import { VirtualSchema } from "@vivalence/typology/entities";'))
    missed += repoint([row for row in back if not (row[0].startswith("systems/runtime/entities/") and row[1] == '"./base/DataEntity.ts"' and os.path.exists(ROOT + row[0]) and '"./base/DataEntity.ts"' not in open(ROOT + row[0]).read())])
    dangling = os.popen(f"grep -rn --include='*.js' --include='*.ts' -E 'typology/entities/(Mode|Daemon|View|File|Buffer)|base/DataEntity' {ROOT}systems/runtime | grep -v /bak/").read().splitlines()
    print(f"\nm96 reverse (Q12 REVERSED 10-21): {len(MOVES) + len(born)} files back · missed {missed} · dangling after:")
    for line in dangling: print("  " + line.replace(ROOT, ""))
if "--after" in sys.argv:
    missed = repoint(DEFERRALS)
    print(f"\nm96 ORDER deferrals: {len(DEFERRALS)} · missed {missed} · {'WRITTEN' if write else 'dry'}")
