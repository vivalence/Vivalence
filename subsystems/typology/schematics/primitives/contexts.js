import { v } from "../v.js";
import { Mountpoint } from "./instance.js";
import { Hallucination, Policy, Turn } from "./hallucination.js";

export const input = { input: v.unknown().desc("The step's payload, request.body. Example: { text: 'ciao' }") };
export const output = { output: v.unknown().optional().desc("The step's result, response.body; set by the effect. Example: { id: 42 }") };
export const request = { request: v.unknown().desc("is.Request — { body, url, method, raw? }") };
export const response = { response: v.unknown().desc("is.Response — { body, status, headers }") };
export const params = { params: v.record(v.string(), v.string()).desc("Path parameters matched off the signal. Example: { slug: 'dojo' }") };
export const steps = { steps: v.array(v.unknown()).desc("The matched trajectory, root first") };
export const signal = { signal: v.unknown().desc("The Signal that fired. Example: new Signal('/dialogue/render')") };

export const entities = { entities: v.record(v.string(), v.unknown()).desc("The host's repositories by entity name. Example: { note, mode } on the runtime; { literal, em, buffer } on a daemon") };
export const call = { call: v.unknown().optional().desc("The host's aperture as a callable object, shape.object(aperture). Example: ctx.call.rules.position({ fen })") };
export const cortex = { cortex: v.unknown().optional().desc("The host's Cortex, a Pool of faculties. Example: ctx.cortex.findOne({ type: 'dialogue', tune: 'fast', via: 'stream' })") };
export const modes = { modes: v.record(v.string(), v.record(v.string(), v.unknown())).desc("Sibling modes on the host, modes.<type>.<slug>. Example: ctx.modes.game.dojo") };
export const providers = { providers: v.record(v.string(), v.unknown()).desc("Live providers on the host by slug — a service's interface. Example: ctx.providers.nlp") };
export const statics = { statics: v.unknown().optional().desc("The host's declared statics. Example: { language: 'it' }") };
export const domain = { domain: v.unknown().optional().desc("The host's domain module, if any") };
export const controller = { controller: v.unknown().desc("is.Controller — the die's: stdin (a Vector of the four SIGNALS), stdout (the Span), abort, status, children. Example: await ctx.controller.kill('SIGTERM', 'bye')") };
export const mountpoint = { mountpoint: Mountpoint.desc("The host's data directory on disk. Example: '/viva/instances/chess/mountpoint/daemon_chess' · '/viva/instances/chess/mountpoint' on the runtime") };
export const reference = { reference: v.unknown().desc("is.Path — the host's computed reference, /<type>/<slug>. Example: new Path('/daemon/chess') · new Path('/runtime/runtime') on the runtime") };
export const attach = { attach: v.unknown().desc("is.Url — where the runtime serves views and files by row, remote + /attached; a mode mints a File's url off it. Example: ctx.attach.branch('/file/01a0856f-425f-72b8-b36f-decc1bb2050e').absolute") };

export const mode = { mode: v.unknown().desc("The live Mode the step runs in. Example: ctx.mode.id · ctx.mode.application.buffer") };
export const user = { user: v.unknown().desc("The authenticated user, lighthouse-signed. Example: { id: 'u1', roles: ['player'] }") };
export const lighthouse = { lighthouse: v.unknown().desc("The Lighthouse that signed this request") };
export const service = { service: v.unknown().desc("The live Service a tool branch belongs to") };
export const mask = { mask: v.unknown().desc("The service's record mask, { module, statics?, secrets? }") };

export const thread = { thread: v.unknown().desc("The Thread this exchange belongs to. Example: { id: 't9', mode: 7 }") };
export const turn = { turn: Turn.desc("The user Turn chained for this request") };
export const hallucination = { hallucination: v.union([Hallucination.dialogue, Hallucination.verbatim, Hallucination.speech, Hallucination.choice]).desc("The request under construction, cortex.hallucinate.<type>.<via>(ctx.hallucination)") };
export const policy = { policy: v.union([Policy.dialogue, Policy.verbatim, Policy.speech, Policy.choice]).desc("The record's policy, lifted off the hallucination") };
export const tools = { tools: v.unknown().desc("The armed Vector the model may call, never domain.tools") };
export const intelligent = { intelligent: v.boolean().desc("The mode's harness.intelligent flag, lifted") };
export const vocal = { vocal: v.boolean().desc("The mode's harness.vocal flag, lifted") };
export const activity = { activity: v.unknown().desc("The Activity row this exchange is written to") };
export const screen = { screen: v.unknown().desc("A guide harness's current screen. Example: { id: 'intro', fields: [] }") };

export const pool = { pool: v.unknown().desc("The emitter's Pool; yield into it. Example: ctx.pool.add(literal)") };
export const scope = { scope: v.record(v.string(), v.unknown()).desc("The datamap scope narrowing reads and stamping writes. Example: { user: 'u1' }") };

