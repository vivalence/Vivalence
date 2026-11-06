<!-- limit: 50000 chars · m117 evidence 2026-11-07, agents opus · reference, read-only -->
# analysis A — OpenClaw · Hermes Agent · nanobot (HKUDS)

Source read at HEAD on 2026-11-07 via raw.githubusercontent.com. Local copies in `scratchpad/A/{oc,hm,nb}`. Short names: HJ = `systems/runtime/subjects/mode/traits/harnessed.js`; HAL = `subsystems/typology/gestalten/belt/hallucinate.js`. A few citations approximate within a few rows: `system-prompt.ts:L586-599`, `:L668-672`, `system_prompt.py:L793-795`, `tools/registry.py:L242-244`.

## OpenClaw

### 1 tools
- **One fact table**, `src/agents/core-tool-facts.ts:L52-162` (`CORE_TOOL_DEFINITIONS`): ~68 core tool ids in 11 sections (fs, runtime, web, memory, sessions, ui, messaging, automation, nodes, agents, media). fs: `ls read write edit apply_patch`; runtime: `exec process code_execution secrets`; web: `web_search web_fetch x_search`; memory: `memory_search memory_get personal_instructions`; `browser` in ui.
- **Four profiles** `minimal | coding | messaging | full` (`:L8`); `minimal` = 3 tools `presence · session_status · gateway`; `full` = `allow: ["*"]` (`:L221-235`). Each entry carries `executionLocation` and `replay`.
- **Deferred tools**: outside the table sit behind `tool_search` / `tool_describe` + one raw `dispatch_action` (`:L5`, `:L170-172`). "Coding primitives stay directly visible rather than requiring a tool-search round trip" (`:L201`).
- **Result shape** `{content:[…], details:{status, ok, exitCode, error…}}`; failure classified into `blocked | cancelled | failed | timed_out` (`src/agents/tool-result-error.ts:L1-17`).
- **Result cap**: 16 000 chars; 32k for ≥100k windows; 64k ≥200k; never above 30% of window (`src/agents/tool-result-limits.ts:L6-12`).
- **Parallel by default**: `ToolExecutionMode = "sequential" | "parallel"`, `/** Default: "parallel" */` (`packages/agent-core/src/types.ts:L37`, `:L297`); one `sequential` tool makes the batch sequential (`packages/agent-core/src/agent-loop.ts:L571-591`).

**Verdict: already** for the armory (HJ:L76-104), `condition: "ERROR"`. **Steal**: (a) a profile as an allowlist over one fact table; (b) per-tool `sequential`.
```js
// systems/runtime/gestalten/tools/index.js — sketch

export const minimal = new Vector().graft(paladin.tools.fs.fs, paladin.tools.shell.shell, web.web);
```
```js
.open({ nature: "/fs/write", valence: "…", sequential: true, input: … }, write)
```

### 2 identity
- **One hardcoded row**: `"You are a personal assistant running inside OpenClaw."` (`src/agents/system-prompt.ts:L603`); `promptMode === "none"` → that row + model row only (`:L368`).
- **Persona in workspace files the user edits**: `AGENTS.md SOUL.md IDENTITY.md USER.md TOOLS.md BOOTSTRAP.md MEMORY.md` (`src/agents/workspace-bootstrap-policy.ts:L11-36`), fixed order ranked 10–70 (`src/agents/system-prompt-context-files.ts:L7-15`).
- **Templates** (`docs/reference/templates/`): SOUL.md 1 660 B — "_You're not a chatbot. You're becoming someone._", "If you change this file, tell the user — it's your soul"; IDENTITY.md 1 575 B — a form `Name · Creature · Vibe · Emoji · Avatar` parsed as `- Label: value`, filled "during your first conversation".
- **BOOTSTRAP.md one-shot onboarding**: while it exists the prompt carries `"## Bootstrap Pending"` + `"First visible reply must follow BOOTSTRAP.md; no generic greeting."` (`system-prompt.ts:L561-579`); user deletes it after.
- **Each file gets a row naming its authority**, e.g. `"SOUL.md: persona/tone. Follow it unless higher-priority instructions override."` (`system-prompt-context-files.ts:L80`).

**Verdict: steal** the split: persona = a file the instance owns and the agent may edit; root keeps one neutral row. Steal bootstrap-until-deleted.
```js
// registry instance harness.js — sketch

export const primer = new Vector()
  .open("soul", async (ctx) => await paladin.fs.read(ctx.mode.mountpoint, "SOUL.md"))
  .open({ nature: "bootstrap", when: (ctx) => exists(ctx, "BOOTSTRAP.md") }, read("BOOTSTRAP.md"));
```

