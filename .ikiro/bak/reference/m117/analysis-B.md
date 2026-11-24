<!-- limit: 40000 chars · m117 evidence 2026-11-07, agents opus · reference, read-only -->
# analysis B — DeepSeek Harness · OpenCode v2 · goose

Source: codeload tarballs of `deepseek-ai/deepseek-harness`, `anomalyco/opencode`, `aaif-goose/goose` at HEAD 2026-11-07, unpacked under `scratchpad/srcB/`. Paths repo-relative.

Vivalence defect found: `subsystems/typology/gestalten/belt/hallucinate.js:110-114` dispatches tool calls SERIALLY, but `harness.md` §2.5 still says `Promise.all`.

## DeepSeek Harness

Shape: 370 `package.json` under `packages/`, every capability a Cordis plugin. A profile is a stack of `cordis.patch.yml` layers: `dsh-base` 99 rows; `sdk-minimal` a complete tree on its own. Core keeps only service seams (`tools`, `systemPrompt`, `agents`, `llm`, `sessions`).

### 1 tools
- Registry `packages/core/tools/src/index.ts:99-135` `ToolsService.register(definition)`; must declare `output { schema, render }` or throws (`:131-134`). Scoped registration (`agent.ctx`) shadows global: `view()` `:198-226`, "Nearer registrations shadow farther ones".
- Shape `contracts.ts:26-104`: `name/description/parameters` + `output` + `execute(args, exec)` + `timeoutMs` + `isConcurrencySafe(args)` + `presentCall/presentResult`; `timeoutMs`/`isConcurrencySafe` "NEVER sent to the model" (`:51-54`).
- Default set (`dsh-base`): `read write edit read_image` (+`apply_patch` off) `packages/fs/tool-fs/src/index.ts:48-53` · `glob grep` · `bash`/`pwsh` · `web_search web_fetch` · `skill` · `todo_write` · `job_list job_output job_kill` · `create_goal get_goal update_goal` · `ask_user_question` · `working_directory` · `list_mcp_resources list_mcp_resource_templates read_mcp_resource` · `spawn list_subagent_models list_agents send_message wait_agent interrupt_agent` · `team_task_*` ×4 · `workflow` · `plan` ≈35. `minimal` preset arms 2: `read_image` + `bash` (`packages/bundle/web-app/presets/minimal.patch.yml:17-23,47-59`).
- MCP as native tools: `packages/mcp/mcp-client/src/tools.ts:92` `mcp__${serverName}__${rawName}`, `ctx.tools.register` (`:177`); a conflict registers none of that server's tools (`:180-184`).
- Error → model: `content: [{ type: 'text', text: \`Error: ${denialReason}\` }], isError: true` (`pipeline.ts:220-221`); abort texts canonical (`:747`, `:761`).
- Parallel: bounded rolling pool, reclassified before each start (`batch.ts:3`), default 10 (`agent-loop/src/constants.ts:6`); exclusive unless `isConcurrencySafe` true.
- PTC: `run_code` reserved (`contracts.ts:12`); executor swappable per scope (`index.ts:328`).

verdict: steal — (a) per-tool `concurrent` predicate off the wire, serial default; (b) a tool declares output schema + render.
```js
new Vector().open({ nature: "/fs/read", valence, input, output, concurrent: () => true }, read)
```

### 2 identity
- 1 row: `'You are an AI agent powered by DeepSeek Harness.'` (`system-prompt/src/index.ts:455-460`), order `HARNESS_IDENTITY: -1000` (`:137`); `includeHarnessIdentity: false` turns it off.
- `personaPrefix` order 0, `personaSuffix` 10200 (`:191-199,461-470`); `dsh-base` `personaPrefix: ''` (`bundle/base/cordis.patch.yml:521-526`); headless `You are a coding agent powered by the {{model}} model.` (`bundle/headless/cordis.patch.yml:9-12`).
- `persona` plugin `complete: true`: "Make the prefix the complete system prompt, suppressing the suffix and every other section" (`preset/persona/src/index.ts:42-43`).

verdict: steal — a `complete` flag on the mode primer.
```js
// harnessed.js priming(): if (ctx.mode.primer?.complete) return ctx.mode.primer;
```