export const shell = { shell: v.unknown().desc("The shell Vector this line was invoked on — how the system (unix, macos) reaches viva; ctx.call and the flag check walk it. Example: steer.dispatch.traverse(ctx.shell, new Signal(['instance', 'doctor']))") };
export const upgrade = { upgrade: v.unknown().desc("The shell's escalations, each boots the client on a child controller and returns nothing: repl · chrome. Example: ctx.upgrade.chrome()") };
export const instance = { instance: v.unknown().optional().desc("The mounted paladin instance when the cwd's instance.viva.json, --instance or this shell's session names one; absent otherwise — a verb that needs one mounts it itself. Example: ctx.instance.runtime.statics.remote → 'http://localhost:2501'") };
export const flags = { flags: v.array(v.string()).desc("The flag labels of the vector this line ran on, listed by help: the shell's own on the shell, none on the repl. Example: ['--json', '--env=./environment/.env', '--instance=<slug|path>']") };
export const view = { view: v.unknown().desc("The box over this ctx's surface, view(surface): { interactive, stdin, json, width(), painted, emit(kind, props), hold(kind, props) } — a verb names a KIND and data, the surface picks the component and the box; plain writes at the terminal's width (json under --json), pipes writes a json line and refuses a hold, tty paints the dock and holds over the cover. Example: await ctx.view.emit('report', { blocks })") };
export const repl = { repl: v.unknown().desc("The terminal's Repl this line was dispatched on — as ctx.shell is to the shell. Its commands hold the client's, the hosted modes', the terminal's, every mounted mode's under /mode/<type>/<slug> and /mode/<slug>, and the turn streamer; rebuilt whole on every change of the runtime's mode list. Example: shape.strip(ctx.repl.commands)") };
export const client = { client: v.unknown().desc("The Client — the client die itself: controller · mask · register · instance · surface · modes · runtime · $active; a line runs on its active terminal's repl. Example: ctx.client.active.repl.dispatch('/help')") };
export const span = { span: v.unknown().desc("The Span this step tracks on — on the repl, the line's branch of the client controller's stdout; log · fault land here and the surface derives from its $history. Example: ctx.span.log('seated on probe')") };
export const runtime = { runtime: v.unknown().desc("The client's Runtime, ONE shape with the server's: manifest · slug · reference · remote · connection · call · cortex · lighthouse · entities · services · $status · daemon (the runtime as its own host); daemons derived. Example: await ctx.runtime.entities.thread.create({ mode: ctx.runtime.daemon.modes[0].id })") };
export const terminal = { terminal: v.unknown().desc("The ACTIVE terminal — the single point of contact for a mode: the row (id · user · index · traits · trait) plus mask · runtime · daemon · mode · thread · buffer. Null until one is picked. Example: ctx.terminal.mode.harness.dialogue.stream({ thread: 'th3', parts })") };
export const stream = { stream: v.unknown().desc("A verb's request for a stream the repl pumps after next() into the thread's $live. Example: ctx.stream = { packets: mode.harness.dialogue.stream({ thread, terminal, turn, parts }) }") };
export const kill = { kill: v.unknown().desc("A verb's request to stop a running activity after next(). Example: ctx.kill = ctx.terminal.thread.activity") };

export const optional = (set) => Object.fromEntries(Object.entries(set).map(([key, schema]) => [key, schema.optional()]));
export const of = (...sets) => v.object(Object.assign({}, ...sets));

export const vector = { ...input, ...output, ...request, ...response, ...params, ...steps, ...signal };
export const host = { ...entities, ...call, ...cortex, ...modes, ...providers, ...statics, ...domain, ...mountpoint, ...reference, ...attach };

export const Aperture = { ...vector, ...host, ...mode, ...optional(user) };
export const Tool = { ...vector, ...host, ...mode, ...user, ...optional(thread), ...optional(service) };
export const Harness = { ...vector, ...host, ...mode, ...user, ...thread, ...optional(turn), ...hallucination, ...tools, ...controller, ...intelligent, ...vocal, ...optional(activity), ...optional(screen) };
export const Emitter = { ...vector, ...host, ...mode, ...pool, ...thread, ...optional(user) };
export const Twitch = { ...vector, ...entities, ...call, ...cortex, ...providers, ...statics, ...domain, ...mountpoint, ...reference, ...optional(scope), ...optional(mode) };
export const Service = { ...vector, ...service, ...mask, ...tools };

export const Command = { ...vector, ...view, ...flags };
export const Shell = { ...Command, ...shell, ...controller, ...optional(instance), ...upgrade };
export const Repl = { ...vector, ...client, ...controller, ...repl, ...optional(runtime), ...optional(terminal) };
export const Mode = { ...terminal };