### 3 instructions
- **Prose only.** Discovery reads the agent's workspace dir, not a hierarchy; extra files by glob config (`src/agents/workspace.ts`, `bootstrap-files.ts`).
- **Size budget**: 20 000 chars/file (`bootstrap-limits.ts:L3`); 60 000 total; USER.md 4 000 (`bootstrap.ts:L87-90`); trimming keeps first 75% + last 25% (`:L96-97`); AGENTS.md policy digest ratio 0.35 (`:L101`); on truncation: `"[Bootstrap truncation warning] … read the relevant files directly"` (`src/agents/bootstrap-budget.ts:L21-25`).
- **Skills**: `<available_skills>` catalog in prompt, bodies on demand; "Up-front max one. Never invent paths." (`src/agents/system-prompt-skills.ts`).
- **Executable layer**: plugin hooks; `before_prompt_build` sets `systemPrompt`, `prependSystemContext`, `appendSystemContext`, `toolsAllow`; "Keep the first defined system prompt so higher-priority hooks win" (`src/plugins/hooks.ts:L327`).

**Verdict: steal** the truncation notice pointing at the read tool. **Skip** the fixed 7-file order: the instance primer Vector IS the order.

### 4 world model
- **Stable cached prefix**: identity + execution bias → `## Workspace` `Working directory:` or `## Directory Roles` (`system-prompt.ts:L502-506`) → `## Workspace Files (injected)` "User-editable; OpenClaw loads below as Project Context." (`:L615-616`) → `SYSTEM_PROMPT_CACHE_BOUNDARY` (`:L626`).
- **Below the boundary, per run**: tool list, skills, memory, sandbox, one-row `## Runtime`: `Runtime: agent=… | host=… | repo=… | os=… | model=… | shell=… | channel=…` (`src/agents/system-prompt-runtime.ts:L77-110`), relocatable region the host fills (`system-prompt.ts:L885-893`).
- **Memory**: daily `memory/YYYY-MM-DD.md` + curated `MEMORY.md` via `memory_search` / `memory_get`. No git status, no tree.
- **Path blinding**: workspace roots replaceable by placeholder (`system-prompt-runtime.ts:L60-75`).

**Verdict: already** — `thread` last (HJ:L199-202), mark before (HJ:L204-213). **Steal** the one-row `Runtime: k=v | …` root primer section (cwd, os, date, mode) — root has none today.
```js
// systems/runtime/gestalten/primer/runtime.js — sketch

export const runtime = new Vector().open("runtime", (ctx) =>
  `Runtime: cwd=${Deno.cwd()} | os=${Deno.build.os} | date=${new Date().toISOString().slice(0, 10)} | mode=${ctx.mode.manifest.slug}`);
```

### 5 loop
- **Engine**: `packages/agent-core`, a fork of pi-agent-core. Events `agent_start · turn_start · message_start · message_update · message_end · tool_execution_start · tool_execution_update · tool_execution_end · turn_end · agent_end` (`types.ts:L571-592`).
- **Abort**: `signal?.aborted` per phase; an aborted run still emits synthetic `message_end`, `turn_end`, `agent_end` (`agent-loop.ts:L192-220`).
- **Steering**: `getSteeringMessages` mid-run; "Parallel batches never steering-skip" (`types.ts:L268-279`).
- **No hard round cap.** Loop detector (`src/agents/tool-loop-detection.ts:L56-59`, `tool-loop-thresholds.ts:L1`): history 30, warning 10, critical 20, breaker 30; blocks with `deniedReason: "tool-loop"`.
- **Retry**: summarizer `retryAsync({attempts: 3, minDelayMs: 500, maxDelayMs: 5000})` (`src/agents/compaction.ts:L102`).

**Verdict: already** budget/retry (`rounds` HAL:L127-129, `deliver` HAL:L61-73, controller HJ:L39). **Steal** the no-progress detector as armory middleware.
```js
// middleware on `armed`, refuses the 3rd identical call — sketch

armed.use(async (ctx, next) => { const key = `${ctx.signal.nature}:${JSON.stringify(ctx.input)}`;
  if ((ctx.seen[key] = (ctx.seen[key] ?? 0) + 1) > 2) return { condition: "ERROR", output: { message: `same ${ctx.signal.nature} call 3× — change the input or stop` } };
  return next(); });
```

### 6 context economy
- **Trigger**: `min(window − reserve, 0.75 × window)` (`compaction-threshold.ts:L10-13`); reserve ≤25% (`agent-compaction-constants.ts:L2`); ≤3 overflow attempts (`:L16`).
- **Algorithm**: one summarization over bounded history + previous summary. Mandatory: `"Preserve all opaque identifiers exactly as written … UUIDs, hashes, IDs, hostnames, IPs, ports, URLs, and file names."` (`src/agents/compaction.ts:L26-28`); `toolResult.details` never reaches the summarizer (`:L84`).
- **Memory flush before compaction**: soft 4 000 tokens below the point, forced at 2 MiB transcript (`memory-flush-plan.ts:L16-17`); append-only, rejects already-saved paragraphs (`memory-flush-content.ts:L2-22`).
- **Pluggable `ContextEngine`**: `bootstrap · maintain · ingest · afterTurn · assemble · compact · prepareSubagentSpawn` (`src/context-engine/types.ts:L352-537`), `registerContextEngine`.
- **Cache**: stable prefix keyed by sha256, memoized (`system-prompt.ts:L586-599`); TTL per provider (`cache-ttl.ts`).