### 3 instructions
- `AGENTS.md`, `CLAUDE.md` + `.local.md` overlays, root marker `.git` (`context/agent-instructions/src/config.ts:11-14`); `$DSH_HOME/AGENTS.md` (`render.ts:122,131`); `maxBytes: 65536` (`cordis.patch.yml:310`), per source 1 MiB.
- Lazy nested: "successful fs tool touches project nested, changed, and removed instructions into the inbox" (`agent-instructions/src/index.ts:4-5`).
- Skills: `.dsh/skills` › `.agents/skills` › `~/.dsh/skills` › `~/.agents/skills` (`skill-filesystem/src/index.ts:256-264`); catalog as `catalog` context; `skill` tool loads (`tool-skill/src/index.ts:30-43`).
- Precedence: numeric `SECTION_ORDERS`, 30 slots (`system-prompt/src/index.ts:136-172`), ties by name (`:253-255`).

verdict: already (`shape/primer.js:31,45`). skip AGENTS.md discovery in root.

### 4 world model
- Two channels: a *section* = cached system prompt; a *context* = "Dynamic model context materialized as a durable user-role snapshot" (`system-prompt/src/index.ts:78-90`). `CONTEXT_ORDERS`: cwd 100 · sandbox 110 · approval 115 · subagent 120 · harness-source 200 · web 210 (`:177-185`): "Process-specific paths and endpoints stay out of the cached system prompt" (`:182`).
- cwd `working-directory:current` (`session/working-directory/src/index.ts:90-95`); time via `agent/pre-step` appends a user message only after `refreshIntervalMs` (`context/time-context/src/index.ts:199-240`).
- No git-status / tree index.

verdict: steal — volatile facts as a user-role context turn, not the last system key (`summarizing` `harnessed.js:199-202` rewrites system bytes after the mark).
```js
// primer node { nature: "thread", load: "context" } → record.contexts
// primed(): turns.push({ role: "user", parts: [{ type: "text", text: contexts.join("\n\n") }], meta: { source: "context" } })
```

### 5 loop
- Turn → step `agent-loop/src/agent.ts:327-430`. No step cap (grep 0 hits outside tests); ends when inbox empty. Repeat-tool reminder advisory `[3, 5, 8]` (`guard/repeat-tool-reminder/src/index.ts:53`); `timeout-policy` enforces `timeoutMs`.
- Abort: one `AbortController` per turn (`agent.ts:286`), `throwIfAborted` between steps (`:344-348`); codes `ABORTED` / `ABORTED_BEFORE_DISPATCH` (`contracts.ts:264-267`).
- Retry: "Each scheduled retry is durable before its cancellable wait" (`llm-retry/src/index.ts:2-3`, `cancellableDelay` `:83`).
- Hooks: `agent/pre-step` · `agent/turn-stopping` · `tools/pre-execute` · `tools/execute` · `tools/post-execute` (`pipeline.ts:199,299,487`).

verdict: steal — abortable backoff (`hallucinate.js:61-73` is not).
```js
await new Promise((r, x) => { const t = setTimeout(r, delay); signal.addEventListener("abort", () => (clearTimeout(t), x(signal.reason)), { once: true }) })
```

### 6 context economy
- `compaction` seam: "replace a history range with one summary node" (`compaction/compaction/src/index.ts:1-7`); trigger `'pressure' | 'context-overflow'`.
- `compaction-basic`: threshold 0.8 · retain 0.16 · headroom 65 536 (`config.ts:20,23,75`). Directive "delivered as the FINAL user message after the replayed conversation rather than as a distinct summarizer system prompt" (`summarizer.ts:26-33`) → reuses the cached prefix. Prior `<compacted-summary>` merged (`:66`). Tool pairs balanced (`tool-pairing.ts`).
- `compaction-tool-result-pruner`: model-free, head 4096 + tail 1024 past 8192, marker `'\n\n[... tool result middle pruned ...]\n\n'` (`config.ts:7-14`); `compaction/prune` shadow-price event (`index.ts:145-163`).
- `spill-policy` `maxInlineTokens: 12500` (`cordis.patch.yml:420-423`); `image-offload` on `IMAGE_OFFLOAD_REQUIRED`.
- Cache: session append-only; a changed system prompt committed as `in-history` system message (`agent.ts:450-460`).

