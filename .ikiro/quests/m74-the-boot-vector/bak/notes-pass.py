import re, sys, pathlib

path = pathlib.Path("/Users/finn/vivalence/code/vivalence/.ikiro/quests/m74-the-boot-vector.org")
text = path.read_text()
before = text

def swap(old, new, count=1):
    global text
    found = text.count(old)
    if found != count:
        sys.exit(f"ANCHOR x{found} (want {count}): {old[:90]!r}")
    text = text.replace(old, new)

def section(start, end, body):
    global text
    a = text.find(start)
    b = text.find(end)
    if a < 0 or b < 0 or b <= a or text.count(start) != 1 or text.count(end) != 1:
        sys.exit(f"SECTION anchors: {start!r} {a} · {end!r} {b}")
    text = text[:a] + body + text[b:]

swap(
    "#+status: DESIGNED. =steer.dispatch.execute= LANDED in typology. Everything else is sketch; the structure runs in a scratchpad sandbox against the live typology and runtime, =scratchpad/m74/structure/structure.mikro.test.js= =5 passed | 0 failed=. Naming is beef's pass.",
    "#+status: DESIGNED. =steer.dispatch.execute= · =belt.control= LANDED in typology. Everything else is sketch; the structure runs in a sandbox against the live typology and runtime, =.ikiro/quests/m74-the-boot-vector/sandbox/structure.test.js= =6 passed | 0 failed=. Naming is beef's pass.",
)

swap(
    "| die        | what a run executes against: =controller · mask=, plus the subject       |\n| subject    | =die.runtime= · =die.service= · =die.daemon= · =die.mode=, set by =core= |",
    "| die        | what a run executes against: =controller · mask · subject=               |\n| subject    | =die.runtime= · =die.service= · =die.daemon= · =die.mode=, born with the die |",
)
swap(
    "| process    | the row a repository holds: =mask · controller · execution=               |",
    "| process    | the row =entities.process= holds: =type · slug · mask · controller · execution= |",
)
swap(
    "| =run/<parent>= → =run/<child>=              | a parent hands its child to =children=  |",
    "| =run/<parent>= → =run/<child>=              | a parent hands its child's run to its population |",
)
swap(
    "| lifecycle/runtime/population.js     | =lifecycle.runtime.population.entities=    |",
    "| lifecycle/runtime/population.js     | =lifecycle.runtime.population.daemons=     |",
)