**Verdict: steal.** No compaction in vivalence (m84 F8). Take the identifier clause + flush-before-compact; a compaction = a summary Turn row, not a deletion, F8 intact.

### 7 extension seam
- **16 plugin registrars** (`src/plugins/registry.ts`): `Tool · Hook · TypedHook · Channel · ContextEngine · AgentToolResultMiddleware · SubagentProfile · GatewayMethod · HttpRoute · Cli · SpeechProvider · …`.
- **17 typed hooks** (`src/plugins/hooks.ts`): `before_prompt_build · before_tool_call · after_tool_call · tool_result_persist · before_compaction · after_compaction · before_agent_run · before_agent_finalize · before_model_resolve …`; by `priority` desc (`:L148`); modifying hooks chain + merge, terminal decision skips the rest (`:L583-680`).
- **MCP**: `bundle-mcp` in coding + messaging profiles (`core-tool-facts.ts:L225-229`). **ACP**: `sessions_spawn(runtime:"acp")` → claude code, cursor, gemini, opencode (`system-prompt.ts:L668-672`).

**Verdict: already** — graft (HJ:L241-242) = typed hooks by Vector order. **Steal** only `AgentToolResultMiddleware`: one `use` on the armory rewriting results before the model sees them.

### 8 gates
- **Layered allow/deny pipeline** (`src/agents/tool-policy-pipeline.ts:L79-110`): `tools.profile → tools.byProvider.profile → tools.allow → … → agents.<id>.tools.allow → group tools.allow`; hook `toolsAllow` lists intersect (`hooks.ts:L290-302`).
- **Session permission modes** (`session-permission-exec-mode.ts:L13-26`): `read-only | guarded | workspace | full` → exec `deny | ask | auto | full`; retained mode = ceiling; human `ask` outranks reviewer `auto` (`:L94-98`).
- `before_tool_call` veto; exec approvals round-trip to a chat channel; Docker sandbox (`system-prompt.ts:L706-720`); `tools.fs.workspaceOnly` (`:L496-499`).

**Verdict: steal** the four-rung ladder as a thread trait the shell/fs middleware read. Root has no gate: `/shell/run` carries only `AbortSignal.timeout` (`shell.js:L39`).

## Hermes Agent

### 1 tools
- **Registration** `tools/registry.py:L735` `register(name, toolset, schema, handler, check_fn, requires_env, is_async, description, emoji, max_result_size_chars, dynamic_schema_overrides, override, scope, execution_timeout)` at import; `check_fn` probes availability, TTL cache (`:L249-276`).
- **Default set** `_HERMES_CORE_TOOLS`, 41 (`toolsets.py:L11-36`): `web_search web_extract terminal process_manage read_file write_file patch search_files vision_analyze image_generate skills_list skill_view skill_manage browser_exec browser_cdp browser_dialog browser_vault text_to_speech todo_list memory session_search clarify execute_code delegate_task cronjob_manage` + 14 `kanban_*` + `computer_use manage_connections`. `_HERMES_WEBHOOK_SAFE_TOOLS` = 4 (`:L39`); toolsets compose via `includes` (`:L355`).
- **Errors**: JSON strings; `tool_error(msg)` → `'{"error": "<msg>"}'` ≤2 048 (`registry.py:L51`, `:L1101-1104`); `dispatch` catches all → `"Tool execution failed: <Type>: <e>"` (`:L972-1000`); unknown → `tool_error("Unknown tool: …")`.
- **Spill**: over threshold → `$HERMES_HOME/cache/spillover/{id}.txt` + preview + path (`tools/tool_result_storage.py:L1-6`); limits 50 000 B, 2 000 rows, 2 000 chars/row (`tool_output_limits.py:L13-15`).
- **Parallel** (`agent/tool_executor.py:L136`; `tool_dispatch_helpers.py:L30-50`; `:L212`): ≤8 workers/batch; `_NEVER_PARALLEL_TOOLS = {"clarify","manage_connections","manage_catalog","setup_beat","set_theme"}`; `_PARALLEL_SAFE_TOOLS` read-only allowlist + same-path conflict planning.

**Verdict: steal** spill-to-file (`shell.js:L4` keeps only last 8 000). **Already** errors as values.
```js
// paladin shell effect tail — sketch

if (out.length > TAIL) { const path = await spill(ctx, out); return { message: `${out.slice(-TAIL)}\n[full output: ${path} — fs_read it]`, object: { path } }; }
```