verdict: steal — the pruner first, then a compaction middleware on `/dialogue`.
```js
export const pruning = ({ threshold = 8192, head = 4096, tail = 1024 } = {}) => async (ctx, next) => {
  ctx.hallucination.turns = ctx.hallucination.turns.map((turn) => clip(turn, threshold, head, tail)); await next(); };
// harness.branch("/dialogue").use(chaining).use(pruning()).use(persisting)
```

### 7 extension seam
- Core = service definitions only. Layers bundle → user profile → home → invocation, "the last write winning per row" by `id`; "A patch replaces the targeted row's whole `config`" (`cordis.patch.yml:1-13`).
- `dsh-agent-preset` mounts child plugins in the agent's scope; scoped tools/sections shadow globals (`core/tools/src/index.ts:122-123`, `system-prompt/src/index.ts:473-479`). `tools.restrict({allow, deny})` scoped-only, loud on unknown names (`core/tools/src/index.ts:162-188`). `isolate:` groups (`minimal.patch.yml:24-39`).
- Runtime self-modification `packages/extensions/`; other harnesses as subagents `subagent-claude-code`, `subagent-codex`, `subagent-acp`; ACP server `packages/acp/acp`.

verdict: already graft. steal `restrict` — graft cannot remove a root tool.
```js
for (const n of ctx.mode.module.restrict?.deny ?? []) if (!armed.trie.delete(n)) throw new Error(`restrict: unknown ${n}`)
```

### 8 gates
- Sandbox `['read-only','workspace-write','danger-full-access']` (`sandbox-policy/src/session-mode.ts:42`), bwrap/Landlock/Seatbelt. Approval `ask|never` + presets (`cordis.patch.yml:256-276`). Plan mode guidance-only (`plan/plan-mode/src/index.ts:1-7`).
- Policy told as context: "Do not refuse a required modification from this policy alone…" (`sandbox-policy/src/index.ts:62-63`).
- Decisions `allow|deny|cancel|ask` (`contracts.ts:357-361`). `ToolGuard`: "listener ordering cannot turn a denial back into permission" (`:384-391`).

verdict: steal — deny-only guard after every `use`.
```js
armed.use(async (ctx, next) => { const reason = ctx.guards?.map((g) => g(ctx)).find(Boolean); return reason ? { condition: "ERROR", output: { message: reason } } : next(); })
```

## OpenCode v2

Shape: one background server (`packages/server`) clients attach to. `packages/core/src/plugin/internal.ts:241-302` lists 57 internal plugins (38 `pre` + 19 `post`).

### 1 tools
- `Tool.Service.transform(editor => editor.add({...}))`, replayed in registration order. "The latest valid active registration for the same effective name wins" and disposal reveals the overridden (`tool/AGENTS.md:40-42`).
- Shape `{ name, options: { namespace?, codemode? }, description, input, output, execute }` (`tool/plugin/read.ts:45-52`); namespace flattens to `<namespace>_<tool>` (`AGENTS.md:34`).
- Default, 19 files in `tool/plugin/`: `read write edit patch glob grep shell webfetch websearch question skill subagent todowrite list_mcp_resources read_mcp_resource artifact_{create,read,update,delete} schedule_{create,list,pause,resume,delete} opencode session_rename session_move worktree_{create,list,remove} experimental_image_generate` ≈33.
- MCP: `namespace(server)`, `codemode` default true (`tool/mcp.ts:21-25,55-57`); "MCP refresh therefore preserves the precedence of later plugin overrides" (`AGENTS.md:45`).
- Code Mode: `codemode !== false` tools leave the native list, callable only inside the `execute` JS tool (`tool.ts:263-271`, `codemode/tool.ts:91`).
- Error: typed `ToolFailure`; "A decline with feedback … stays typed so the leaf converts it into `ToolFailure` and the model continues" (`AGENTS.md:27`).
- Output: `MAX_LINES = 2_000`, `MAX_BYTES = 50 * 1024`; overflow → retained file, path returned (`tool-output.ts:13-14,69-90`).

