"""the appendix, assembled from its generated parts: python3 appendix.py > <the appendix>"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda name: open(os.path.join(HERE, name)).read().rstrip("\n")
counts = dict(row.split() for row in read("counts.log").split("\n")[1:13])
after = read("after/subsystems/typology/schematics/scalars/index.js")

print(f"""#+title: m128 appendix I — the scalars in full: every scalar site of typology's schematics, and the scalar it wears or would wear
#+filetags: :typology:schematics:scalars:types:
#+status: DESIGNING, 63 hunks in 21 files TANGLED (=Slug= on the one wide pattern at all 8 entity slugs, 15 scalars the tree already names gain their =$id=, six new scalars at 29 sites, =ID= at 8 more; they replay onto a copy; typology's and paladin's suites read on the copy as on the tree, but typology's two bundle tests); nothing landed; RULED: =ModuleIdentifier= · one wide =Slug= everywhere · a faculty's =id= stays; open: five names (=Version= · =Hash= · =Integrity= · =Index= · =Bytes=), 23 tightenings, 15 wires, encoded bytes and the signing secret without a noun
# writer: agent · limit: 42000 chars · appendix of =m128-typed-schematics.org=, under its ruling 7 (a scalar names itself)

* intent

/"earlier you had a list of maybe 3 douzen scalars. lets work out the scalars in full. in an quest appendix called m128-appendix-I-scalars.ts.org"/

* the scalars the tree names — 36

All under =subsystems/typology/schematics/=. The last column says where the name reaches the type: =today= · =stop 2= (the quest) · =here= (this appendix) · =open= (=* open= 5) · =never= (a codec hands back a held name, =v.js:52=).

| scalar | defined | holds | =$id= |
|--------+---------+-------+-------|
| =ID= | =scalars/index.js:6= | string, 1 char or more | stop 2 |
| =Slug= | =scalars/index.js:8= | string, =^[a-z0-9]+(?:-[a-z0-9]+)*$= | stop 2 |
| =JWTToken= | =scalars/index.js:11= | string, three dotted base64url parts | stop 2 |
| =Username= | =scalars/index.js:13= | string, 1 to 64 chars | stop 2 |
| =Password= | =scalars/index.js:15= | string, 1 char or more | stop 2 |
| =url= | =scalars/url.js:19= | string, RFC 3986 with an authority | open |
| =mime.type= | =scalars/mime.js:10= | string, RFC 6838 | open |
| =v.instant= | =v.js:161= | string, format date-time | open |
| =v.date= | =v.js:162= | string, format date | open |
| =v.duration= | =v.js:163= | string, format duration | open |
| =v.datetime= | =v.js:164= | string, RFC 9557 without an offset | open |
| =v.zoned= | =v.js:166= | string, RFC 9557 with an offset and a zone | open |
| =Hex= | =primitives/theme.js:8= | string, =#RRGGBB= | here |
| =Alpha= | =primitives/theme.js:9= | string, =rgba(…)= | here |
| =Px= | =primitives/theme.js:11= | string, =1px= | here |
| =Percent= | =primitives/theme.js:12= | string, =50%= | here |
| =Rem= | =primitives/theme.js:13= | string, =.25rem= | here |
| =Em= | =primitives/theme.js:14= | string, =.14em= | here |
| =Factor= | =primitives/theme.js:15= | number, 0 or more | here |
| =Ratio= | =primitives/theme.js:16= | number, 0 to 1 | here |
| =Leading= | =primitives/theme.js:17= | number, 0.8 to 2 | here |
| =Shadow= | =primitives/theme.js:18= | string, 1 char or more | here |
| =Family= | =primitives/theme.js:19= | string, 1 char or more | here |
| =Glow= | =primitives/theme.js:20= | string, 1 char or more | here |
| =Filter= | =primitives/theme.js:21= | string, 1 char or more | here |
| =Probability= | =primitives/hallucination.js:315= | number, 0 to 1, not exported | here |
| =Themed= | =traits/themed.js:3= | string | here |
| =Reference= | =primitives/instance.js:194= | string, =${{PREFIX_KEY}}=, a function of the prefix | open |
| =Mountpoint= | =primitives/instance.js:17= | =Path=, absolute | today |
| =Signature= | =prototypes/signatures.js:25= | codec, worn at 0 sites | never |
| =Signal= | =prototypes/signatures.js:26= | codec | never |
| =Path= | =prototypes/signatures.js:27= | codec | never |
| =FilePath= | =prototypes/signatures.js:28= | codec, worn at 0 sites | never |
| =Url= | =prototypes/signatures.js:29= | codec | never |
| =Action= | =prototypes/signatures.js:30= | codec, worn at 0 sites | never |
| =Pattern= | =prototypes/signatures.js:31= | codec, worn at 0 sites | never |