### 2 identity
- `DEFAULT_AGENT_IDENTITY` (`agent/prompt_builder.py:L160-168`) = `DEFAULT_SOUL_MD` (`hermes_cli/default_soul.py:L9`), 663 chars: `"You are Hermes Agent, built by Nous Research. Be direct: match the length of your reply to the weight of the ask …"`.
- Maintainer note: "A behavior spec … not a trait list — trait lists change nothing" (`prompt_builder.py:L161-162`).
- `~/.hermes/SOUL.md` seeded first run, slot #1 of the stable tier (`agent/system_prompt.py:L556-562`); scaffold: "This file is loaded fresh each message -- no restart needed. Delete the contents (or this file) to use the default personality." (`default_soul.py:L23-25`).
- Injection scan: user SOUL.md matching a pattern only warns; repo-sourced files blocked (`prompt_builder.py:L84-110`).

**Verdict: steal** "behavior spec, not trait list" as the persona authoring rule. **Already** persona = mode primer (HJ:L48).

### 3 instructions
- **Only one project-context type loads; first found wins** (`prompt_builder.py:L1599-1700`, `:L1720`): 1 `.hermes.md`/`HERMES.md` walking up to the repo root; 2 `AGENTS.md` chain root→cwd (`AGENTS.override.md` › `AGENTS.md` › `agents.md`, deduped); 3 `CLAUDE.md` in cwd; 4 `.cursorrules` + `.cursor/rules/*.mdc`.
- **Caps**: 20 000 min, else 6% of window, ceiling 500 000; trim keeps first 70% + last 20% (`:L1033-1048`); 5 s read timeout (`:L42`).
- **Injection scan**: repo files matching → `"[BLOCKED: … potential prompt injection …]"` (`:L110`).
- **Lazy subdirectory hints** (`agent/subdirectory_hints.py:L1-27`): a tool call touching a new subdir appends that dir's AGENTS.md/CLAUDE.md to the tool result; ≤32 000 chars, ≤5 ancestors; "context arrives without touching the system prompt (prompt caching preserved)".
- **Shell hooks** (`agent/shell_hooks.py:L1-5`, `:L44`): JSON on stdin `{hook_event_name, tool_name, tool_input, session_id, cwd}`; exit 2 blocks `pre_tool_call`.

**Verdict: steal** subdirectory hints — instructions mid-loop at zero cache cost; `/fs/*` middleware appending a found `AGENTS.md` once per dir.
```js
// /fs middleware — sketch

armed.branch("/fs").use(async (ctx, next) => { const out = await next();
  const hint = await firstHint(ctx, dirname(ctx.input.path));
  return hint ? { ...out, output: { ...out.output, message: `${out.output.message}\n[${hint.path}]\n${hint.text}` } } : out; });
```

### 4 world model
- **Three tiers joined by `\n\n`** (`agent/system_prompt.py:L744-807`): stable (identity, guidance, coding brief, pinned skills) · context (caller `system_message`, project files, a workspace snapshot — a live VCS probe pinned per session per cwd `:L674-704`, environment probe row, platform hint) · volatile (skills index, MEMORY/USER snapshot, plugin sections, profile row, timestamp, `RUNTIME_ENVIRONMENT`).
- **Date row** (`:L501-526`): date only → byte-identical for a day, `Conversation started: <Weekday, Month DD, YYYY> (<IANA zone>, <abbrev>, UTC±hh:mm)`; spanning days adds `"Today's date (as of the last context rebuild): …"`.
- **Built once per session**: "only context compression triggers a rebuild" (`:L3-4`); mid-session memory writes go to disk, never the current prompt (`tools/memory_tool.py:L1-4`).

**Verdict: steal** the date-only stamp. **Already** tiers (HJ:L46-54, L204-213).

### 5 loop
- `IterationBudget` 500 parent / 50 subagent; `execute_code` iterations refunded (`agent/iteration_budget.py:L1-5`); condition `api_call_count < max_iterations and iteration_budget.remaining > 0` (`conversation_loop.py:L1752`).
- **Steering** inside tool results via `STEER_CHANNEL_NOTE` (`prompt_builder.py:L595`).
- **Backoff** `min(5·2^(n−1), 120)` s + 0.5 jitter (`retry_utils.py:L121-133`); honors `Retry-After` (`:L30`). Timeouts per batch / per call (`tool_executor.py:L190-196`, `:L841-846`).

**Verdict: already.** **Skip** steering via tool results — vivalence chains a real user Turn (HJ:L106-119).

### 6 context economy
- **`ContextEngine` base** (`agent/context_engine.py:L48`): `should_compress · compress · prune_tool_results_only · select_context · on_turn_complete · get_tool_schemas · handle_tool_call`; an engine can ship its own tools.
- **Defaults** (`config_defaults.py:L576-596`): threshold 0.50 (≥0.75 under 512K); `target_ratio 0.20`; `tail_mode "lean"` 2.5% of window, 10K floor, 25K cap; `protect_last_n 20`; `max_attempts 3`; opt-in deterministic no-LLM tool-result prune `proactive_prune_tokens` (`context_compressor_prune.py`).
- **Micro-compaction off**: "every pass rewrites the prompt prefix and breaks the provider prompt cache" (`micro_compaction.py:L1-5`).
- **Cache**: 4 breakpoints — system prefix + last 3 messages, one TTL 5 min or 1 h (`prompt_caching.py:L3-5`); stable prefixes for skill scaffolds (`prompt_cache_boundary.py`).