verdict: steal — latest registration wins + disposal reveals previous; overflow to file.
```js
if (text.length > MAX) result.output = { message: `${text.slice(0, MAX)}\n… full output: ${await paladin.spill(text)} (fs_read it)` }
```

### 2 identity
- Base 756 B: `You are an AI agent running in OpenCode, a coding agent harness.` (`session/runner/prompt/system.txt:1`). Per-model add-ons: anthropic 300 B, gpt 2 572, kimi 8 701, meta 7 853, trinity 7 684, gpt-astra 3 825 (`plugin/optimize.ts:9-36`). `IdentityPlugin` splices `# Your Model`.
- `agent.system` REPLACES base (`session/model-request.ts:116-120`). Agents = markdown under `{agent,agents}/**/*.md`, `{mode,modes}/*.md` (`config/plugin/agent.ts:23-27`).

verdict: already (`harnessed.js:46-54`). skip per-model prose.

### 3 instructions
- Global `AGENTS.md`, ancestor walk cwd → project root or home, each file watched (`config/plugin/instruction.ts:40-62,84-93`). Roots `.claude .agents .opencode` (`config/discovery.ts:82`). `read` walks up for nearby AGENTS.md (`tool/plugin/read.ts:127-139`).
- Order "most to least shared": codemode catalog → MCP → references → skills → discovery → builtins → entries (`session/context.ts:151-163`).
- Tool-conditional guidance: `if (tools.includes("shell")) instructions.push(…)` (`session/system-prompt.ts:9-27`).

verdict: steal — tool-conditional guidance (harness.md §4.1 f under R2).
```js
// primer node `requires: ["/fs/write"]`; shape.primer.load drops it unless all requires are in steer.trie.rollup(armed)
```

### 4 world model
- `Today's date: ${date}` + `<env>`: cwd, workspace root, VCS yes/no, platform, tmp (`instructions/builtins.ts:24-49`). No tree/status/open files.
- Each instruction `{ key, read, render: { initial, changed, removed } }` (`instructions/index.ts:36-50`); `changed: (_previous, date) => \`Today's date is now: ${date}\`` (`builtins.ts:30`); state per session (`session/history.ts:296-320`), deltas as synthetic messages.

verdict: steal — best of three; fixes G1.
```js
export const thread = new Vector().open({ nature: "thread", load: "delta",
  render: { initial: (s) => `[Thread] ${s}`, changed: (_p, s) => `[Thread is now] ${s}` } }, summary);
```

### 5 loop
- Step loop `session/runner/llm.ts:245-275`. Cap `agent.info.steps` (unset); at cap appends `MAX_STEPS_PROMPT`, `toolChoice: "none"`, keeps definitions "to preserve the provider's cached prefix" (`:252-270`, `runner/max-steps.ts:1-16`).
- Tools fork per `tool-call` stream event mid-stream (`session/runner/step.ts:118-130`). Abort `Fiber.interruptAll` (`:94,137-154`).
- Retry: 2 s exponential, 10 s cap, ×10, jittered, `retry-after` ≤15 min (`model-retry.ts:11-35`); no retry after output started (`step.ts:211`).

verdict: steal — at cap: tools off, definitions kept, text forced (vivalence closes `length` with no answer, `hallucinate.js:129`).
```js
if (rounds === policy.rounds - 1) request = { ...request, toolChoice: "none", turns: [...request.turns, CAPPED] }
```

### 6 context economy
- `session/compaction.ts`: `{ auto: true, keep: 15_000, precompute: false }` (`:269`); reserve 0.15 / ≥16 000 (`:128-135`); shrink `[0.85,0.7,0.5,0.35]` (`:127`). Degrade: whole → outputs clipped 2 000 → outputs removed → user only → omitted (`:141-150`). Template: Objective · Requirements · Decisions · Work State · Next Move · Relevant Files ≤15 (`:171-212`). Precompute lead 60 000 while cache ≥30 s left (`:154-162`).
- Cache: per-part hints, ≤4 breakpoints (`packages/ai/src/protocols/utils/cache.ts:29-34`).