section("** run.js\n", "** schematics/index.js\n", r'''** run.js

#+BEGIN_SRC js
// systems/runtime/run.js
import paladin from "@vivalence/paladin";
import { Controller, Span, steer } from "@vivalence/typology";
import { Runtime, run } from "./typology.js";

if (import.meta.main) {
  const die = {
    controller: new Controller({ stdout: new Span(`runtime/${paladin.instance.runtime.manifest.slug}`) }),
    mask: paladin.instance.runtime,
    runtime: new Runtime({ instance: paladin.instance }),
  };

  die.controller.stdout.to((record) => console.log(`[${record.path}] ${record.verb}`, record.data ?? record.message ?? ""));
  for (const signal of ["SIGTERM", "SIGINT", "SIGQUIT"]) Deno.addSignalListener(signal, () => die.controller.kill("SIGTERM", signal));

  await steer.dispatch.execute(run.runtime, die);
}
#+END_SRC

- the subject is born with the die :: /"were born before we run ourselves and we die where we come from."/ Whoever mints a die mints its subject: =run.js= the runtime, the runtime its services and daemons, the daemon its modes. No =core= mints one.

** run/runtime.js

#+BEGIN_SRC js
// systems/runtime/run/runtime.js
import { Vector } from "@vivalence/typology";
import * as lifecycle from "../lifecycle/index.js";
import { daemon } from "./daemon.js";
import { service } from "./service.js";

const { process } = lifecycle;
const { population, resolution, integration } = lifecycle.runtime;

export const runtime = new Vector()
  .use(process.exit)
  .use(process.seal)
  .use(population.mount)
  .use(population.registry)
  .use(population.datamap)
  .use(population.wiring)
  .use(population.aperture)
  .use(population.services(service))
  .use(population.daemons(daemon))
  .use(resolution.attach)
  .use(resolution.expose)
  .use(resolution.metadata)
  .use(integration.serve)
  .use(integration.announce);

runtime.affect(process.effect);
#+END_SRC

| lifecycle            | today                              | teardown half          |
|----------------------+------------------------------------+------------------------|
| population.mount     | =run.js:5-9=                       |                        |
| population.registry  | =lifecycle/populate.js:6=          |                        |
| population.datamap   | new                                | =datamap.disintegrate= |
| population.wiring    | =lifecycle/populate.js:10=         |                        |
| population.aperture  | =lifecycle/populate.js:14=         |                        |
| population.services  | =lifecycle/populate.js:35= · =die.js:22= | stop · await     |
| population.daemons   | =lifecycle/populate.js:20= · =die.js:22= | stop · await     |
| resolution.attach    | =lifecycle/resolve.js:6=           |                        |
| resolution.expose    | =lifecycle/resolve.js:90=          |                        |
| resolution.metadata  | =lifecycle/resolve.js:101=         |                        |
| integration.serve    | =lifecycle/integrate.js:27=        | =server.shutdown=      |
| integration.announce | =lifecycle/integrate.js:52=        |                        |

** run/daemon.js

#+BEGIN_SRC js
// systems/runtime/run/daemon.js
import { Vector } from "@vivalence/typology";
import * as lifecycle from "../lifecycle/index.js";
import { mode } from "./mode.js";

const { process } = lifecycle;
const { population, resolution, integration, aperture } = lifecycle.daemon;

export const daemon = new Vector()
  .use(process.seal)
  .use(population.core)
  .use(population.wiring)
  .use(population.datamap)
  .use(population.authority)
  .use(population.acid)
  .use(population.services)
  .use(population.modes(mode))
  .use(resolution.domain)
  .use(resolution.freight)
  .use(aperture.datamap)
  .use(aperture.userspace)
  .use(aperture.modes)
  .use(aperture.freight)
  .use(aperture.metadata)
  .use(aperture.cortex)
  .use(integration.call)
  .use(integration.prune);

daemon.affect(process.effect);
#+END_SRC

** run/service.js · run/mode.js

#+BEGIN_SRC js
// systems/runtime/run/service.js
export const service = new Vector()
  .use(process.seal)
  .use(lifecycle.service.aperture);

service.affect(process.effect);
#+END_SRC

#+BEGIN_SRC js
// systems/runtime/run/mode.js
export const mode = new Vector()
  .use(process.seal)
  .use(lifecycle.mode.core)
  .use(lifecycle.mode.traits.stagger);

mode.affect(process.effect);
#+END_SRC

** the effect

One effect, four runs. What runs WHILE a process is alive, today:

| process | while alive, today                                      | at                        | after                 |
|---------+---------------------------------------------------------+---------------------------+-----------------------|
| runtime | OS signal listeners                                     | =die.js:57=               | =run.js=              |
| runtime | patrol every 60 s                                       | =die.js:64=               | QUESTIONED            |
| daemon  | nothing                                                 | =daemon/die.js:49=        |                       |
| service | nothing                                                 | =process/die.js:13=       |                       |
| mode    | nothing; =BOOTED= · =DATASINK= hold a teardown          | =daemon/traits/booted.js= | a lifecycle's 2nd half |

- a lifecycle owns what is BUILT and owed back :: both halves around =next()=. The server, the datamap, a mode's =boot= teardown.
- the effect owns only TIME :: the span between =open= and =close=. Work that repeats while alive (a patrol, a heartbeat, a differ over the instance record) is the only kind with a seat in an effect.
- the event is =stdout.open()= :: the mark moves the machine IDLE → RUNNING (=subsystems/typology/prototypes/controller.js:17=), sets =status.$transient=, and every listener hears it: the parent's =control.controlled=, the =/status= route.
- reactivity is wired by the parent :: =shard.nano.atom(status.$transient)= on =/status= sits in =resolution.expose= (=lifecycle/resolve.js:93=): owed to the aperture, not to time.

** lifecycle/process.js

What every process does, whatever its type.

#+BEGIN_SRC js
// systems/runtime/lifecycle/process.js
import { control } from "@vivalence/typology";

export const seal = async (die, next) => {
  try {
    await next();
  } catch (error) {
    die.controller.stdout.fault(error);
  } finally {
    die.controller.stdout.close();
  }
};

export const exit = async (die, next) => {
  await next();
  Deno.exit(die.controller.status.is("STOPPED") ? 0 : 1);
};

export const effect = async (die) => {
  die.controller.stdout.open();
  await control.hold(die.controller);
};

export const settle = async (processes, next) => {
  try {
    await Promise.all(processes.map((process) => control.controlled(process.controller)));
    await next();
  } finally {
    await Promise.all(processes.map((process) => process.controller.kill(process.controller.status.is("IDLE") ? "SIGKILL" : "SIGTERM")));
    await Promise.all(processes.map((process) => process.execution));
  }
};
#+END_SRC

- =seal= first :: fault and close run inside the carry, so =exit= reads the settled status: 0 on a clean stop, 1 on a fault.
- =settle= waits on the rows it was HANDED, never on a query :: a child that fails at boot has settled and left the repository before the parent asks; a query would find only the healthy ones and the failure would pass unseen.
- SIGKILL to a child still IDLE :: the machine has no =stop= from IDLE; SIGTERM to a booting child is dropped and the parent waits forever.

** lifecycle/runtime/population.js

The parent births its children: the die, the subject, the row. beef: /"no i dont like this abstraction. wrong place, wrong percpective"/ on the =children= bag; /"i think we'd do better witha dedicated population.children function or resolution.process."/

#+BEGIN_SRC js
// systems/runtime/lifecycle/runtime/population.js
import paladin from "@vivalence/paladin";
import { Aperture, steer } from "@vivalence/typology";
import { Daemon } from "../../prototypes/index.js";
import { sets } from "../../entities/index.ts";
import { settle } from "../process.js";

export const datamap = async (die, next) => {
  const citizen = await paladin.ledger.registry.accio(die.runtime.instance.datamap);
  die.runtime.datamap = await citizen.provider(citizen, [sets.transient.process]);
  die.runtime.entities = die.runtime.datamap.entities;
  await next();
  await die.runtime.datamap.disintegrate();
};

export const services = (run) => async (die, next) => {
  const processes = await die.runtime.datamap.shard.scope(() =>
    Promise.all(
      die.runtime.instance.services.map(async (query) => {
        const mask = await paladin.ledger.registry.accio(query);
        const controller = die.controller.branch(mask.mount.absolute);
        const service = { manifest: mask.manifest, aperture: new Aperture() };
        const execution = steer.dispatch.execute(run, { controller, mask, service });
        return die.runtime.entities.process.controlled({ type: "service", slug: mask.manifest.slug, mask, controller, execution });
      }),
    ),
  );
  await settle(processes, next);
};

export const daemons = (run) => async (die, next) => {
  const processes = await die.runtime.datamap.shard.scope(() =>
    Promise.all(
      die.runtime.instance.daemons.map((mask) => {
        const controller = die.controller.branch(mask.mount.absolute);
        const daemon = new Daemon({ manifest: mask.manifest, mount: mask.mount, url: mask.url, attach: mask.attach });
        const execution = steer.dispatch.execute(run, { controller, mask, daemon });
        return die.runtime.entities.process.controlled({ type: "daemon", slug: mask.manifest.slug, mask, controller, execution });
      }),
    ),
  );
  await settle(processes, next);
};
#+END_SRC

- the run arrives as an argument :: =population.daemons(daemon)= in =run/runtime.js=. =lifecycle/= never imports =run/=.
- the repository is the datamap's :: the provider hands a repository per descriptor (=commons/datamaps/libsql/libsql.viva.js:62=). =process= sits in =sets.transient=, so =entities.process= exists once the datamap does. No =new ProcessRepository=.
- one repository per datamap :: the descriptor's type is the key, and =mode= · =daemon= are taken by the persistent entities. The process type is a column: =find({ type: "daemon" })=.

| measure                                                  | value                      |
|----------------------------------------------------------+----------------------------|
| =orm.em.getRepository(ProcessEntity)= class              | =ProcessRepository=        |
| the same instance on every call                          | yes                        |
| a fork's =getRepository=                                  | another instance, 0 rows   |
| =MikroORM.init=, virtual entities only, ms               | 25                         |
| tables                                                   | 0                          |
| write outside a context                                  | THROWS                     |

** lifecycle/daemon/population.js

#+BEGIN_SRC js
// systems/runtime/lifecycle/daemon/population.js
export const core = async (die, next) => {
  die.daemon.register = await paladin.ledger.registry.wire(die.mask);
  die.daemon.domain = die.daemon.register.domain;
  die.daemon.instance = collate([sets.kernel, sets.userspace, sets.transient, die.daemon.domain.entities]);
  await next();
};

export const datamap = async (die, next) => {
  const { register, instance } = die.daemon;
  die.daemon.datamap = await register.datamap.provider(register.datamap, instance.entities, instance.subscribers);
  die.daemon.entities = die.daemon.datamap.entities;
  await next();
  await die.daemon.datamap.disintegrate();
};

export const modes = (run) => async (die, next) => {
  const processes = await die.daemon.datamap.shard.scope(() =>
    Promise.all(
      die.daemon.register.kernel.map((mask) => {
        const controller = die.controller.branch(mask.mount.absolute);
        const mode = new Mode(mask);
        const execution = steer.dispatch.execute(run, { controller, mask, mode });
        return die.daemon.entities.process.controlled({ type: "mode", slug: `${mask.manifest.type}/${mask.manifest.slug}`, mask, controller, execution });
      }),
    ),
  );
  await settle(processes, next);
};
#+END_SRC

The rest of =lifecycle/daemon/= · =lifecycle/service/= · =lifecycle/mode/= is today's =daemon/lifecycle/*= · =daemon/aperture/*= · =daemon/traits/*= with =daemonDie.good.X= → =die.daemon.X=, each as =(die, next)=. Not sketched.

** entities/index.ts

#+BEGIN_SRC js
// systems/runtime/entities/index.ts
export * from "@vivalence/typology/entities";

export const sets = {
  lighthouse: { identity, daemon },
  kernel: { user, mode, literal, symbol },
  userspace: { intent, thread, turn, buffer },
  transient: { activity, process },
};
#+END_SRC

** entities/transient/Process.ts

Just mikro. beef: /"any reason were keeping this out of mikro?? mirko offer features for this. lets use 'just mikro'!"/

#+BEGIN_SRC js
// systems/runtime/entities/transient/Process.ts
import { types } from "@mikro-orm/core";
import { VirtualEntity, VirtualRepository, VirtualSchema } from "@vivalence/typology/entities";

export class ProcessEntity extends VirtualEntity {
  type = "";
  slug = "";
  mask = {};
  controller = null;
  execution = null;

  get status() {
    return this.controller?.status.reflection.code ?? null;
  }
}

export class ProcessRepository extends VirtualRepository {
  async controlled(data) {
    const process = await this.create(data);
    data.execution.then(() => this.remove({ id: process.id }));
    return process;
  }
}

export const ProcessSchema = new VirtualSchema({
  class: ProcessEntity,
  repository: () => ProcessRepository,
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    mask: { type: types.json },
    controller: { type: "any", persist: false, hidden: true },
    execution: { type: "any", persist: false, hidden: true },
    status: { type: types.string, persist: false, getter: true },
  },
});

export default { type: "process", schema: ProcessSchema, entity: ProcessEntity, repository: ProcessRepository };
#+END_SRC

#+BEGIN_SRC json
{
  "id": "019a3f0e-6c1b-7c2e-9d51-4a0f6f0f2b11",
  "createdAt": "2026-09-29T14:01:25.867Z",
  "updatedAt": "2026-09-29T14:01:25.867Z",
  "type": "daemon",
  "slug": "chess",
  "mask": { "manifest": { "type": "daemon", "slug": "chess" } },
  "status": "RUNNING"
}
#+END_SRC

| measure                                                        | value                                  |
|----------------------------------------------------------------+----------------------------------------|
| =create({ …, controller, execution })= keeps both by identity  | yes                                    |
| =JSON.stringify(process)= carries =controller= · =execution=   | no (=hidden=)                          |
| =JSON.stringify(process)= carries =status=                     | yes, live (=getter=)                   |
| =find({ status: "RUNNING" })=                                  | =[]=: a getter is no own key           |
| =find({ type: "daemon" })= · nested where on =mask.manifest=   | ok                                     |
| =controlled= twice on one id                                   | throws =ProcessEntity <id> is held=    |
| once-guard setters (=#controller=) as mikro props: =updateOne= | THROWS =a process is controlled once=  |
| the datamap strip names =controller= · =execution=             | yes, as columns of type =any=          |

- plain fields, no guard :: =assign= writes every prop back on update and trips a once-guard setter. Once-ness is =create= refusing a held id.
- the names go on the wire, the values never :: =/datamap= lists =controller= · =execution= as columns.

''')