**Verdict: steal** the no-LLM tool-result prune first: old `tool_result` parts beyond the last N turns → `"[pruned: <nature> → <n> chars]"`. **Already** marks + lazy pages.

### 7 extension seam
- **46 hook names** `VALID_HOOKS` (`hermes_cli/plugins.py:L111-160`): `pre/post_tool_call · transform_tool_result · transform_terminal_output · pre/post_llm_call · transform_llm_output · pre_verify · pre/post_api_request · on_session_* · subagent_start/stop · pre_gateway_dispatch · pre_approval_request …`.
- **Registrars** (`plugins_context.py`): `register_tool · register_hook · register_middleware · register_system_prompt_section · register_context_engine · register_memory_provider · register_platform · register_web_search_provider · register_browser_provider · register_terminal_environment_provider · …`.
- **Override needs opt-in**: `"Plugin module {owner!r} cannot override built-in tool {name!r} without operator opt-in (allow_tool_override)."` (`registry.py:L242-244`).
- Plugin prompt sections confined to one anchor in the volatile tail "so a resumed process can reconstruct the stable prefix without re-running plugins" (`system_prompt.py:L793-795`).
- MCP `tools/mcp_tool*.py`; ACP client `agent/acp_client.py`.

**Verdict: steal** the provider seam for web: root arms `/web/search` + `/web/fetch`, an instance swaps the backend (`register_web_search_provider`). Today web lives only in `commons/instances/hello-world/tools/web.js:L8,L48`. **Skip** override opt-in: graft order decides.

### 8 gates
- **Approval modes** (`approval_mode.py:L16`; `config_defaults.py:L1650-1677`): `manual | smart | off`, default `smart` (guardian LLM); `cron_mode`, `single_query_mode`, `unattended_mode` all `"deny"`; `denial_breaker_threshold 3`; `deny:` fnmatch globs block "even under --yolo".
- Dangerous-command detection + hard floors (`tools/approval.py:L1-11`); writes to SOUL.md/config pass a protected-instruction gate (`prompt_builder.py:L91-93`). Webhook sessions get the 4 safe tools (`toolsets.py:L39`).

**Verdict: steal** "unattended = deny" — the woken run (m84 build list 4) has nobody to ask.

## nanobot (HKUDS)

### 1 tools
- **Autodiscovery**: every module in `nanobot/agent/tools/` except `_SKIP_MODULES` + entry-point group `nanobot.tools` (`loader.py:L18-21`, `:L66-71`); config gates via `Tool.enabled(ctx)` / `create(ctx)` (`base.py:L263-271`).
- **21 built-ins**: `exec exec_session list_exec_sessions read_file write_file edit_file list_dir apply_patch find_files grep web_search web_fetch message cron my search_sessions read_session send_session_message subagent generate_image run_cli_app`; MCP tools `mcp_<server>_<tool>`.
- **Flags**: `read_only`, `concurrency_safe`, `exclusive` (`base.py:L243-255`); schemas via `@tool_parameters({...})` (`:L422`).
- **Errors**: `ToolResult(str)` + `is_error` (`base.py:L197-208`); every error appends `"\n\n[Consider this result in the context of the user's goal and decide whether and how to proceed.]"` (`registry.py:L12-22`); unknown → `"Error: Tool 'x' not found. Did you mean 'y'? … Available: …"` (`:L129-132`).
- **Stable tool order**: builtins sorted, then MCP, cached until (un)register — "stable ordering for cache-friendly prompts" (`registry.py:L96-118`).
- **Large results**: >16 000 chars (`config/schema.py:L181`) → workspace file + placeholder (`context_governance.py:L840-852`).

**Verdict: already** unknown-tool error lists the armory. **Steal** the sorted armory: graft order (HJ:L77-97) can reorder tools and break the `tools` mark (HJ:L206).

### 2 identity
- **No "You are" in code.** `agent/identity.md` (1 655 B): `## Runtime`, `## Workspace` paths, per-channel `## Format Hint`, untrusted-content snippet; rendered by `_get_identity` (`agent/context.py:L143-156`).
- **Persona = workspace `SOUL.md`** (410 B), first person: `"I am nanobot 🐈, a personal AI assistant."` + 5 principles (`templates/SOUL.md`).
- **Only Dream may edit it**: `"Only Dream memory-consolidation tasks may edit the profile and long-term memory files listed above."` (`identity.md:L19`); Dream routes "Agent behavior, guardrails, interaction patterns, tool-use strategy" into SOUL.md (`templates/agent/dream.md`).