verdict: steal — template + degrade ladder; skip precompute.

### 7 extension seam
- `[...internal.pre, ...sdk.all(), ...instance.all()]` then `internal.post`: "the instance's explicit choices win over globals" (`plugin/supervisor.ts:142-147`). Guarded, unremovable: `OpencodePlugin`, `ConfigPolicyPlugin` (`internal.ts:304-306`).
- Hook domains `aisdk session permission shell tool` (`plugin/hooks.ts:13-19`); session: `prompt context compaction generate title model.request http.request http.response retry …` (`plugin/src/effect/session.ts:185-198`); tool: `execute.before/after`; "Only tool execute.before may fail" (`hooks.ts:23`). A failed transform disables only that plugin (`plugin.ts:67,197`).

verdict: already (graft order). steal — a guarded set.
```js
for (const g of [activating, persisting]) if (!harness.carry.includes(g)) throw new Error(`HARNESSED: ${g.name} is guarded`)
```

### 8 gates
- `evaluate` = `findLast` over rulesets, default `ask` (`permission.ts:94-103`); "Configured denies still win" (`:61`); no agent → deny all (`:20`).
- Agents are permission sets: `explore` = `*:deny` + allow `shell grep glob webfetch websearch read`, `read *.env` → ask (`plugin/agent.ts:75-92`); `plan` denies edit except `~/.opencode/plan/*` (`plugin/plan.ts:38-40`). "Tool filtering is catalog visibility, not execution authorization" (`tool/AGENTS.md:55`). No OS sandbox.

verdict: steal — `findLast` rules as a mode literal.
```js
mode.module.permissions = [["*", "*", "ask"], ["/fs/read", "*", "allow"], ["/fs/read", "*.env", "ask"]]
```

## goose

Shape: every tool through `McpClientTrait` (`crates/goose/src/agents/mcp_client.rs:77-139`). Extension kinds `stdio · builtin · platform · streamable_http` (`agents/extension.rs:159-209`); `platform` = in-process structs on the same trait. Loop = ordered list of 23 `Operation`s.

### 1 tools
- Platform extensions (`platform_extensions/mod.rs:33-206`). On: analyze, apps, extensionmanager, scheduler, summon, developer, tom, skills. Off: todo, chatrecall, summarize, code_execution.
- Developer = `write edit shell tree read_image` (`developer/mod.rs:278`); no `read`. Ext manager: `search_available_extensions manage_extensions list_resources read_resource` (`ext_manager.rs:66-70`). Summon `load delegate` (`summon.rs:462,529`).
- No web tool in `platform_extensions/` or `goose-mcp/src` (`computer_control xlsx_tool docx_tool pdf_tool` + memory + visualiser).
- Naming `format!("{}__{}", self.key, tool.name)` unless unprefixed (`extension_manager/mod.rs:343-363`); `developer.shell` repaired (`:533-546`).
- Errors: `CallToolResult::error`, "The tool call could not be parsed: {parse_error}. Correct the arguments and try again." (`ops_toolcalling.rs:957-960`). Cap 200 000 chars `GOOSE_MAX_TOOL_RESPONSE_SIZE` (`large_response_handler.rs:5-10`).
- Parallel: `select_all` (`ops_toolcalling.rs:926-950`); subagents ≤5 (`state_machine_builder.rs:152-155`).

verdict: already — one wire (`shape/mcp.js:5-15` server side). steal — an MCP client → Vector (none exists).
```js
export const wire = async (client) => (await client.listTools()).tools.reduce((vector, tool) =>
  vector.open({ nature: `/${tool.name}`, valence: tool.description, input: tool.inputSchema },
    (ctx) => client.callTool({ name: tool.name, arguments: ctx.input })), new Vector());
```

### 2 identity
- `prompts/system.md` 1 232 B: `You are a general-purpose AI agent called goose, created by AAIF (Agentic AI Foundation).`; tiny 839 B. `session.system_prompt_override` replaces (`prompt_manager.rs:53-54,138-144`). Recipes = `instructions prompt extensions settings` (`recipe/mod.rs:43-71`).

verdict: already; skip recipes (a mode package bundles these).