* every site — 536

=reference/m128-typed-schematics/scalars/sites.py= walks every =.js= under =schematics/= (no =bak/=) and prints each scalar site with the key path it sits at. =assign.py= gives each site one scalar and one state, first rule wins, a site no rule holds stops it. The whole list, one site per entry: =assigned.tsv=.

| state | sites | what it is |
|-------+-------+------------|
| named | {counts["named"]} | a scalar's own definition |
| worn | {counts["worn"]} | wears a named scalar today |
| ruled | {counts["ruled"]} | bare today, =Slug= by his ruling, on the one wide pattern |
| wear | {counts["wear"]} | bare today, a named scalar fits, only =""= is refused |
| new | {counts["new"]} | bare today, one thing at two or more sites, its name is its key |
| tighten | {counts["tighten"]} | bare today, a scalar or closed set of the tree fits and refuses more than today |
| wire | {counts["wire"]} | bare today, the string a codec of the tree decodes |
| unnamed | {counts["unnamed"]} | one thing at two or more sites, no noun for it in the tree |
| key | {counts["key"]} | the key of a record |
| prose | {counts["prose"]} | free text |
| bare | {counts["bare"]} | named by its key: one site, or no constraint |
| closed | {counts["closed"]} | =v.const= · =v.enum= · =v.null=, a closed set already |

By builder, the scalar sites: =v.string= 226 · =v.integer= 32 · =v.number= 15 · =v.boolean= 8 · =v.instant= 6.

{read("tables.org")}

* as code

DESIGNED by me, unruled: =ModuleIdentifier= is his name, the other five are each the key they sit under. The hunks stand on the quest's =* as code= (its stop 2 gives =scalars/index.js= the five =$id=).

** the scalars file after, whole

#+BEGIN_SRC js
// subsystems/typology/schematics/scalars/index.js
{after}
#+END_SRC

** the hunks, 63 in 21 files

{read("hunks.org")}

* open

His, each a ruling:

1. *the six names* — =ModuleIdentifier= (his: /"module is the thing paladin.registry returns. the search query on mask module is an ModuleIdentifier."/; =subsystems/paladin/prototypes/registry.js:256= =module(identifier)=; LOCKED /"1 amen."/) · =Version= · =Hash= · =Integrity= · =Index= · =Bytes=, each its key's word, unruled. None adds a constraint: a site refuses what it refused before.
2. *four things without a noun* (=** unnamed=, 14 sites): a faculty's id ×5 and the provider's id of one tool call ×2: RULED /"ok fuck it id stays."/, the key stays =id=, bare · encoded bytes ×5 · the signing secret ×2. The tree has no word for them. No hunk until he names them.
3. *the 28 tightenings* (=** tighten=), each refuses values the schematic admits today. Measured on his =localhost= db (=held.db.py= → =held.db.log=, read-only):
   - =Slug= on every entity slug, ONE pattern everywhere, capitals · =_= · dots · accents inside: RULED /"all these should be captured by the slug."/ · /"i do."/ (one pattern everywhere). Tangled above. Probed (=unicode.probe.js=): his db holds none outside it. Unprobed: a manifest slug with a capital, a dot or =_= as a folder (=daemon_<slug>=) and a reference.
   - =Slug=: =Daemon= 3 · =Intent= 11 · =Mode= 38 · =User= 1 · =View= 19 slugs held, none outside. =Literal= 2504 of 6812 outside (=abajo.adverb=), =Note= 290 of 290 (=retention.agua.noun=), =Symbol= 1373 of 1384 (=domain.animals=): of those outside, =Literal= 1414 · =Note= 278 · =Symbol= 787 are =Slug= parts joined by dots; the rest carry capitals (=puzzle-0000D= · =opening.eco.A00=), =_=, or accents (=retention.azúcar.noun=).
   - =Role=: =Turn.role= holds =user= ×81 · =assistant= ×74.
   - =mime.type= on a part: unmeasured, a part's mime sits inside =Turn.parts=.
   - =UserReference.slug= wears =Slug= today (=primitives/auth.js:15=), =User.slug= is bare (=entities/user.js:10=): one thing, defined twice.
