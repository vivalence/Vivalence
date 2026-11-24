"""verdict — what each exported name of typology's schematics is to the type system today.
writes verdict.probe.ts (one row per export), runs `deno check` on it, runs declared.probe.js over the same files
(the unknowns a schematic wrote itself), folds both to verdict.log."""
import collections, glob, json, os, re, subprocess

TREE = "/Users/finn/vivalence/code/vivalence"
HERE = os.path.dirname(os.path.abspath(__file__))
DIRS = ["scalars", "primitives", "entities", "prototypes", "traits"]

HEAD = '''import type { Static, StaticDecode, TSchema } from "typebox";
type IsAny<T> = 0 extends 1 & T ? true : false;
type Inside<T, Depth extends 0[] = []> = IsAny<T> extends true ? true
  : Depth["length"] extends 8 ? false
  : T extends (...args: never[]) => unknown ? false
  : T extends readonly (infer Item)[] ? Inside<Item, [...Depth, 0]>
  : T extends object ? (true extends { [Key in keyof T]: Inside<T[Key], [...Depth, 0]> }[keyof T] ? true : false)
  : false;
type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
type Where<T, At extends string = "", Depth extends 0[] = []> = IsAny<T> extends true ? `${At} any`
  : IsUnknown<T> extends true ? `${At} unknown`
  : Depth["length"] extends 8 ? never
  : T extends (...args: never[]) => unknown ? never
  : T extends readonly (infer Item)[] ? Where<Item, `${At}[]`, [...Depth, 0]>
  : T extends object
    ? { [Key in keyof T]-?: Where<Exclude<T[Key], undefined>, `${At}.${Key & string}`, [...Depth, 0]> }[keyof T]
  : never;
type Shown<T> = [T] extends [never] ? "none" : T;
type Verdict<T> = IsAny<T> extends true ? "any"
  : T extends (...args: never[]) => unknown ? "function"
  : T extends { cast: unknown; faults: unknown }
    ? (T extends TSchema
      ? (IsAny<Static<T>> extends true ? "holds any"
        : unknown extends Static<T> ? "holds unknown"
        : [Where<Static<T>>] extends [never] ? (Static<T> extends StaticDecode<T> ? "typed" : "typed, decodes")
        : Where<Static<T>>)
      : "schematic, no schema")
  : Inside<T> extends true ? "value, any inside"
  : "value";
'''

SAID = r"TS\d+ \[ERROR\]: (.*?)\n(?:.*\n)*?\s+at file://\S+\.probe\.ts:(\d+):"


def ask(probe, imports, rows):
    """rows: (key, type expression). returns {key: [what the checker said]}."""
    text = [*imports, HEAD, *[f'export const r{index}: {expression} = "?";' for index, (_, expression) in enumerate(rows)]]
    text = "\n".join(text).split("\n")
    open(f"{HERE}/{probe}.probe.ts", "w", encoding="utf-8").write("\n".join(text) + "\n")
    run = subprocess.run(
        ["deno", "check", "--config", f"{TREE}/deno.jsonc", f"{HERE}/{probe}.probe.ts"],
        cwd=TREE, capture_output=True, text=True, env={**os.environ, "NO_COLOR": "1"},
    )
    raw = run.stdout + run.stderr
    open(f"{HERE}/{probe}.raw.log", "w", encoding="utf-8").write(raw)
    answers = {}
    for message, row in re.findall(SAID, raw):
        index = re.match(r"export const r(\d+):", text[int(row) - 1])
        said = re.search(r"not assignable to type '(.*)'\.?$", message)
        if index and said:
            answers[rows[int(index.group(1))][0]] = re.findall(r'["`]([^"`]*)["`]', said.group(1)) + (
                ["TRUNCATED"] if "..." in said.group(1) else []
            )
    return answers