### 3 instructions
- `.goosehints`, `AGENTS.md`, `CONTEXT_FILE_NAMES` (`hints/load_hints.rs:10-24`). Subdirectory hints from tool `path`/`command` args (`:27-60`). Extras under `# Additional Instructions:` in insertion order (`prompt_manager.rs:183-197`).
- Each active extension's MCP `instructions` rendered under `## <name>` (`system.md:21-30`; one part per extension, `ops_toolcalling.rs:705-726`).

verdict: steal — tool-owned instructions, mounted only when armed (cf. DeepSeek `tool-bash/src/index.ts:250-255`: "Cross-call guidance belongs in the prompt rather than one-call schema prose").
```js
shell.primer = "Check the exit code on every shell_run result; investigate failures before moving on."
```

### 4 world model
- Hour-truncated date "so that prompt cache can be used" (`prompt_manager.rs:202-204`).
- Per-turn `<turn-context>` user message: time, cwd, extension parts, turn budget; "only the most recent block is current"; skipped under 32 000 context (`agents/moim.rs:5-22,93-128`). Each extension contributes via `get_moim` (`mcp_client.rs:139`). `<turn-budget>{turns_taken}/{max_turns} used</turn-budget>` past half (`ops_maxturns.rs:20-27`).

verdict: steal — visible round budget + per-tool-package `moim`.
```js
if (rounds * 2 >= policy.rounds) request.turns.push(contextTurn(`<round-budget>${rounds}/${policy.rounds} used</round-budget>`))
```

### 5 loop
- `StateMachine::new(steps, cancel)`: approval → pre-hook → skill → recipe → execution → remaining → unhandled → subagent → steer → bang-shell → relevance → compaction → tool-pair → doctor → project → retry → empty → stop-hook → exit-on-error → max-turns (`state_machine_builder.rs:123-196`); `extra_operations` appended. `GOOSE_MAX_TURNS` 1000 (`config/base.rs:1339-1341`). One `CancellationToken` per dispatch (`ops_toolcalling.rs:931`).

verdict: already — `use` chain + graft.

### 6 context economy
- Threshold 0.8 (`goose-context-management/src/lib.rs:32`). Tool-pair summaries: cutoff `(3 * effective_limit / 20_000).clamp(10, 500)`, last N protected (`:414-424`, `ops_tool_pair_compaction.rs:1,80`). Summarized messages hidden by visibility metadata, not deleted (`context_mgmt/mod.rs:109`).

verdict: steal — hide, never delete.
```js
history(where, opts?) { return this.find({ ...where, $not: { meta: { hidden: true } } }, { ...opts, orderBy: { createdAt: "ASC" } }) }
```

### 7 extension seam
- MCP the only wire. Model can enable/disable extensions mid-session (`manage_extensions`). Open Plugins hooks `hooks/hooks.json`: `PreToolUse PreToolUseResult PostToolUse PostToolUseFailure SessionStart SessionEnd UserPromptSubmit BeforeReadFile AfterFileEdit BeforeShellExecution AfterShellExecution Stop`; `command` only; exit 2 = deny (`hooks/mod.rs:1-25,66-83,897-905`). ACP `crates/goose/src/acp`.

verdict: skip command hooks. Self-grafting via `manage_extensions` conflicts with R2 — unruled.

### 8 gates
- `GooseMode` Auto (default) · Approve · SmartApprove · Chat (`goose_mode.rs:22-33`). SmartApprove: `read_only_hint` auto-allows, else LLM judge (`permission_inspector.rs:58,162-229`). No OS sandbox (Flatpak detection only).

verdict: steal — `readOnly` on the edge as the auto-allow key; skip the LLM judge.

## comparative — the three side by side