**Verdict: steal.** A first-person persona file rewritten by the system from evidence; root keeps no persona.

### 3 instructions
- `BOOTSTRAP_FILES = ["AGENTS.md", "SOUL.md", "USER.md"]` (`context.py:L76`); AGENTS.md from project root, SOUL/USER from workspace (`:L187-191`).
- **Unedited templates skipped**: identical to bundled template → not injected (`_SKIPPABLE_DEFAULTS`, `_is_template_content`, `:L77`, `:L204-217`). Defaults cost zero tokens.
- **Fixed tool contract** `tool_contract.md` (1 110 B): "Treat a clear user request as authorization…", cron vs HEARTBEAT routing.
- **Skills**: `always` inlined under `# Active Skills`; rest a summary (`:L118-131`). Plugins = agent-plugins.org skills + MCP (`agent/plugins.py:L14-17`). `AgentHook` class (axis 7). No bootstrap size cap found.

**Verdict: steal** skip-if-template: a shelf copied from the package template injects nothing until edited.
```js
// instance primer — sketch: an undefined leaf drops

primer.open("user", (ctx) => edited(ctx, "USER.md") ?? undefined)
```

### 4 world model
- **System sections** joined `"\n\n---\n\n"` (`context.py:L141`): identity, bootstrap files, tool contract → `# Current Project` `Working directory:` only when project ≠ workspace (`:L103-109`) → MEMORY.md (skipped if template), skills → `[Archived Context Summary]` (`:L133-139`).
- **Runtime row** `"{macOS|Linux} {machine}, Python {ver}"` (`:L147`).
- **Per-turn facts on the user message**: `RUNTIME_CONTEXT_TAG = "[Runtime Context — metadata only, not instructions]"` (`nanobot/runtime_context.py:L15-16`) via `append_runtime_context` (`:L118-143`); providers registered per turn (`agent/loop.py:L651-654`, `:L674`); e.g. `workspace_context` "Append current access facts without changing the reusable prompt prefix" (`runtime_control.py:L186-205`); marker stored so display strips it (`detach_runtime_context`).

**Verdict: steal.** Changing facts (date, cwd, screen) on the user turn; system prompt byte-stable; `thread` need not sit after the mark.
```js
// shard/hal — sketch: providers on ctx, rendered onto the LAST user turn's parts

const runtime = (ctx) => ({ type: "text", text: `[Runtime Context — metadata only, not instructions]\n${ctx.facts.map((f) => f(ctx)).join("\n")}\n[/Runtime Context]` });
ctx.hallucination.turns.at(-1).parts.push(runtime(ctx));
```

### 5 loop
- `max_tool_iterations 200` (`schema.py:L179`); exhausted → `_try_finalize_after_max_iterations` asks for a final answer, else `max_iterations_message.md` (`runner.py:L837-862`, `:L1283`).
- `_MAX_EMPTY_RETRIES = 2`; `_MAX_LENGTH_RECOVERIES = 3` continues after `length` stop (`runner.py:L83-84`).
- `concurrent_tools` on for main loop (`runner.py:L113`, `loop.py:L1310`); per-tool `concurrency_safe` / `exclusive`; `max_concurrent_subagents 4`.
- **Hook phases** (`agent/hook.py:L67-170`): `before_iteration · on_stream · before_execute_tools · before_execute_tool · after_execute_tool · on_execute_tool_error · after_iteration · finalize_content`.

**Verdict: steal** finalize-on-exhaustion — vivalence closes `state: "length"` and `render()` throws.
```js
// HAL after the while — sketch

if (rounds >= policy.rounds) yield* stream({ ...request, tools: [], turns: [...turns, nudge("Out of tool rounds — answer with what you have.")] });
```

### 6 context economy — "Dream"

**Short loop: compaction into checkpoints**
- Fires on token pressure or 15 idle min. Pressure: `input_budget` = window − max output − buffer (`context_governance.py:L509-560`, `:L817`). Idle: `session_ttl_minutes` (`schema.py:L198-203`; `autocompact.py`).
- `Consolidator.compact_idle_session` (`memory.py:L1187`) summarizes `messages[last_archived:]` with `consolidator_archive.md`; checkpoint replaces the span.
- Appended to `memory/history.jsonl`: append-only, cursor-numbered, ≤1 000 (`memory.py:L55`, `:L269-312`).

**Checkpoint grammar** (`templates/agent/consolidator_archive.md`): one row per fact `- [mark] fact`, marks `[permanent] [durable] [ephemeral] [correction]`; admitted only if SNIP: Signal · Novel · Important · Persistent ("useful for at least two weeks"); every checkpoint carries a working-state handoff: objective, status, blockers, next action, identifiers.