section("** prototypes/\n", "** gestalten/\n", r'''** prototypes/

#+BEGIN_SRC js
// systems/runtime/prototypes/index.js
export * from "./runtime.js";
export * from "./daemon.js";
#+END_SRC

#+BEGIN_SRC js
// systems/runtime/prototypes/runtime.js
import { Aperture, Vector } from "@vivalence/typology";

export class Runtime {
  instance = null;
  datamap = null;
  entities = {};
  aperture = new Aperture();
  twitch = new Vector();
  server = null;
  latch = null;
  constructor(fields) {
    Object.assign(this, fields);
  }
}
#+END_SRC

=prototypes/daemon.js= is today's =systems/runtime/daemon/daemon.js=, moved.

''')

swap("** gestalten/belt/control.js \n@beef go land.\n", "** gestalten/belt/control.js — LANDED\n")
swap(
    "- =hold= is not =controller.settled= :: SIGTERM gives STOPPING, settled needs the effect to return.\n",
    "- =hold= is not =controller.settled= :: SIGTERM gives STOPPING, settled needs the effect to return.\n- typology =tests/= before and after :: =131 passed (562 steps) | 0 failed=. No typology test names =control= yet.\n",
)

section("* measured\n", "* milestones\n", r'''* measured

Sandbox =.ikiro/quests/m74-the-boot-vector/sandbox/= (=lib.js= · =structure.test.js=, =6 passed | 0 failed=): real =Controller= · =Span= · =Vector= · =steer= · =control= · mikro, fake masks; 1 service, 2 daemons, 3 modes. The subject is born on the die, the population is dedicated per child type, the repository is the datamap's own.

| case                                                                    | result |
|-------------------------------------------------------------------------+--------|
| three levels boot, =entities.process= holds RUNNING                     | ok     |
| span =/runtime/test/daemon/chess=                                       | ok     |
| span =/runtime/test/attached/process/service/lighthouse/multiplayer=    | ok     |
| SIGSTOP one daemon: its modes PAUSED, sibling RUNNING                   | ok     |
| SIGCONT resumes                                                         | ok     |
| a daemon stops on its own: leaves the repository                        | ok     |
| a daemon refuses at boot: siblings stop, FAILED, exit 1                 | ok     |
| a mode refuses at boot: fails up two levels                             | ok     |
| =controlled({ … })= twice on one id                                     | throws |

#+BEGIN_EXAMPLE
/runtime/test serve-
/runtime/test/attached/process/service/lighthouse/multiplayer aperture-      ← the service unwinds before the daemons
/runtime/test/daemon/chess apertures-
/runtime/test/daemon/education apertures-
/runtime/test/daemon/chess/mode/game/board traits-
/runtime/test/daemon/education/mode/teacher/iroh traits-
/runtime/test/daemon/chess/mode/game/puzzles traits-
/runtime/test/daemon/education core-
/runtime/test/daemon/chess core-
/runtime/test registry-
#+END_EXAMPLE

A root SIGTERM fans out to every controller at once (=subsystems/typology/prototypes/controller.js:40=): lifecycles finish in order, children unwind together.

* QUESTIONED

beef's questions, as posited:

- /"is this really the entire variance of the affect?"/ · /"do we need any runtime specific wiring at all here???"/ :: measured in =** the effect=: zero variance over four runs, one candidate, the runtime's patrol. One =process.effect=.
- /"we might just export a control affect shard"/ :: the effect reads only =die.controller=. Seat: =lifecycle.process.effect= (sketched) or typology =control.affect= beside =hold=.
- /"any reason to use a datamap service?"/ :: for: one ORM config (=loadStrategy=, =commons/datamaps/libsql/libsql.viva.js:22=), one surface (=entities= · =shard.scope= · =introspect= · =disintegrate=), =entities.process= handed by the provider's own loop, and the instance already names its datamap (=commons/instances/hello-world/instance.viva.js:6=). Against: the provider seats a db FILE and a migrations directory and runs the migrator (=libsql.viva.js:41-52=); the runtime's ORM holds 0 tables and the instance's =datamap= slot arrives without a =mountpoint=. The sketch calls the provider; the provider needs a seatless mode (no file, no migrator) that does not exist.
- /"what is disintegrate??"/ :: the provider's own close, =disintegrate: () => orm.close()= (=libsql.viva.js:91=), called today from =daemon/die.js:59=. A Wafer-era word on a registry contract; renaming it touches every datamap provider.
- the seat of the child population :: =population.daemons= (sketched; the birth sits in =lifecycle/populate.js:20= today) or =resolution.processes= (the boot sits in =Die.resolve=, =die.js:22=, today).

Open from before:

- teardown order :: fan-out kept and order given up, or a parent kills its children only in its own teardown half.
- abort during boot :: no lifecycle reads =die.controller.abort.signal=; a killed child boots fully, then unwinds.
- machine :: ~stop: { IDLE: "STOPPED" }~ in typology, or SIGKILL from outside as now.
- =settle= :: three callers, one helper; its name, and its seat in =lifecycle/process.js=.
- =lifecycle/process.js= :: its name.
- =ActivityEntity= is the peer :: it keeps =#controller= private behind a once-guard (=daemon/entities/transient/Activity.ts:53=) and is built by hand (=daemon/lifecycle/population.js:71=). Just mikro applies to it the same way.
- =Stdin= :: runtime =prototypes/= or typology beside =Controller=; =Controller.kill= taking it.
- =entities= twice in typology :: =schematics/entities/= exists.
- =controlled= · =hold= :: /"too thin"/, one listener, two predicates.
- the pause gate :: the 503 on a paused daemon's aperture has no seat.
- the watchdog :: =die.js:64= patrols every 60 s; the effect now only holds.
- =bak.belt/= :: not read.

Settled by measurement:

- one process repository per datamap :: the provider keys repositories by descriptor type; =type= is a column.
- =status= on the wire :: a getter prop serializes it live.
- the =children= bag :: cut.

''')

swap("- [ ] =belt.control=\n", "- [x] =belt.control=\n")

if text.count("#+BEGIN_SRC") != text.count("#+END_SRC") or text.count("#+BEGIN_EXAMPLE") != text.count("#+END_EXAMPLE"):
    sys.exit("BLOCK COUNT MISMATCH")
path.write_text(text)
print("written", len(before.splitlines()), "→", len(text.splitlines()), "lines")