| axis | DeepSeek | OpenCode | goose | best-of-three for a near-empty root |
|---|---|---|---|---|
| 1 default tools | ~35 (`minimal`: 2) | ~33 | developer 5 + ~10 | DeepSeek `minimal`: 2 |
| 1 MCP name | `mcp__srv__tool` | `srv_tool` | `ext__tool` | `mcp_<slug>_<tool>` |
| 1 parallel | pool 10, opt-in | fork per stream event | `select_all` | opt-in |
| 1 output cap | 8192 prune / 12500 tok spill | 2000 rows / 50 KiB → file | 200 000 chars | → file |
| 2 identity bytes | 51 + prefix | 756 + ≤8701 | 1232 | DeepSeek + `complete` |
| 2 override | `complete: true` | `agent.system` | `system_prompt_override` | replace |
| 3 files | AGENTS.md · CLAUDE.md · .local | AGENTS.md | .goosehints · AGENTS.md | none in root |
| 3 lazy nested | fs-touch → inbox | read → walk up | tool args → dirs | fs-touch |
| 3 order | numeric ×30 | shared → volatile | IndexMap | numeric |
| 4 volatile channel | user-role context | delta synthetic | `<turn-context>` | OpenCode delta |
| 5 step cap | none | `agent.steps` (unset) | 1000 | rounds 10 + budget |
| 5 at cap | — | `toolChoice: none` | stop | OpenCode |
| 5 retry | provider, abortable | 2s→10s ×10, ≤15m | `RetryOperation` | OpenCode, abortable |
| 6 trigger | 0.8 | 0.15 / 16k reserve | 0.8 | 0.8 |
| 6 tool-result | 4096 + 1024 | clip 2000 | pairs `clamp(10,500)` | DeepSeek pruner |
| 6 cache | append-only `in-history` | ≤4 hints | hour date | append-only |
| 7 unit | Cordis row (99) | plugin (57) | MCP ext (4 kinds) | Vector graft |
| 7 override | last patch by `id` | latest registration; dispose reveals | config | latest + `restrict` |
| 7 guarded | — | 2 | — | guarded set |
| 8 modes | read-only · workspace-write · danger | rules `findLast` | auto · approve · smart · chat | OpenCode rules |
| 8 sandbox | bwrap · Landlock · Seatbelt | none | none | paladin |
| 8 deny-only | `ToolGuard` | `execute.before` | exit 2 | `ToolGuard` |

## steal list — ranked, ≤10

1. Delta world sections — OpenCode `instructions/builtins.ts:24-49` + `instructions/index.ts:36-50`. Fixes G1 (`harnessed.js:199-213`).
```js
const prev = ctx.thread.trait.PRIMED?.[key];
if (prev !== now) ctx.hallucination.turns.push(contextTurn(prev == null ? initial(now) : changed(prev, now)));
```
2. Tool-result pruner, model-free — DeepSeek `compaction-tool-result-pruner/src/config.ts:7-14`.
```js
const clip = (text, { threshold = 8192, head = 4096, tail = 1024 } = {}) =>
  text.length <= threshold ? text : `${text.slice(0, head)}\n\n[... tool result middle pruned ...]\n\n${text.slice(-tail)}`;
```
3. MCP client → Vector — goose `mcp_client.rs:77-139`, DeepSeek `mcp-client/src/tools.ts:92`. Web/browser reach a near-empty root this way.
```js
// arming(): for (const [slug, client] of Object.entries(ctx.mcp ?? {})) armed.branch(`/mcp/${slug}`).graft(await shape.wire(client))
```
4. Tool-owned primer + tool-conditional guidance — goose `system.md:21-30`, DeepSeek `tool-bash/src/index.ts:250-255`, OpenCode `session/system-prompt.ts:9-27`.
```js
for (const imported of imports) if (imported.primer) primer.open(slugOf(imported), imported.primer)
```
5. `restrict` + deny-only guard — DeepSeek `core/tools/src/index.ts:162-188`, `contracts.ts:384-391`.
6. Round cap: tools off, definitions kept, text forced — OpenCode `session/runner/llm.ts:252-270`.
7. Opt-in concurrency — DeepSeek `contracts.ts:60-82`, `batch.ts:3`.
```js
const [free, bound] = partition(calls, (c) => edgeOf(c).concurrent?.(c.input) === true);
```
8. Overflow to file, path in message — OpenCode `tool-output.ts:13-14,69-90`.
9. Visible round budget — goose `ops_maxturns.rs:20-27`.
10. `complete` primer + guarded middlewares — DeepSeek `preset/persona/src/index.ts:42-43`, OpenCode `plugin/internal.ts:304-306`.
