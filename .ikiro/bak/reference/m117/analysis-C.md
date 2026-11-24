<!-- limit: 60000 chars · m117 evidence 2026-11-07, agents opus · reference, read-only -->
# analysis C — Claude Code · Codex CLI · Gemini CLI

Sources were read on 2026-11-07. Codex (`openai/codex` HEAD) and Gemini CLI (`google-gemini/gemini-cli` HEAD) were read from raw source, saved under `scratchpad/rawC/{codex,gemini}/` and `scratchpad/raw/`. The Claude Code core is closed. For it I read the public docs at code.claude.com/docs/en/{memory,hooks,permissions,tools-reference,sandboxing,context-window,prompt-caching}, plus the public repo `anthropics/claude-code` `mods/` (5 mods and `mods/types/claude-code.d.ts`, 520 694 bytes: the declaration file of the core's function-hook API). Paths below are repo-relative: Codex paths sit under `codex-rs/`, Gemini paths under `packages/core/src/`.
Labels used below: **[docs]** = a claim taken from the docs only. **[d.ts]** = a claim taken from the published type declarations. **[unverified]** = a claim no source or doc I read backs.

Vivalence baseline: `systems/runtime/subjects/mode/traits/harnessed.js` (HARNESSED, 263 rows) and `subsystems/typology/gestalten/belt/hallucinate.js` (the loop). One correction to `harness.md` §2.5: dispatch is now SERIAL. The code is `hallucinate.js:110-113` `for (const call of …) settled.push(await settle(policy, call))`, with a beef comment `:109` saying "serial: a round's calls share one em fork". harness.md still says `Promise.all`.

## Claude Code

### 1 tools
- The [docs] table at `tools-reference` lists **56 tool rows**. That count includes `TaskOutput` (removed v2.1.277) and tools the model only gets on some platforms or behind flags. Core file/shell/web set: `Read Write Edit NotebookEdit Bash PowerShell Monitor WebFetch WebSearch`. `Glob` and `Grep` are "Absent by default on macOS, Linux, and WSL … Claude searches with `find` and `grep` through the Bash tool instead" (tools-reference:313).
- Meta tools: `Agent Skill ToolSearch AskUserQuestion EnterPlanMode ExitPlanMode Task* TodoWrite SendMessage ListAgents Workflow Cron* LSP ListMcpResourcesTool ReadMcpResourceTool WaitForMcpServers`.
- Deferred tools: with tool search on (the default on supported models), MCP and other tools are listed by name only. `ToolSearch` loads their schemas. "Claude Code keeps the tool list from the conversation's first request for the whole conversation" (prompt-caching, "Tools deferred").
- Result caps [docs]:
  - Bash output is inline up to about 30 000 chars (`BASH_MAX_OUTPUT_LENGTH`, ceiling 150 000). Past that the result is a file path plus a preview of the first 2 000 chars (tools-reference:172-177).
  - Read returns at most 25 000 tokens per call and refuses a whole file over 256 KB unless called with `allow_large` (tools-reference:535).
  - Glob is capped at 100 files and sets a truncation flag (:327).
- Plugin-registered tool [d.ts]: `$.tool.register({ name, description, inputSchema })` creates `mcp__<plugin>__<name>`, served by a `tool.call` hook. "a call no hook answers fails" (`claude-code.d.ts:~2620-2633`).
- Errors and parallel calls: not documented on the pages I read, so the error-to-model shape is **[unverified]**. The `PostToolBatch` hook event suggests batched parallel calls.

verdict: **already** for fs/shell. vivalence arms `fs_tree fs_find fs_read fs_write fs_stat fs_move fs_delete shell_run` at `harnessed.js:82-83`, from `subsystems/paladin/gestalten/tools/fs.js:39-192` and `shell.js:23`. **steal** the overflow rule: oversized output is spilled to a file and the model gets a preview plus the path.
```js
// subsystems/paladin/gestalten/tools/shell.js
const spill = async (ctx, text, cap = 30_000) => text.length <= cap ? { message: text }
  : { message: `${text.slice(0, 2_000)}\n…[${text.length} chars] full output: ${await ctx.paladin.fs.temp(text)} — fs_read it`, };
```

### 2 identity
- The persona text is closed. Public leaks and analyses report "You are Claude Code, Anthropic's official CLI for Claude" **[unverified]**.
- The system prompt is a list of named sections with stable ids [d.ts `claude-code.d.ts:3457-3466`]: "The bottom is the engine's own composition (`intro`, `tools`, `memory`, …)". Each section is `{ id, text, scope: 'shared'|'session' }` (`:6770-6794`). `prompt.section` fires "once per named section" (`env_info_simple`, `memory`, …) and is "cached by name for the session" (`:3434-3443`).
- How users override it:
  - `--append-system-prompt` [docs memory:598].
  - Output styles, delivered as a message, so the cache is kept [docs prompt-caching].
  - `prompt.compose` can "answer without `next` to replace it all" [d.ts].
  - Prompt variants form a closed set: `bare` (one-line prompt, `--bare`), `lean`, `sdk-preset` [d.ts `:6796-6801`].

verdict: **already**. The vivalence primer is a Vector of named sections (`harnessed.js:46-54`), and `marking()` places the cache mark (`:204-207`). **steal** the explicit `scope` side of the cache boundary per section, which today is inferred by key order in `marking()`.
```js
primer.open({ nature: "role", scope: "shared" }, ROLE);       // before the mark
primer.open({ nature: "thread", scope: "session" }, summary);  // after it
// marking(system) → the last "shared" key, not keys.indexOf("thread") - 1
```

### 3 instructions
- Discovery [docs memory:55-64, 146-148]:
  - Load order, broadest first: managed policy (`/Library/Application Support/ClaudeCode/CLAUDE.md`), then user `~/.claude/CLAUDE.md`, then project `./CLAUDE.md` or `./.claude/CLAUDE.md`, then `CLAUDE.local.md`.
  - Ancestors of the cwd load at launch. "Files in subdirectories load on demand … once Claude reads, writes, or edits another file in that subdirectory."
  - `@path` imports, "maximum depth of four hops" (:106). An external import needs a one-time approval (:136).
  - `.claude/rules/*.md`, recursive, with `paths:` frontmatter, load only when a matching file is touched (:178-200).
- Precedence: "All discovered files are concatenated into context rather than overriding each other … instructions closer to where you launched Claude are read last" (:146). Rules: "Neither set overrides the other … Claude may follow either one" (:284). So there is no mechanical precedence, only order.
- AGENTS.md [docs :353-398]. The default mode `claude-md-or-agents-md` reads AGENTS.md only if no `CLAUDE.md`/`CLAUDE.local.md` exists at the cwd or above. `AGENTS.override.md` and `.agents/` are "Not read". It is implemented as the built-in mod `mods/agents-md` (`hooks/hooks.json`, `register.ts:40-60`): a `prompt.context` hook plus a `tool.call` hook on Read that attaches nested AGENTS.md.
- Placement: "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself" (:584). Core context blocks: `claudeMd`, `userEmail`, `attachedProject`, `currentDate` [d.ts `:6821-6846`].
- Budget: "target under 200 lines per CLAUDE.md file" (:90), a guideline not a cap. Auto memory MEMORY.md loads "first 200 lines or 25KB" (:31).
- Hooks are the executable counterpart: "To block an action regardless of what Claude decides, use a PreToolUse hook" (memory:28).
- AGENTS.md ~100-row TOC cut: the Codex repo at HEAD has **no root AGENTS.md**, only 3 nested ones (`codex-rs/code-mode-host/AGENTS.md` is 3 rows, 156 bytes). The "~100-row TOC" claim refers to OpenAI's internal product repo (the harness-engineering blog) and is **[unverified]** from source.

verdict: **steal** two things.
- Path-scoped lazy instructions, keyed by the PATH a tool touches. vivalence's lazy primers are keyed by a sibling's slug (`harnessed.js:51`) and read only through `primer_read`.
- Instructions as a user-turn block, not system, so editing them never invalidates the tool/system prefix.
```js
// a shard on the armory: after an fs_* call, attach rules whose paths glob the touched file, once per thread
armed.use(async (ctx, next) => { await next();
  for (const rule of ctx.mode.rules?.matching(ctx.input.path) ?? []) ctx.output.message += `\n[rule ${rule.nature}]\n${rule.text}`; });
```

### 4 world model
- Documented [prompt-caching "Cache scope"]: "the conversation opens with an announcement of the working directory, platform, shell, and OS version". Also "each conversation also carries the branch and recent commits from that [git status] snapshot", taken at startup, and re-read fresh after compaction (context-window table).
- Date is the `currentDate` context block in the first user message [d.ts :6842].
- File changes: "Claude Code appends a `<system-reminder>` noting the file changed" (prompt-caching "Editing files"). So refresh happens by appended reminder, never by rewriting the prefix.
- Auto memory paths are embedded in the system prompt (prompt-caching "Cache scope").
- No file-tree dump is documented.

verdict: **steal** the rule: the world snapshot is taken ONCE into the first turn, and every change after that is appended as a reminder part. vivalence's `summarizing` (`harnessed.js:199-202`) re-renders `thread` into the primer every call. It sits past the cache mark, so it is cheap, but it is a full re-render.
```js
// /dialogue: a "/reminder" part when thread state changed since the last turn's snapshot
harness.branch("/dialogue").use(async (ctx, next) => { const delta = diff(ctx.thread.trait.SNAPSHOT, await snapshot(ctx));
  if (delta) ctx.hallucination.turns.push({ role: "user", parts: [{ type: "text", text: `<reminder>${delta}</reminder>` }] }); await next(); });
```

### 5 loop
- Closed core. `maxTurns?: number` exists in the SDK options [d.ts :408].
- Abort reaches hooks: "`next.signal` aborted (the person interrupted, a hook above settled first, its own budget ran out)". `turn.abort({ turnId })` [d.ts :4269-4290, :5654].
- Streaming hook `turn.step` is an async generator over `TurnStepChunk` [d.ts :919, :3678].
- Hook budget: `ms: 10_000` per dispatch, `catchMs: 1_000` [d.ts :4269-4285].
- Retry/backoff and the parallel-call policy are **[unverified]**.

verdict: **already**. vivalence has `policy.rounds` (`hallucinate.js:127-134`), an abortable controller per call (`:83-85`), and the stream grammar (harness.md §2.6). **skip** budgets per hook (no hook layer yet).

### 6 context economy
- Auto-compaction near the window; the threshold depends on the model. Example: "Haiku 5.5 auto-compacts at about 967K tokens" [docs model-config]. Configurable via `/autocompact 500k` and `CLAUDE_CODE_AUTO_COMPACT_WINDOW`.
- After compaction [context-window table]:
  - Re-injected from disk: CLAUDE.md, auto memory, skill descriptions, git status, the plan file.
  - "re-reads up to five [files], most recently modified first". A file over 5 000 tokens comes back as a path only.
  - Skill bodies capped at 5 000 tokens each and 25 000 total.
  - Path rules and nested CLAUDE.md reload on demand.
- Cache layers [prompt-caching]: System prompt (core instructions, tool definitions) → Project context (CLAUDE.md, memory, rules) → Conversation.
  - "Plan mode and skill loading … append their instructions as conversation messages, so the cached prefix stays intact."
  - Mode switches are cache-safe.
  - A bare tool deny removes the tool, which invalidates the cache unless tools are deferred.
- `session.compact` hook: rewrite `instructions` or `messages`, or `{ skip }` [d.ts :3600-3611].

verdict: **steal**. vivalence has no compaction. History is "the whole thread" (F8, m84), and `chaining` (`harnessed.js:106-119`) loads the full `turn.history`. Steal a compaction that re-injects from disk (primer re-loaded, last N touched files re-read) rather than summarizing everything.
```js
// /dialogue middleware, after chaining
const compacting = async (ctx, next) => { if (tokens(ctx.hallucination.turns) > ctx.intelligent.window * 0.9)
  ctx.hallucination.turns = [await handoff(ctx), ...recentFiles(ctx, 5)]; await next(); };
```

### 7 extension seam
- Four layers:
  1. Classic hooks: 33 events [docs hooks]. Types are `command | http | mcp_tool | prompt | agent`. They merge across managed / user / project / local / plugin / skill frontmatter.
  2. Plugins (`.claude-plugin/plugin.json`): skills, commands, agents, hooks, MCP servers, LSP.
  3. Skills: SKILL.md directories. Descriptions load upfront and bodies load on invoke as a user message.
  4. **Mods = function hooks** [d.ts]: `register(on, options)` with `on(event, ($, e, next) => …)` (`mods/README.md:1-6`). These are koa-style and run in chain order, in tiers `prepend` > `user` > `append` (`mods/sec-default/README.md`).
- Mod event families (≈98 names in the d.ts): `prompt.{compose,section,context,attachment,submit}`, `tool.{call,check,list,register,describe}`, `session.{append,compact,start,…}`, `turn.{start,step,complete,abort}`, `fs.*`, `http.fetch`, `process.run`, `model.{complete,fork,classify}`, `engine.create`. The last one "A step may ADD nouns and WITHHOLD nouns … may NOT REPLACE one another step added" (:3690-3696).
- The core keeps the loop, the permission engine and cache-mark placement ("The engine places each cache mark", :3462).
- Status: "Early access … the API … may change between releases without notice" (`mods/README.md` end).

verdict: **already**, by shape. vivalence's harness IS a koa vector: `domain.harness` and `mode.module.harness` graft at `harnessed.js:241-242`. **steal**:
- (a) `engine.create`'s ADD/WITHHOLD/never-REPLACE rule for ctx nouns. Today `shard.context.bind` lets an instance overwrite `ctx.mode`.
- (b) A section-addressed primer compose hook, so an instance drops a root section by id.
```js
// harness.js of an instance
export const harness = new Vector().use(async (ctx, next) => { await next(); ctx.hallucination.primer.prune("thread"); });
// root: shard.context.bind refuses an existing key — throw `[harness] ${key} is seated by ${owner}`
```

### 8 gates
- Permission modes [docs permissions:76-81]:
  - `default` (Manual).
  - `acceptEdits`.
  - `plan`: "reads files and runs read-only shell commands … doesn't edit your source files".
  - `auto`: a classifier.
  - `dontAsk`: "Auto-denies every call that would otherwise prompt".
  - `bypassPermissions`.
- Rules use `Tool(specifier)` syntax, e.g. `Bash(npm run *)`, `Read(./.env)`, `WebFetch(domain:x)`, `Agent(model:opus)`. "Rules are evaluated in order: deny, then ask, then allow. The first match in that order determines the outcome" (:56). A bare tool deny "removes the tool from Claude's context entirely" (:60). Managed settings are highest; nothing overrides a managed rule (:762-764).
- Sandbox [docs sandboxing]:
  - Seatbelt on macOS, bubblewrap on Linux. "The sandbox is off by default".
  - Writes allowed to cwd, temp and added dirs. Network goes through a proxy with an allowlist that starts empty.
  - `autoAllowBashIfSandboxed: true`. Escape hatch: `dangerouslyDisableSandbox`, which can be disabled with `allowUnsandboxedCommands: false`.
  - "Claude's file tools, MCP servers, and hooks run outside it."
  - Built on `@anthropic-ai/sandbox-runtime`.
- Blocks vs warns [docs hooks]: exit 2 blocks, exit 1 is "non-blocking", and a timeout doesn't block unless `onFailure: "block"`.
- The plan mode plan is "Re-injected from disk" after compaction.

verdict: **steal** the deny > ask > allow table over tool natures, written up front. vivalence has no per-tool gate: `steer.strategy.guarded` validates input only (`strategy.js:46`). Discourse item 19 in scout.md: "Structured permission rules written up front beat per-action approval by 20.1 points".
```js
// a shard on the armory, rules as data
const RULES = [["deny", "/fs/delete"], ["ask", "/shell/run"], ["allow", "/fs/*"]];
armed.use(async (ctx, next) => { const verdict = decide(RULES, ctx.signal.nature, ctx.input); if (verdict === "deny") return ctx.output = { condition: "ERROR", output: { message: `denied: ${ctx.signal.nature}` } }; await next(); });
```

## Codex CLI

### 1 tools
- Handler modules: `core/src/tools/handlers/mod.rs:1-37` lists 37 `mod` rows.
- Model-visible core set:
  - `exec_command` (PTY, returns output or a session id) and `write_stdin` (`handlers/shell_spec.rs:89`, `:139`).
  - `apply_patch` (`apply_patch_spec.rs:19`), `update_plan` (`plan_spec.rs:43`).
  - `view_image`, `request_user_input`, `request_permissions`, `tool_search`.
  - MCP resource ×3, multi-agent (`spawn_agent send_message followup_task wait close_agent …`, `router.rs:74`), `get_context_remaining`, `new_context_window`, `sleep`, code-mode `exec`/`wait`.
  - There are no read/grep/ls tools: the filesystem is reached through the shell.
- Web search is **hosted by the provider** (a Responses API tool, not local). `WebSearchMode { Disabled, #[default] Cached, Indexed, Live }` (`protocol/src/config_types.rs:376-381`), and `restrict_to` never expands access (`:384-393`). `core/src/web_search.rs` only renders `Search | OpenPage | FindInPage` actions.
- Exposure classes: `direct | direct_model_only | deferred | deferred_model_only | code_mode_only | hidden` (`tools/router.rs:41-46`). Deferred tools load via `tool_search`.
- Errors (`tools/src/function_call_error.rs:5-10`): `enum FunctionCallError { RespondToModel(String), Fatal(String) }`. An unknown tool becomes `RespondToModel(unsupported_tool_call_message)` (`registry.rs:775-790`). A payload-kind mismatch is `Fatal` (`:805-820`).
- Parallel (`tools/parallel.rs:292-304`): a `RwLock`. Parallel-safe tools take `lock.read()`, all others `lock.write()` (exclusive). The flag comes from `supports_parallel_tool_calls` (`registry.rs:720-722`).
- Output budget: `max_output_tokens` "Defaults to 10000 tokens" (`shell_spec.rs` write_stdin schema, `unified_exec.rs:114`).

verdict: **steal** the RwLock parallel gate. It solves vivalence's stated serial reason (shared em fork, `hallucinate.js:109`): only tools flagged `parallel: true` (pure reads) share; writers run alone. **steal** the two-arm error enum: `condition: "ERROR"` already maps to RespondToModel (`hallucinate.js:103-105`), but vivalence has no Fatal arm that aborts the turn.
```js
// belt/hallucinate.js dispatch
const lanes = groupBy(calls, (call) => edgeOf(tools, call).parallel ? "read" : "write");
settled.push(...await Promise.all(lanes.read.map((c) => settle(policy, c))));
for (const call of lanes.write) settled.push(await settle(policy, call));
```

### 2 identity
- `protocol/src/prompts/base_instructions/default.md` is **275 rows, 20 903 bytes**, in 14 headed sections. L1: "You are a coding agent running in the Codex CLI, a terminal-based coding assistant."
- `## Personality` (L13-15): "concise, direct, and friendly".
- The per-model template comes from model metadata (`prompts/src/model_instructions.rs`). Codex also ships per-model files (`core/gpt_5_2_prompt.md` etc., per scout).
- The base prompt embeds the AGENTS.md spec itself (L17-28).

verdict: **skip** the long persona: 20 KB of coding-agent prose is domain-specific, and vivalence's root is domain-blind. **already**: the primer per mode (`mode.primer`, `harnessed.js:48`).

### 3 instructions
- `core/src/agents_md.rs:1-18`: walk up from the cwd to `project_root_markers` (default `.git`), then collect from the root down to the cwd, concatenated in that order. "We do **not** walk past the project root."
- Per directory, the first matching name wins: `AGENTS.override.md` › `AGENTS.md` › `project_doc_fallback_filenames` (`:43-45`, `:279-283`, loop `:249-266` returns on the first hit).
- User-level docs are joined with the separator `"\n\n--- project-doc ---\n\n"` (`:49`).
- **Byte budget**: `project_doc_max_bytes` defaults to 32 KiB (`core/src/config/mod.rs:269` `AGENTS_MD_MAX_BYTES = DEFAULT_PROJECT_DOC_MAX_BYTES; // 32 KiB`). It truncates and warns: "Loaded only {remaining} of {size} bytes … Trim your project instructions to fit the budget" (`agents_md.rs:51`, `:160-166`).
- Untrusted projects load none (`:65`).
- Precedence is stated IN the prompt, not enforced: "More-deeply-nested AGENTS.md files take precedence … Direct system/developer/user instructions … take precedence over AGENTS.md" (`default.md:25-26`).
- Skills: the `codex-rs/skills` crate (SKILL.md, `skills/src/model.rs:15`). System skills are installed into CODEX_HOME (`skills/src/lib.rs:62-102`).
- Executable counterparts: hooks and execpolicy (axis 8).

verdict: **steal** the hard byte budget with a loud warning (a total over the REAL domain). vivalence's primer has no size bound. The cut can be counted: `shape.primer.load` (`harnessed.js:211`) reports which section it truncated.
```js
const BUDGET = 32 * 1024;
const system = await shape.primer.load(primer, ctx, { budget: BUDGET, overflow: (nature, size) => ctx.warnings.push(`[primer] ${nature} cut at ${size} bytes`) });
```

### 4 world model
- "World state" is a set of typed sections (`core/src/context/world_state/mod.rs:340-388`). The `WorldStateSection` trait has `const ID` and `render_diff(previous) -> SectionTransition`. Each section's `Snapshot` is persisted in the rollout, so a turn sends ONLY the delta: "Snapshot should contain only the comparison data needed to decide what the model must be told next."
- 20 sections (`mod.rs:1-21`): `agents_md, environment, permissions, collaboration_mode, tools, model, plugins_instructions, command_sessions, context_window_guidance, …`.
- The environment section (`world_state/environment.rs:118-160`, `:290-360`) renders `<environment_context>` with:
  - `<cwd>` and `<shell>` per environment.
  - `<shell_version>`, `<current_date>`, `<timezone>` (time gated on `include_environment_context_time`, `:69-72`).
  - `<network enabled>` allowed/denied domains (`context/environment_context.rs:226-241`).
  - `<filesystem>` permissions and `<subagents>`.
  - A removed value renders `<current_date status="unavailable" />`.
- Git is **not** model-visible. `turn_metadata.rs:29-32,102-111` collects remote URLs, HEAD hash and has-changes into request metadata only.
- A separate `current_time.reminder` part exists (`context/current_time_reminder.rs:12-40`).

verdict: **steal**. This is the strongest world-model mechanism of the three: typed sections with a persisted snapshot and `render_diff`. In vivalence a primer section becomes a pair (cata `render`, delta `diff`), and the thread's last snapshot lives in a trait.
```js
// gestalten/primer/environment.js
export const environment = new Vector().open({ nature: "environment", diff: (was, now) => changed(was, now) },
  async (ctx) => ({ cwd: ctx.mode.mountpoint, date: new Date().toISOString().slice(0, 10), shell: ctx.paladin.shell.name }));
```

### 5 loop
- `core/src/session/turn.rs:543` `loop {` runs until `!needs_follow_up` (`:805`). `needs_follow_up = model_needs_follow_up || has_pending_input` (`:690`). No round cap was found in the files read.
- Retries: `stream_max_retries()` (`:1921`), then `handle_response_stream_error(…).or_cancel(&preempt).or_cancel(&cancellation_token)` (`:2058-2070`). Cancellation reaches the retry wait.
- Pending user input can be drained mid-turn as steering (`:780`).
- Tool dispatch uses `.or_cancel_tool(&invocation_cancellation_token)` around lock admission (`parallel.rs:306`).

verdict: **steal** a cancellable backoff sleep. harness.md §2.5: "the sleep is not abortable"; `deliver` (`hallucinate.js:61-73`) waits `backoff[retried]` uncancelled.
```js
await new Promise((resolve, reject) => { const t = setTimeout(resolve, delay); signal.addEventListener("abort", () => { clearTimeout(t); reject(signal.reason); }, { once: true }); });
```

### 6 context economy
- Trigger (`protocol/src/openai_models.rs:579-590`): `auto_compact_token_limit = min(config, context_window * 9 / 10)`. Scope is `Total | BodyAfterPrefix` (`session/turn.rs:1633-1645`). Compaction also runs on a model downshift (`CompactionReason::ModelDownshift`, `:1650`).
- Algorithm (`core/src/compact.rs`):
  - An LLM handoff summary using `prompts/templates/compact/prompt.md`: "You are performing a CONTEXT CHECKPOINT COMPACTION. Create a handoff summary for another LLM that will resume the task." The summary is prefixed with `summary_prefix.md` ("Another language model started to solve this problem…").
  - Keeps recent user messages up to `COMPACT_USER_MESSAGE_MAX_TOKENS = 20_000` (`:64`, `:745-800`).
  - On overflow while compacting: "Trim from the beginning to preserve cache (prefix-based)" `history.remove_first_item()` (`:366-371`).
- Tool output truncation "applies only to live history, preserving full rollout payloads" (`context_manager/history.rs:617`).

verdict: **steal** the handoff-summary plus last-user-messages shape at 90%. It is the simplest correct compaction, and vivalence has none (axis 6, Claude Code).
```js
const handoff = async (ctx) => ({ role: "user", parts: [{ type: "text", text: `${PREFIX}\n${await ctx.cortex.hallucinate.object.render({ system: { compact: CHECKPOINT }, turns: ctx.hallucination.turns })}` }] });
```

### 7 extension seam
- Hooks (`hooks/src`): 14 events found in dispatcher/registry: `SessionStart SessionEnd UserPromptSubmit PreToolUse PostToolUse PermissionRequest PreCompact PostCompact PreModelRequest PostModelRequest Stop SubagentStart SubagentStop Interrupt`.
- Hooks are discovered from `hooks.json` in the config folder (`engine/discovery.rs:394`) and from plugin hook sources with trust fingerprints (`:285-334`, `engine/plugin_trust.rs`).
- The wire format mirrors Claude Code: `hookSpecificOutput.permissionDecision`, `decision: "block"` requiring a reason (`engine/output_parser.rs:121-166`, `:366`). `updatedInput` is honoured for `command` (`tools/handlers/mod.rs:111-121`).
- MCP client (`rmcp-client`, `codex-mcp`), plugins (`plugin`, `plugin-host`, `core-plugins`), code mode (`code-mode*`, `tools/code_mode/`).
- **app-server** crates (`app-server`, `-protocol`, `-transport`, `-daemon`, `-client`) carry the JSON-RPC protocol that other clients attach to. `exec-server` is a remote executor.
- Dynamic tools from the client: `tools/handlers/dynamic.rs`.

verdict: **already**: vivalence's runtime/daemon is the service-first shape (one runtime, many clients) and `input.tools` is the dynamic-tool seam (`harnessed.js:94-97`). **skip** a JSON hooks.json layer: vivalence middleware is already executable and in-process.

### 8 gates
- **Sandbox by default.**
  - `SandboxMode` `#[default] ReadOnly | WorkspaceWrite | DangerFullAccess` (`protocol/src/config_types.rs:104-114`).
  - `SandboxPolicy` adds `ExternalSandbox`. `WorkspaceWrite { writable_roots, network_access: false default, exclude_tmpdir_env_var, exclude_slash_tmp }` (`protocol/src/protocol.rs:1254-1300`).
  - Platform backends: `MacosSeatbelt` | `LinuxSeccomp` (bwrap + seccomp + landlock) | `WindowsRestrictedToken` (`sandboxing/src/manager.rs:48-61`).
  - The Seatbelt profile starts `(deny default)` (`sandboxing/src/seatbelt_base_policy.sbpl:7`).
- Approval: `AskForApproval { UnlessTrusted ("untrusted"), #[default] OnRequest, Granular{sandbox_approval, rules, skill_approval, request_permissions, mcp_elicitations}, Never }`. Under Never, "Failures are immediately returned to the model, and never escalated" (`protocol.rs:1167-1207`).
- Escalation (`tools/orchestrator.rs:396-470`): on `SandboxErr::Denied`, the tool can ask for an unsandboxed retry. "Under `Never` or `OnRequest`, do not retry without sandbox; surface a concise sandbox denial". The model may request escalation per call: `sandbox_permissions: "require_escalated"` plus `justification` (`handlers/mod.rs:100-110`).
- execpolicy: Starlark `.rules` files (`execpolicy/src/parser.rs:349` `prefix_rule`, `:412` `network_rule`, `:439` `host_executable`), loaded from `rules/` with `default.rules` (`core/src/exec_policy.rs:61-63`). `Decision { Allow, Prompt, PromptUser, Forbidden }` (`execpolicy/src/decision.rs:9-18`).
- Plan mode: `ModeKind { Plan, #[default] Default }` (`config_types.rs:674-686`). It is **prompt-only**: template `collaboration-mode-templates/templates/plan.md` (9 184 bytes). L19: "You may explore and execute **non-mutating** actions … You must not perform **mutating** actions." Plus a `<proposed_plan>` stream parser (`session/turn.rs:3057`, `:2272-2290`). No plan-specific tool gating was found in the files read.

verdict: **steal** the sandbox as the root's default stance for `shell_run`: read-only, network off, cwd-writable on opt-in, OS-enforced. Paladin already spawns, and a Seatbelt/bwrap wrapper is a `paladin.scope` concern (codestyle: "a system's beat READS paladin"). **skip** prompt-only plan mode (see Gemini, which enforces it).
```js
// paladin shell tool edge
{ nature: "/shell/run", sandbox: { mode: "read-only", network: false, writable: [] } }  // mode.module.harness may widen, never the model
```

## Gemini CLI

Status: retired for consumers 2026-06-18 (scout discourse #20); the source is still live.

### 1 tools
- Names (`tools/definitions/base-declarations.ts:30-138`): `glob grep_search list_directory read_file run_shell_command write_file replace google_web_search write_todos web_fetch read_many_files get_internal_docs activate_skill ask_user exit_plan_mode enter_plan_mode update_topic complete_task read_mcp_resource list_mcp_resources`, plus `tracker_*` ×6 and `invoke_agent` (`tools/tool-names.ts:184-191`).
- Registered by `maybeRegister` (`config/config.ts:4020-4166`), filtered by the `coreTools` allowlist ("Enabled by default if coreTools is not set", `:4029`). The default set is ~18: `update_topic list_directory read_file grep_search glob activate_skill replace write_file web_fetch read_mcp_resource list_mcp_resources run_shell_command list_background_processes read_background_output google_web_search ask_user invoke_agent`, plus flag-gated `write_todos`, plan ×2 and tracker ×6. Discovered tools come via `toolDiscoveryCommand` and MCP (`tool-registry.ts:370`).
- `google_web_search` is a model call (`tools/web-search.ts:95-108` `generateContent({ model: 'web-search' })`, groundingMetadata). `web_fetch` has `isPrivateIp`/`isBlockedHost`, a 10 s timeout and `MAX_CONTENT_LENGTH = 250000` (`web-fetch.ts:22,41-42,271`).
- Result shape: `ToolResult { llmContent, returnDisplay, error?: { message, type?: ToolErrorType } }` (`tools/tools.ts:753-780`). The error reaches the model as `functionResponse.response: { error: errorMessage }` (`scheduler/tool-executor.ts:503-508`). Only `NO_SPACE_LEFT` is fatal (`tool-error.ts:101-107`).
- `Kind` enum (`tools.ts:1119-1132`): `MUTATOR_KINDS = [Edit, Delete, Move, Execute]`; "Function kinds that are safe to run in parallel" are `READ_ONLY_KINDS = [Read, Search, Fetch]` (`:1135-1148`).
- Parallel: contiguous parallelizable calls are batched with `Promise.all` (`scheduler/scheduler.ts:519-562`). The model can also force order with an injected `wait_for_previous` param (`tools.ts:546-572`).

verdict: **steal** the `kind` tag on every tool edge. One field drives parallelism (axis 5), plan-mode gating (axis 8) and masking exemptions (axis 6). vivalence edges have `nature` and `valence` but no effect class.
```js
// subsystems/paladin/gestalten/tools/fs.js
{ nature: "/fs/read", kind: "read", valence: "…", input: v.object(…) }
{ nature: "/fs/write", kind: "edit", … }   // READ_ONLY = ["read","search","fetch"]
```

### 2 identity
- `renderPreamble` (`prompts/snippets.ts:183-196`): "You are Gemini CLI, an interactive CLI agent specializing in software engineering tasks. You are currently operating in **${modeStr}** mode." The mode name goes into the identity line.
- `getCoreSystemPrompt` (`:136-167`) has 11 renderers: preamble, coreMandates, subAgents, agentSkills, hookContext, primaryWorkflows|planningWorkflow, taskTracker, operationalGuidelines, interactiveYoloMode, sandbox, gitRepo. `renderFinalShell` appends user memory (`:169-180`).
- The source file is 70 505 bytes across variants; rendered size was not measured.
- **Full override**: `GEMINI_SYSTEM_MD` env → `.gemini/system.md` or a given path replaces the base prompt, with `applySubstitutions` for skills (`prompts/promptProvider.ts:53-55,108-130`). `GEMINI_WRITE_SYSTEM_MD` dumps the default (`:326`).

verdict: **steal** the whole-file override. It answers m84 L ("how we allow users to overwrite them"): an instance file replaces the root primer, and named substitutions keep the armory listing true. vivalence's equivalent is the mask fold (m84 design §, `registry.js:207`). **already** for per-section grafting.
```js
// root: if the instance ships primer.md, it IS the primer; ${tools} ${modes} substituted
if (ctx.instance.primer) primer = new Vector().open("system", (ctx) => substitute(ctx.instance.primer, { tools: armory(ctx), modes: roster(ctx) }));
```

### 3 instructions
- Discovery (`utils/memoryDiscovery.ts`):
  - Global `~/.gemini/GEMINI.md` (`:317-331`).
  - Upward walk from cwd to the `.git` boundary (`:152-160`, `:458-509`).
  - Extension context files (`:383`) and user-project private memory `MEMORY.md` (`tools/memoryTool.ts:5-6`, `memoryDiscovery.ts:342`).
  - `contextFileName` is configurable to several names (`setGeminiMdFilename`, `memoryTool.ts:12-39`).
- Each file is framed `--- Context from: ${filePath} ---` (`:306`). They are categorized into `global | extension | project | userProjectMemory` (`:433-455`).
- Three-tier placement (comment at `utils/environmentContext.ts:62-65`): "Tier 1 (global): system instruction only · Tier 2 (extension + project): first user message · Tier 3 (subdirectory): tool output (JIT)".
- JIT: `read_file`, `list_directory` and `replace` call `discoverJitContext(config, path)`. It appends "--- Newly Discovered Project Context ---" to the tool result (`tools/jit-context.ts:42-55`; `ls.ts:283`, `read-file.ts:216`, `edit.ts:1104`).
- Precedence is stated, not enforced (`snippets.ts:524-577`, `:712-716`): "Sub-directories > Workspace Root > Extensions > Global … they **cannot** override Core Mandates". It is rendered as `<global_context> <user_project_memory> <extension_context> <project_context>`.
- No size budget was found.

verdict: **steal** the three-tier placement and JIT-in-tool-result. Global is in system (cached); project goes in turn 1; subdirectory instructions ride the tool result that touched them, so the prefix is never invalidated. This is the same lesson as Claude Code axis 3, with a cleaner mechanism.
```js
// shard on paladin fs tools
armed.branch("/fs").use(async (ctx, next) => { await next(); const jit = await nearest(ctx, ctx.input.path, "AGENTS.md", ctx.thread.trait.LOADED);
  if (jit) ctx.output.message += `\n--- context from ${jit.path} ---\n${jit.text}`; });
```

### 4 world model
- `getEnvironmentContext` (`utils/environmentContext.ts:49-81`) builds the first user message `<session_context>`: "Today's date is ${today}", "My operating system is: ${platform}", the project temp dir, `getDirectoryContextString` (cwd plus the folder structure from `utils/getFolderStructure.ts`, if `includeDirectoryTree`), and session memory.
- It is pinned by a stable id `deriveStableId(['environment-context'])` and not re-sent on resume (`:83-111`).
- Git: a boolean `isGitRepository(cwd)` (`promptProvider.ts:249`) toggles the `# Git Repository` prompt section (`snippets.ts:501-522`). That section is behavior rules only ("NEVER stage or commit…"); no status is injected.
- No per-turn refresh: the date is fixed at session start.

verdict: **already**. vivalence's `primer.modes` and `primer.entity` sketches (m84 design §) are the "what exists" index. **skip** the folder-tree dump: the field reports it as dead weight, and Codex and Claude Code don't do it.

### 5 loop
- `MAX_TURNS = 100` (`core/client.ts:85`), bounded by `Math.min(turns, MAX_TURNS)` (`:1003`).
- Retry: `DEFAULT_MAX_ATTEMPTS = 10`, `initialDelayMs: 5000`, `maxDelayMs: 30000` (`utils/retry.ts:20,42-45`).
- Stream grammar `GeminiEventType` (`core/turn.ts`): `content tool_call_request tool_call_response tool_call_confirmation user_cancelled error chat_compressed thought max_session_turns finished loop_detected citation retry context_window_will_overflow invalid_stream model_info agent_execution_stopped agent_execution_blocked` (18). `retry` tells the UI to discard partial output (`core/geminiChat.ts:86-91`).
- Loop detection (`services/loopDetectionService.ts:29-60`): `TOOL_CALL_LOOP_THRESHOLD = 5` identical calls, `CONTENT_LOOP_THRESHOLD = 10`, plus an LLM check after 30 turns every 5-15.

verdict: **steal** loop detection as a cheap middleware: 5 identical `(name, input)` calls in a row closes the response. vivalence's only guard is `rounds`. **already**: the grammar (`/response/close { state }`, harness.md §2.6).
```js
// belt/hallucinate.js, per round
if (repeated(history, call, 5)) yield { event: "/response/close", meta: { state: "loop", rounds } };
```

### 6 context economy
- Compression (`context/chatCompressionService.ts`):
  - Trigger `DEFAULT_COMPRESSION_TOKEN_THRESHOLD = 0.5` × the model limit (`:45`, `:583-590`). It preserves the newest 30% (`COMPRESSION_PRESERVE_THRESHOLD = 0.3`, `:350`, split at `:638-640`).
  - It produces a `<state_snapshot>` and integrates a prior snapshot (`:669-684`).
  - A **verification pass**: "Critically evaluate the <state_snapshot> you just generated. Did you omit any specific technical details…" (`:699-725`).
  - Also `RECENT_TURNS_PROTECTED = 3`, `COLLAPSED_FUNCTION_RESPONSE_MAX_BYTES = 2048`, `COLLAPSE_HISTORY_BYTE_THRESHOLD = 256 KB` (`:50-100`).
- **Tool-output masking** (`context/toolOutputMaskingService.ts:25-66`): a "Hybrid Backward Scanned FIFO" over tool outputs.
  - The newest 50k tool tokens are protected, and the run triggers only if ≥30k more are prunable.
  - Masked outputs are offloaded to the `tool-outputs/` dir with a `tool_output_masked` tag.
  - Exempt: `activate_skill ask_user enter/exit_plan_mode`.
- This is rule-based elision before LLM summarization: the order scout discourse #11 calls most efficient.

verdict: **steal** masking as phase 1, before any summary. Old `tool_result` parts past a protection window become a one-row stub with a path.
```js
const masking = async (ctx, next) => { let kept = 0;
  for (const part of toolResults(ctx.hallucination.turns).reverse()) if ((kept += tokens(part)) > 50_000 && !EXEMPT.has(part.name)) part.output = { message: `[masked ${tokens(part)} tokens] fs_read ${await spill(ctx, part)}` };
  await next(); };
```

### 7 extension seam
- Hooks: 11 events `BeforeTool AfterTool BeforeAgent AfterAgent BeforeModel AfterModel BeforeToolSelection SessionStart SessionEnd PreCompress Notification` (`hooks/types.ts:~40-55`). Sources: `ConfigSource { Project, User, System, Extensions }` (`:23-28`).
- `BeforeToolSelection` can rewrite `toolConfig` (allowed function names) before the model call (`:247-256`, `:400`). The tool set can be filtered per request without a cache break.
- Decisions are `block|deny|ask` plus `continue:false` and `additionalContext` (`:153-268`).
- Extensions (`packages/cli/src/config/extension.ts:24-49`): `{ name, version, mcpServers, contextFileName, excludeTools, settings, themes, plan.directory, migratedTo }`, plus extension policies (TOML tier 2) and context files.
- ACP server (`packages/cli/src/acp/*`) and A2A server (`packages/a2a-server`).

verdict: **steal** `excludeTools` and `BeforeToolSelection`, i.e. an instance can SUBTRACT root tools. vivalence's root only adds: `arming()` grafts and never prunes (`harnessed.js:76-104`). That is the missing half of "near-empty root".
```js
// arming(): after grafts
for (const nature of [...(ctx.domain?.manifest.exclude ?? []), ...(ctx.mode.manifest.exclude ?? [])]) armed.trie.delete(nature);
```

### 8 gates
- Policy engine (`policy/`): `PolicyDecision { ALLOW, DENY, ASK_USER }` (`policy/types.ts:10-14`), `ApprovalMode { DEFAULT, AUTO_EDIT, YOLO, PLAN }` (`:48-53`). Rules are TOML with `toolName`, `mcpName`, `argsPattern` (regex over stable-stringified args), `toolAnnotations`, `modes`, `interactive`, `priority`, `denyMessage`.
- Tiers (`policy/policies/plan.toml` header): "Admin > User > Workspace > Extension > Default". Priority is `tier + priority/1000`.
- **Plan mode is enforced** (`plan.toml:74-81`): `toolName = "*"`, `decision = "deny"`, `priority = 40`, `modes = ["plan"]`, `denyMessage = "You are in Plan Mode with access to read-only tools…"`. Read-only tools are allowed at priority 50. `write_file`/`replace` are allowed only when `argsPattern` matches `.gemini/tmp/<session>/plans/*.md` (`:115-203`). Every other write is denied: "You may ONLY use write_file or replace to save plans to the designated plans directory".
- Defaults (`write.toml`): `replace`, `write_file` and `run_shell_command` are `ask_user`. `web_fetch` is allow or ask.
- Sandbox is opt-in: `sandbox.enabled default(false)`, `command ∈ docker|podman|sandbox-exec|runsc|lxc|windows-native`, `networkAccess default(false)` (`config/config.ts:535-575`). Per-mode shell profile (`policy/policies/sandbox-default.toml`): `[modes.plan] network=false readonly=true`; `[modes.default] approvedTools = ['cat','ls','grep','head','tail',…]`.

verdict: **steal** plan mode as a POLICY over `kind`, not prose. One rule table plus one allowed write path. Combined with Claude Code's deny>ask>allow, this is the gate for a near-empty root.
```js
const RULES = { plan: [[(e) => READ_ONLY.includes(e.kind), "allow"], [(e, i) => e.nature === "/fs/write" && i.path.startsWith(PLANS), "allow"], [() => true, "deny"]] };
```

## comparative — the three side by side

| axis | Claude Code | Codex CLI | Gemini CLI | best-of-three for a near-empty root |
|---|---|---|---|---|
| 1 tools · default count | 56 rows (docs) · Glob/Grep off on unix | ~20 visible · no fs tools | ~18 + flag-gated | Codex: shell + apply_patch + view_image |
| 1 web | WebSearch · WebFetch (local, permissioned) | hosted web_search · Cached default | google_web_search (model) · web_fetch 250000 | Gemini web_fetch + isPrivateIp |
| 1 error shape | [unverified] | RespondToModel · Fatal | `{ error }` · fatal=NO_SPACE_LEFT | Codex enum |
| 1 parallel | PostToolBatch (implied) | RwLock read/write | READ_ONLY_KINDS Promise.all · wait_for_previous | Codex RwLock + Gemini `kind` |
| 2 identity | sections `{id,text,scope}` · closed text | default.md 20903 B · 14 sections | 11 renderers · GEMINI_SYSTEM_MD | Gemini system.md + CC scope |
| 3 files | CLAUDE.md · CLAUDE.local.md · rules/ · AGENTS.md (fallback) | AGENTS.override.md › AGENTS.md › fallbacks | GEMINI.md (configurable names) · MEMORY.md | Codex |
| 3 walk | ancestors at launch · subdirs on touch · @import ×4 | root(.git) → cwd · no past root | global · upward to .git · JIT on tool | Gemini JIT |
| 3 placement | user msg after system | developer/user fragment | tier1 system · tier2 msg1 · tier3 tool result | Gemini 3-tier |
| 3 budget | 200 rows (advice) · memory 200 rows/25KB | 32 KiB hard · truncate+warn | none found | Codex 32 KiB |
| 3 precedence | order only | prompt-stated · nested wins | prompt-stated · subdir > root > ext > global | order + nested-last |
| 4 cwd/OS/shell | announced turn 1 | `<environment_context>` diffed | `<session_context>` turn 1 | Codex |
| 4 date | currentDate block | current_date · timezone · reminder | session start, fixed | Codex |
| 4 git | branch + recent commits snapshot | request metadata only | boolean → rules section | Claude Code snapshot |
| 4 refresh | system-reminder append | render_diff per section | none | Codex render_diff |
| 5 cap | maxTurns (SDK) | until no follow-up | MAX_TURNS 100 | vivalence rounds (already) |
| 5 retry | [unverified] | stream_max_retries · cancellable | 10 × 5000→30000 ms | Codex cancellable |
| 5 loop guard | — | — | 5 calls / 10 content | Gemini |
| 6 trigger | model window (~967K Haiku 5.5) | 0.9 × window | 0.5 × limit | 0.9 |
| 6 algorithm | summary + re-inject disk + 5 files | handoff + 20000 user tokens | mask 50k/30k → state_snapshot + verify | Gemini mask → Codex handoff |
| 6 cache | 3 layers · deferred tools · modes as msgs | prefix-trim on overflow | tier placement | Claude Code layers |
| 7 hooks | 33 events · 5 types · mods `($,e,next)` | 14 events · hooks.json | 11 events · BeforeToolSelection | CC mods (= vivalence shape) |
| 7 subtract | bare deny removes tool | exposure: hidden/deferred | excludeTools | Gemini excludeTools |
| 7 protocol | SDK · MCP · mods | app-server · exec-server · MCP | ACP · A2A · MCP | — |
| 8 sandbox default | off | ReadOnly (on) | off | Codex ReadOnly |
| 8 OS | Seatbelt · bwrap | Seatbelt · bwrap+seccomp+landlock · RestrictedToken | docker · podman · sandbox-exec · runsc · lxc | Codex |
| 8 rules | deny>ask>allow · Tool(spec) | Starlark prefix_rule · Allow/Prompt/PromptUser/Forbidden | TOML priority tiers ×5 | CC order + Gemini tiers |
| 8 plan | permission mode (enforced) | prompt only | policy deny * + plans/*.md | Gemini |
| 8 block vs warn | exit 2 blocks · 1 warns | decision:block needs reason | block/deny/ask | CC |

## steal list — ranked, ≤10

1. **An effect class on every tool edge (`kind`)**. From Gemini, `tools/tools.ts:1119-1148`. A single field feeds parallelism, plan gating and masking. It is the precondition for steals 2, 3 and 8.
```js
{ nature: "/fs/read", kind: "read", … }  { nature: "/fs/write", kind: "edit", … }  { nature: "/shell/run", kind: "execute", … }
export const READ_ONLY = ["read", "search", "fetch"];
```
2. **A deny > ask > allow rule table over natures, policy-tiered**. From Claude Code (permissions:56) and Gemini (`policy/policies/plan.toml` tiers). The root ships no tool-specific policy, only the evaluator. Instances bring rules in `mode.module.policy`, and modes such as `plan` are rule sets.
```js
const gating = (rules) => async (ctx, next) => {
  const verdict = rules.find(([test]) => test(ctx.edge, ctx.input))?.[1] ?? "ask";
  if (verdict === "deny") { ctx.output = { condition: "ERROR", output: { message: `denied ${ctx.edge.nature} in ${ctx.mode.trait.MODE}` } }; return; }
  if (verdict === "ask") await ctx.controller.consent(ctx.edge, ctx.input); await next(); };
armed.use(gating([...ctx.domain?.policy ?? [], ...ctx.mode.module.policy ?? [], ...ROOT_POLICY]));
```
3. **Subtractive arming**. From Gemini `excludeTools` (`cli/src/config/extension.ts:29`) and Claude Code's bare-deny removal (permissions:60). This is the missing half of the near-empty root: an instance prunes root tools as well as adding its own.
```js
for (const nature of ctx.mode.manifest.exclude ?? []) armed.trie.delete(nature);
```
4. **Typed world-state sections with `render_diff`**. From Codex `context/world_state/mod.rs:340-388`. The cwd, date, roster and thread are sent in full once, then only as deltas, with the snapshot persisted on the thread. This keeps the cached prefix stable and replaces `summarizing`'s re-render.
```js
export const environment = new Vector().open({ nature: "environment", diff: changed }, async (ctx) => ({ cwd: ctx.mode.mountpoint, date: today() }));
// /dialogue: was = ctx.thread.trait.WORLD[nature]; push { role:"user", parts:[{ text: render(diff(was, now)) }] } when non-empty
```
5. **Three-tier instruction placement plus JIT context in tool results**. From Gemini `utils/environmentContext.ts:62-65` and `tools/jit-context.ts:42-55`, matching Claude Code's subdir-on-touch. Global goes in the primer, project in turn 1, and a subdirectory's instructions ride the `fs_*` result that touched it.
```js
armed.branch("/fs").use(async (ctx, next) => { await next(); const jit = await nearest(ctx, ctx.input.path, "AGENTS.md");
  if (jit && !ctx.thread.trait.LOADED.includes(jit.path)) ctx.output.message += `\n--- context from ${jit.path} ---\n${jit.text}`; });
```
6. **OS sandbox as the shell default**. From Codex `config_types.rs:104-114` (`#[default] ReadOnly`) and `seatbelt_base_policy.sbpl:7` `(deny default)`. The model may only request widening through the gate (Codex `require_escalated` + `justification`).
```js
{ nature: "/shell/run", kind: "execute", sandbox: { mode: "read-only", network: false } }   // paladin.scope spawns via seatbelt/bwrap
```
7. **Two-phase compaction: mask old tool outputs, then hand off**. From Gemini `toolOutputMaskingService.ts:25-66` (50k protected / 30k batch) and Codex `compact.rs:64` plus `templates/compact/prompt.md` at 0.9 × window (`openai_models.rs:579-590`). vivalence has none.
```js
harness.branch("/dialogue").use(masking).use(async (ctx, next) => {
  if (tokens(ctx.hallucination.turns) > 0.9 * ctx.intelligent.window) ctx.hallucination.turns = [await handoff(ctx), ...lastUserTurns(ctx, 20_000)]; await next(); });
```
8. **Parallel reads, exclusive writes**. From Codex `tools/parallel.rs:292-304` (RwLock) and Gemini `scheduler.ts:519-562`. This lifts vivalence's serial dispatch (`hallucinate.js:109-113`) without breaking the shared em: only `kind ∈ READ_ONLY` calls share.
```js
const [reads, writes] = partition(calls, (c) => READ_ONLY.includes(edgeOf(tools, c).kind));
return [...await Promise.all(reads.map((c) => settle(policy, c))), ...await serial(writes, (c) => settle(policy, c))];
```
9. **A hard primer byte budget, loud on cut**. From Codex `config/mod.rs:269` (32 KiB) and `agents_md.rs:160-166`. Today `shape.primer.load` has no bound, and an instance-brought primer can silently eat the window.
```js
const system = await shape.primer.load(primer, ctx, { budget: 32 * 1024 });   // throws or warns `[primer] <nature> cut at N of M bytes`
```
10. **Section scope against the cache mark, and whole-primer override**. From Claude Code `claude-code.d.ts:6770-6794` (`scope: 'shared'|'session'`) and Gemini `promptProvider.ts:108-130` (`GEMINI_SYSTEM_MD`). `marking()` (`harnessed.js:204-207`) then reads scope instead of key order, and an instance `primer.md` replaces the root primer with named substitutions.
```js
primer.open({ nature: "role", scope: "shared" }, ROLE);
const marking = (primer) => [lastOf(primer, (n) => n.scope === "shared"), "tools"];
```
