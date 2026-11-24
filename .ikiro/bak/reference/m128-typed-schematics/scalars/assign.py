"""every scalar site of sites.log gets one scalar and one state. first rule wins; a site no rule holds is an error.

    python3 assign.py            # the counts
    python3 assign.py --sites    # file:line <TAB> path <TAB> today <TAB> scalar <TAB> state <TAB> note
    python3 assign.py --org      # the appendix tables

states
    named     the scalar's own definition
    worn      the site wears a named scalar today
    wear      bare today, a named scalar fits, only "" is refused
    new       bare today, one thing at two or more sites, its name read off its key
    tighten   bare today, a scalar or a closed set of the tree fits and refuses more than today
    wire      bare today, the string a codec of the tree decodes
    unnamed   one thing at two or more sites, no noun for it in the tree
    key       the key of a record
    prose     free text
    bare      named by its key, one site or no constraint
"""
import collections
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCALARS = ("v.string", "v.number", "v.integer", "v.boolean", "v.instant")
CLOSED = ("v.const", "v.enum", "v.null")

RULES = [
    (r"scalars/index\.js:\d+ ID$", "ID", "named", "minLength 1"),
    (r"scalars/index\.js:\d+ slug$", "Slug", "named", "^[a-z0-9]+(?:-[a-z0-9]+)*$"),
    (r"scalars/index\.js:\d+ JWTToken$", "JWTToken", "named", "three dotted base64url parts"),
    (r"scalars/index\.js:\d+ Username$", "Username", "named", "1 to 64 chars"),
    (r"scalars/index\.js:\d+ Password$", "Password", "named", "minLength 1"),
    (r"scalars/mime\.js:\d+ type$", "mime.type", "named", "RFC 6838, no $id"),
    (r"scalars/url\.js:\d+ url$", "url", "named", "RFC 3986 with an authority, no $id"),
    (r"theme\.js:\d+ (Hex|Alpha|Px|Percent|Rem|Em|Shadow|Family|Glow|Filter)$", r"\1", "named", "no $id"),
    (r"theme\.js:\d+ (Factor|Ratio|Leading)$", r"\1", "named", "no $id"),
    (r"hallucination\.js:315 Probability$", "Probability", "named", "0 to 1, not exported, no $id"),
    (r"themed\.js:3 Themed$", "Themed", "named", "no constraint, no $id"),
    (r"instance\.js:194 Reference$", "Reference", "named", "a function of the prefix, no $id"),

    (r"\{key\}$", "—", "key", ""),

    (r"base\.js:11 VirtualEntitySchema\.id$", "ID", "wear", ""),
    (r"harness\.js:1[678] Request\.(thread|terminal|turn)$", "ID", "wear", ""),
    (r"hallucination\.js:349 Packet\.TurnOpen\.turn\.id$", "ID", "wear", ""),
    (r"hallucination\.js:377 Packet\.PartFull\.turn$", "ID", "wear", ""),
    (r"track\.js:9 Entity\.id$", "ID", "wear", ""),
    (r"hallucination\.js:63 Part\.File\.file$", "ID", "wear", "a File's id"),
    (r"Part\.Tool(Use|Result)\.id$", "—", "unnamed", "the provider's id of one tool call"),
    (r"(Faculty|FacultyRecipe|FacultyMask|Selector|Picture\.Response)\.id$", "—", "unnamed", "a faculty's id"),

    (r"(Daemon|Intent|Mode|User|View|Literal|Note|Symbol)Schematic\.own\.slug$", "Slug", "ruled", "the one wide pattern"),
    (r"LiteralSchematic\.own\.daemon$", "Slug", "tighten", "a daemon's slug"),
    (r"(Selector|Picture\.Response)\.provider$", "Slug", "tighten", "a provider's slug"),
    (r"Rendered\.(frame|cell)$", "Slug", "tighten", "a view's slug"),

    (r"\.module$|Mode(Masks|Recipes)\[\]\|$", "ModuleIdentifier", "new", ""),
    (r"\.hash$", "Hash", "new", ""),
    (r"\.integrity$", "Integrity", "new", ""),
    (r"\.version$", "Version", "new", ""),
    (r"\.index$", "Index", "new", ""),
    (r"\.bytes$", "Bytes", "new", ""),

    (r"Part\.(Image|Audio|Video|Document)\.mime$", "mime.type", "tighten", "RFC 6838"),
    (r"Part\.(Image|Audio|Video|Document)\.data$|Audio\.Packet\.audio\.data$", "—", "unnamed", "encoded bytes"),
    (r"secrets\.jwt$", "—", "unnamed", "the signing secret, minLength 24"),

    (r"TurnSchematic\.own\.role$|Packet\.TurnOpen\.turn\.role$", "Role", "tighten", "hallucination.js:115"),
    (r"Part\.ToolResult\.condition$", "Condition", "tighten", "prototypes/yield.js:3"),
    (r"Faculty(Mask)?\.type$", "FacultyType", "tighten", "hallucination.js:17"),
    (r"track\.js:5 Request\.method$", "Verb", "tighten", "connection.js:5, not exported"),
    (r"ActivitySchematic\.own\.status$", "State", "tighten", "controller.js:10; its description says FAULTED"),
    (r"track\.js:10 Status\.code$", "State", "tighten", "controller.js:10"),
    (r"prototypes/index\.js:17 Status\.code$", "StatusCode", "tighten", "prototypes/index.js:6, worn nowhere"),
    (r"controller\.js:28 Record\.track$", "Track", "tighten", "track.js:12"),
    (r"MISSING\.since$", "v.instant", "tighten", "its description says ISO 8601"),
    (r"AUTOLOGIN\.username$", "Username", "tighten", "adds maxLength 64"),
    (r"UserReference\.traits\[\]$", "traits.names.user", "tighten", "traits/index.js:199"),
    (r"Policy\.verbatim\.harmonize\.tolerance$", "Probability", "tighten", "the trait's twin is bounded 0 to 1"),
    (r"hallucination\.js:218 Tune\[\]$|Conversational\.harmonize\.tolerance$", "Probability", "wear", "the same bounds"),

    (r"Home\.reference$|DaemonRecipe\.reference$", "Path", "wire", ""),
    (r"Recipe\.mountpoint\|?$", "Mountpoint", "wire", ""),
    (r"harness\.js:10 Signal\.nature$|Aimed\.mount$", "Signal", "wire", "a route"),
    (r"(File|View)Schematic\.own\.(mount\|?|path|entry)$", "FilePath", "wire", ""),
    (r"Bundle\.entries\[\]\.mount$|Tapped\{\}\.mount$|statics\.db\.file$", "FilePath", "wire", ""),

    (r"Tool(Use)?\.name$|Part\.ToolUse\.name$", "—", "bare", "a tool's name"),
    (r"\.(name|description|message\|?|text|prompt|revised|valence|stack)$", "—", "prose", ""),
    (r"(Rubric|Ask|Log)\|$", "—", "prose", ""),
    (r"\.traits\[\]$", "—", "bare", "a trait's name, an open set"),
    (r".", "—", "bare", ""),
]