**Dream: cron every 2 h** (`DreamConfig.interval_h = 2`, `schema.py:L63-90`)
- `build_dream_prompt` takes ≤20 unprocessed entries since `memory/.dream_cursor`, each cut to 1 000 chars (`memory.py:L506-526`).
- Ephemeral run with a restricted registry (`build_dream_tools`, `:L538-580`): `read_file` anywhere in workspace; `edit_file` / `apply_patch` / `write_file` only under `skills/` and on `MEMORY.md`, `SOUL.md`, `USER.md`.

**Dream prompt rules** (`templates/agent/dream.md`): route each fact to one file — `SOUL.md` behavior, `USER.md` the person, `memory/MEMORY.md` the project, `skills/<name>/SKILL.md` workflows seen ≥2×; `[ephemeral]` archived after 30 d; `[correction]` replaces in place; strip tags on save; "Summarize only edits confirmed by successful tool results."

**Commit** (`cli/gateway_runtime.py:L226-236`, `:L655-705`): cursor advances only on `_stop_reason == "completed"`; in `finally`, the diff of the three files is auto-committed `"dream: periodic memory consolidation"`; then `compact_history()` + prune. Commands `/dream`, `/dream-log`, `/dream-restore`, `/dream-prompt` (`command/builtin.py:L89-117`); prompt overridable by file (`memory.py:L474-500`).

**Verdict: steal** — maps onto vivalence entities: `history.jsonl` → summary-kind Turn rows; `.dream_cursor` → a trait; Dream → a twitch/beat running a mode with a 4-tool armory; jj → the shelf.
```js
// registry instance: modes/dream/dream/harness.js — sketch

export const harness = new Vector().branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.tools = new Vector().graft(paladin.tools.fs.fs).use(scoped(["SOUL.md", "USER.md", "memory/MEMORY.md", "skills/"]));
  await next();
  if (ctx.output?.meta?.state === "complete") await ctx.entities.user.updateOne({ id: ctx.user.id }, { trait: { DREAMT: { cursor: ctx.input.cursor } } });
});
```

### 7 extension seam
- `AgentHook` subclasses composed (`hook.py:L67`, `:L186`); turn hooks `turn_hooks.py`; runtime-context providers (axis 4); tools via entry points; plugins = manifest of skills + MCP, fingerprint-approved (`plugins.py:L14-60`); full MCP client with OAuth (`tools/mcp.py`, `mcp_oauth.py`).

**Verdict: already.** **Steal** only `runtime_context_provider` on a tool (`base.py:L274`): a tool brings its own per-turn fact — a `facts` field on a leaf's signature.

### 8 gates
- **Shell deny/allow** (`tools/shell.py:L223-242`, `:L837-850`): built-in deny regexes (`\brm\s+-[rf]{1,2}\b`, `\bdel\s+/[fq]\b`) + user `deny_patterns`; `allow_patterns` override deny only when every top-level segment of a chained command matches.
- **Sandbox**: `bwrap` / `seatbelt` with ro/rw binds (`sandbox.py:L1-5`); `restrict_to_workspace` (`schema.py:L440`); workspace scopes (`security/workspace_access.py`).
- **Scoped permission** ContextVar per run `goal_mutation_permission(allowed)` (`goal_permission.py`); Dream's allowlist enforced by its registry (axis 6).

**Verdict: steal** "the registry is the gate" (= "the mechanism IS the guard") + segment-wise allow-over-deny for `/shell/run`. **Skip** bwrap/seatbelt: paladin `instance.specs` owns spawning.

## comparative — the three side by side

| axis | OpenClaw | Hermes | nanobot | best-of-three for a near-empty root |
|---|---|---|---|---|
| 1 default tools | ~68 ids · 4 profiles · minimal=3 | 41 core · 4 webhook-safe | 21 · autodiscovered | nanobot set: fs×5 · exec · web_search · web_fetch |
| 1 error shape | `details.status` → 4 kinds | `{"error"}` ≤2048 | `ToolResult.is_error` + hint | VV `condition: "ERROR"` (already) |
| 1 parallel | default parallel · per-tool sequential | 8 workers · never/safe sets | `concurrency_safe` · `exclusive` | per-leaf `sequential` |
| 1 big result | 16k–64k cap | spill file 50 000 B | persist >16 000 | spill → path |
| 2 persona file | SOUL.md 1660 B + IDENTITY.md 1575 B | SOUL.md 663 chars | SOUL.md 410 B | instance SOUL.md, root none |
| 2 agent edits persona | yes (tell user) | gated write | Dream only | Dream only |
| 3 discovery | workspace 7 files | .hermes.md › AGENTS chain › CLAUDE.md › .cursorrules | AGENTS · SOUL · USER | instance primer Vector |
| 3 cap | 20 000 / 60 000 / USER 4 000 | 20 000…500 000 (6%) | none | 20 000 + truncation notice |
| 3 mid-loop | — | subdir hints ≤32 000 | — | subdir hints |
| 4 volatile facts | below `CACHE_BOUNDARY` | volatile tier | user-turn `[Runtime Context]` | user-turn block |
| 4 date | Runtime row | date-only + "as of" | — | date-only |
| 5 budget | loop detector 10/20/30 | 500 / 50 | 200 + finalize | rounds + finalize + detector |
| 5 retry | 3 · 500–5000 ms | 5·2ⁿ ≤120 s + jitter | empty 2 · length 3 | VV `deliver` (already) |
| 6 trigger | 0.75 window | 0.50 (floor 0.75 <512K) | input_budget · idle 15 min | idle + pressure |
| 6 algorithm | 1-call summary + ids clause | lean tail + no-LLM prune | SNIP-tagged checkpoint | no-LLM prune → SNIP checkpoint |
| 6 long-term | daily md + MEMORY.md + flush | MEMORY 2200 · USER 1375 · nudge 10 | history.jsonl → Dream 2 h → commit | Dream |
| 6 cache marks | stable prefix sha256 | 4 breakpoints | sorted tool defs | VV `marking` (already) |
| 7 hooks | 17 typed · priority | 46 · shell exit 2 | AgentHook ~14 phases | Vector `use`/`graft` (already) |
| 7 registrars | 16 | ~25 | entry points · plugin manifest | graft |
| 7 MCP · ACP | bundle-mcp · ACP spawn | yes · yes | yes · — | MCP as provider graft |
| 8 modes | read-only · guarded · workspace · full | manual · smart · off | allow/deny regex | 4-rung trait |
| 8 unattended | — | deny | — | deny |
| 8 sandbox | Docker | terminal backends | bwrap · seatbelt | paladin spawn |