4. *the 15 wires* (=** wire=): a string a codec of the tree decodes. Wearing the codec changes what the key HOLDS after decode, from a string to the prototype. =FilePath= has no wearer today.
5. *the builders without a name*: =url= · =mime.type= · =v.instant= · =v.date= · =v.duration= · =v.datetime= · =v.zoned= · =Reference=. =slug= got its =$id= inside the builder (stop 2). The same act names these; =url= would share the name =Url= with the codec and the prototype.
6. *=v.collect= answers on the name alone* (=schematics/v.js:15=). With =ModuleIdentifier= on the string arm of =ModeMasks= (=primitives/instance.js:74=) it returns the whole object mode at =/modes/1= beside the four modules (=collect.s6.out.log=). One caller today, by =Mountpoint= (=subsystems/paladin/paladin/lifecycle.js:162=).
7. *found while reading, outside a scalar's name*:
   - =Mode.installed= (=entities/mode.js:15=): the example is an ISO stamp, his db holds 38 of 38 eight-hex stamps (=13bbe12e=).
   - =Activity.status= (=entities/activity.js:10=): its description lists =FAULTED=; =State= (=primitives/controller.js:10=) has =FAILED=, no =FAULTED=.
   - =StatusCode= (=prototypes/index.js:6=) is worn nowhere; =Status.code= (=prototypes/index.js:17=) is a bare string.
   - =rounds= has three shapes: 1 to 100, default 12 (=traits/harnessed.js:8=) · 1 or more, default 10 (=primitives/hallucination.js:488= · =:503=) · unbounded (=:168=).
   - =harmonize= is written twice: bounded in =traits/conversational.js:9=, unbounded in =primitives/hallucination.js:495=.
   - =Probability= (=primitives/hallucination.js:315=) is declared below =Tune= (=:217=), which holds the same bounds, and is not exported, so =Conversational= cannot wear it.
   - =AUTOLOGIN.password= asks 8 chars (=primitives/instance.js:103=), =Password= asks 1.
   - a =$id= is one name in one space; these names are defined twice in =schematics/=: =State= · =Channel= · =Verb= · =Fault= · =Status=, =Signal= three times. It binds the day a closed set names itself.

* measured

- the sites: =sites.py= → =sites.log= (536) · =assign.py= → =counts.log= · =assigned.tsv=.
- the copy: =copy.sh= (the tree's typology + paladin, the quest's four files replayed) · =edit.py= writes the edits, each must land exactly once · =hunks.py= prints them as the blocks above · =after/= holds the 21 files.
- the replay: =replay.sh= → =replay.log=: the hunks land on a fresh copy, the 21 files equal =after/=.
- the suites (=suites.sh=, =HOME= empty): typology on the tree =ok | 168 passed (737 steps)=, on the copy =166 passed (733 steps) | 2 failed (4 steps)=, the two bundle tests a scratch folder cannot bundle. paladin, all but =bundler.test.js=: tree and copy =62 passed (276 steps) | 1 failed (1 step)=, =mod.client.js= on both.
- the stored snapshots a suite run rewrites, copy against tree, the quest's stop 2 included: =mode-entity= gains 482 =$id= entries · =view-entity= 158 · =file-entity= 86 · =harness-request= 4, and =minLength: 1= four times.
- =collect.probe.js= → =collect.s6.out.log=: a cast daemon mask has no faults; =v.collect(DaemonMask, mask, ModuleIdentifier)= finds =/modes/0= · =/modes/1/module= · =/modes/1/consume/nlp/module= · =/hallucinators/0/module=, and =/modes/1= (=* open= 6); the instance mask's JSON carries =ModuleIdentifier= 20 times and compiles.
- the hover (=hover.s6.out.log=): =version: Schematic<TOptional<TString & {{ $id: "Version" }}>>= · =module: Schematic<TString & {{ $id: "ModuleIdentifier" }}>=.
- who reads =$id= outside =v=: =systems/runtime/gestalten/primer/render.js:5= prints a property as its description, else its =$id=, else its type · both model translators strip it (=commons/hallucinators/anthropic/provider/translate.js:136= · =openrouter/…:137=).

* next

His go lands the hunks, with the quest's four files. Open beside it, his: the five names · the rest of =* open= 3 to 7. Owed with the land: a test in =subsystems/typology/tests/= that =Slug= admits and refuses the values of =unicode.probe.js=.""")