def sites():
    for row in open(os.path.join(HERE, "sites.log")).read().splitlines():
        at, path, today, expression = row.split("\t")
        yield at, path, today, expression


def assign(at, path, today):
    head = f"{at} {path}"
    if today in CLOSED:
        return "—", "closed", ""
    if today not in SCALARS:
        for pattern, scalar, state, note in RULES[:12]:
            if re.search(pattern, head):
                return re.sub(pattern, scalar, re.search(pattern, head).group(0)).split()[-1] if "\\1" in scalar else scalar, state, note
        return {"type": "mime.type", "slug": "Slug"}.get(today, today), "worn", ""
    if today == "v.instant":
        return "v.instant", "worn", ""
    for pattern, scalar, state, note in RULES:
        found = re.search(pattern, head)
        if found:
            return (found.expand(scalar) if "\\1" in scalar else scalar), state, note
    raise SystemExit(f"no rule holds {head}")


def rows():
    for at, path, today, expression in sites():
        scalar, state, note = assign(at, path, today)
        yield at, path, today, scalar, state, note


def counts():
    held = list(rows())
    print(f"sites {len(held)}")
    by = collections.Counter(state for *_, state, _ in held)
    for state in ("named", "worn", "ruled", "wear", "new", "tighten", "wire", "unnamed", "key", "prose", "bare", "closed"):
        print(f"{state:8} {by[state]}")
    print("== by scalar and state")
    pairs = collections.Counter((scalar, state) for _, _, _, scalar, state, _ in held if scalar != "—")
    for (scalar, state), count in sorted(pairs.items()):
        print(f"{scalar:20} {state:8} {count}")
    print("== by builder, the scalar sites only")
    kinds = collections.Counter(today for _, _, today, _, state, _ in held if today in SCALARS)
    print(" · ".join(f"{today} {count}" for today, count in kinds.most_common()))


def org():
    held = list(rows())
    groups = collections.defaultdict(list)
    for at, path, today, scalar, state, note in held:
        groups[(state, scalar if scalar != "—" else note)].append((at, path, note))
    for state in ("ruled", "wear", "new", "tighten", "wire", "unnamed"):
        print(f"** {state}")
        for (held_state, scalar), found in sorted(groups.items()):
            if held_state != state:
                continue
            print(f"- ={scalar}= ×{len(found)}" if state != "unnamed" else f"- {scalar} ×{len(found)}")
            for at, path, note in found:
                print(f"  - ={at}= ={path}=" + (f" — {note}" if note and note != scalar else ""))
        print()
    for state in ("key", "prose", "bare"):
        keys = collections.Counter(
            re.sub(r"(\[\]|\||\{\}|\{key\})+$", "", path).split(".")[-1] + ("[]" if path.endswith("[]") else "")
            for _, path, _, _, held_state, _ in held if held_state == state
        )
        print(f"** {state}")
        print(" · ".join(f"={key}=×{count}" if count > 1 else f"={key}=" for key, count in keys.most_common()))
        print()


if "--sites" in sys.argv:
    for row in rows():
        print("\t".join(row))
elif "--org" in sys.argv:
    org()
else:
    counts()