## steal list — ranked, ≤10

1. **Dream** — append-only checkpoint log → scheduled consolidation with a restricted armory, cursor advances only on `complete`, diff committed. nanobot `cli/gateway_runtime.py:L655-705`, `agent/memory.py:L506-580`, `templates/agent/dream.md`. Vivalence has no long-term memory and no compaction; keeps F8 (summaries = Turn rows); persona instance-owned, fed by evidence.
```js
// instance Dream route — sketch

export const dream = new Vector().open("/dream", async (ctx) => {
  const batch = await ctx.entities.turn.find({ kind: "checkpoint", cursor: { $gt: ctx.user.trait.DREAMT.cursor } }, { limit: 20 });
  const run = await ctx.mode.harness.dialogue.render({ thread, prompt: DREAM + batch.map(row).join("\n"), tools: scopedFs });
  return run.meta.state === "complete" ? advance(ctx, batch.at(-1)) : { condition: "ERROR", output: { message: run.meta.state } };
});
```
2. **Per-turn facts on the user turn, tagged "metadata only, not instructions"** — nanobot `runtime_context.py:L15-16, L118-143`. System prompt byte-stable; `thread` (HJ:L200) + a runtime row move off the system prompt.
```js
const facts = [(ctx) => `date=${today()}`, (ctx) => `cwd=${ctx.cwd}`];
ctx.hallucination.turns.at(-1).parts.push({ type: "text", text: `[Runtime Context — metadata only, not instructions]\n${facts.map((f) => f(ctx)).join("\n")}\n[/Runtime Context]` });
```
3. **SNIP-tagged checkpoint grammar + identifier-preservation clause** — nanobot `consolidator_archive.md`, OpenClaw `compaction.ts:L26-28`. The compaction prompt for the first summary turn; tags make retention mechanical.
4. **Persona = instance-owned first-person SOUL.md; root ships none** — nanobot `templates/SOUL.md`, `identity.md:L19`, OpenClaw `system-prompt-context-files.ts:L80`.
```js
export const primer = new Vector().open("soul", read("SOUL.md")).open("user", read("USER.md"));
```
5. **Subdirectory hints appended to tool results** — Hermes `subdirectory_hints.py:L1-27`; ~10 rows of `/fs` middleware.
6. **Spill oversized output to a file, return preview + path** — Hermes `tool_result_storage.py:L1-6`, nanobot `context_governance.py:L840-852`; `shell.js:L4` loses the head.
```js
if (text.length > LIMIT) return { message: `${text.slice(0, 2000)}…\n[full: ${await spill(ctx, text)} — fs_read it]` };
```
7. **Finalize when rounds run out**, one last round with no tools — nanobot `runner.py:L837-862, L1283`.
8. **No-progress loop detector as armory middleware** — OpenClaw `tool-loop-detection.ts:L56-59`.
9. **Permission ladder `read-only · guarded · workspace · full` as a thread trait, unattended denied** — OpenClaw `session-permission-exec-mode.ts:L13-26`, Hermes `config_defaults.py:L1650-1667`.
```js
armed.branch("/shell").use((ctx, next) => ctx.thread.trait.PERMITTED.rung === "read-only" ? { condition: "ERROR", output: { message: "shell denied: read-only thread" } } : next());
```
10. **Skip-if-template + truncation notice** — nanobot `context.py:L204-217`, OpenClaw `bootstrap-budget.ts:L21-25`.