imports, modules, names = [], {}, []
for directory in DIRS:
    for path in sorted(glob.glob(f"{TREE}/subsystems/typology/schematics/{directory}/*.[jt]s")):
        if path.endswith(".d.ts"):
            continue
        file = os.path.relpath(path, f"{TREE}/subsystems/typology/schematics")
        found = re.findall(r"^export (?:const|function|class) ([A-Za-z_$][\w$]*)", open(path, encoding="utf-8").read(), re.M)
        if not found:
            continue
        modules[file] = f"m{len(imports)}"
        imports.append(f'import * as {modules[file]} from "{os.path.relpath(path, HERE)}";')
        names += [(file, name) for name in found]

files = sorted(modules)
json.dump(files, open(f"{HERE}/files.json", "w"))
walked = subprocess.run(
    ["deno", "run", "-A", "--no-check", "--config", f"{TREE}/deno.jsonc", f"{HERE}/declared.probe.js"],
    cwd=TREE, capture_output=True, text=True, env={**os.environ, "NO_COLOR": "1"},
)
declared = json.load(open(f"{HERE}/declared.json"))
keys = json.load(open(f"{HERE}/keys.json"))

first = ask("verdict", imports, [((file, name), f"Verdict<typeof {modules[file]}.{name}>") for file, name in names])

again = []
for (file, name), said in first.items():
    if said == ["function"]:
        again.append(((file, name, "()"), f"Verdict<ReturnType<typeof {modules[file]}.{name}>>"))
    if "TRUNCATED" in said:
        again += [
            ((file, name, key), f'Shown<Where<Static<typeof {modules[file]}.{name}>["{key}"], ".{key}">>')
            for key in keys[f"{file} {name}"]
        ]
second = ask("second", imports, again)

KINDS = {"any", "typed", "typed, decodes", "function", "value", "value, any inside", "holds any", "holds unknown", "schematic, no schema"}
verdicts, returns = {}, {}
for file, name in names:
    said = first.get((file, name), ["NO ANSWER"])
    if "TRUNCATED" in said:
        said = [path for key in keys[f"{file} {name}"] for path in second.get((file, name, key), ["NO ANSWER"]) if path != "none"]
    verdicts[(file, name)] = said
    if said == ["function"]:
        returns[(file, name)] = second.get((file, name, "()"), ["NO ANSWER"])

out = [f"exports {len(names)} · answered {len(first)} · asked again {len(again)}, answered {len(second)} · {walked.stdout.strip()}"]
per_file = collections.defaultdict(collections.Counter)
total = collections.Counter()
leaks = []
for file, name in names:
    said = verdicts[(file, name)]
    cut = "TRUNCATED" in said
    said = [path for path in said if path != "TRUNCATED"]
    if said[0] in KINDS or "NO ANSWER" in said:
        kind = "NO ANSWER" if "NO ANSWER" in said else said[0]
    else:
        written = {re.sub(r" unknown( \{.*\})?$", " any", path) for path in declared.get(f"{file} {name}", [])}
        leaked = sorted(path for path in said if re.sub(r" unknown$", " any", path) not in written)
        kind = "leaks" if leaked else "typed, unknown as written"
        if leaked:
            leaks.append((file, name, leaked, f"{len(said)}{' read, the answer is cut' if cut else ''}"))
    per_file[file][kind] += 1
    total[kind] += 1
out.append("== total")
out += [f"  {kind} ×{count}" for kind, count in total.most_common()]
out.append("== per file")
for file in sorted(per_file):
    out.append(f"  {file}: " + " · ".join(f"{kind} ×{count}" for kind, count in per_file[file].most_common()))
out.append("== leaks: a path the type holds as unknown or any, where the schematic wrote neither")
for file, name, leaked, said in leaks:
    out.append(f"  {file} {name}: {len(leaked)} of {said}")
    out += [f"    {path}" for path in leaked]
out.append("== a function: what it returns")
for (file, name), said in returns.items():
    out.append(f"  {file} {name}: {' | '.join(said)}")
out.append("== a value with any inside")
out += [f"  {file} {name}" for (file, name), said in verdicts.items() if said == ["value, any inside"]]
open(f"{HERE}/verdict.log", "w", encoding="utf-8").write("\n".join(out) + "\n")
print("\n".join(out))
