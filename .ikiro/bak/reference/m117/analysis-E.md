<!-- limit: 50000 chars · m117 evidence 2026-11-07, agents opus · reference, read-only -->
# analysis E — OpenHands · Cline · Deep Agents

Sources: HEAD tarballs, unpacked at `scratchpad/srcE/{software-agent-sdk,cline,deepagents}`. Path prefixes: `oh-sdk/` = `openhands-sdk/openhands/sdk/`, `oh-tools/` = `openhands-tools/openhands/tools/`, `cl/` = `sdk/packages/`, `da/` = `libs/deepagents/deepagents/`.

**Vivalence drift found:** `harness.md` §2.5 says `Promise.all`, but the live belt is sequential.
```js
// subsystems/typology/gestalten/belt/hallucinate.js:111-112

for (const call of parts.filter((part) => part.type === "tool_use")) settled.push(await settle(policy, call));
```

## OpenHands (software-agent-sdk)

### 1 tools
- **Specs by name, resolved at runtime:** `Tool(name, params)` goes through a locked resolver registry (`oh-sdk/tool/registry.py:33-37`, `_REG: dict[str, Resolver]`). A resolver gets `(params, ConversationState)` and may return several tools (BrowserToolSet).
- **Default exec set:** `oh-sdk/tool/defaults.py:26` `("terminal", "file_editor", "task_tracker")`.
  - `browser_tool_set` only when `enable_browser`.
  - `switch_llm` added by `resolve_tool_specs` (`:43`).
  - Always on: `BUILT_IN_TOOLS = [FinishTool]` (`oh-sdk/tool/builtins/__init__.py:55`).
  - Opt-in: ThinkTool · InvokeSkillTool · VisionInspect · task toolset (`oh-tools/preset/default.py:37-68`).
- **No web_search or fetch tool.** Web = browser toolset or MCP (`oh-sdk/agent/base.py:138` `mcp_config`).
- **file_editor commands:** `Literal["view","create","str_replace","insert","undo_edit"]` (`oh-tools/file_editor/definition.py:26`).
- **Schema** = pydantic Action exported as MCP schema. Two injected fields (`oh-sdk/tool/tool.py:720-735`): `security_risk` when not readOnly; `summary` always.
- **Annotations** MCP: readOnly · destructive · idempotent (`:215-245`).
- **Return** typed Observation, secrets masked (`:638-659`). Output cap `MAX_CMD_OUTPUT_SIZE = 30000` (`oh-tools/terminal/constants.py:18`). Soft timeout: 30 s no output → model asked whether to continue (`:31`).
- **Errors:** bad call → `AgentErrorEvent` back to the model (`oh-sdk/agent/agent.py:1311-1376`); executor exception converted "so the agent can correct itself" (`:1591`).
- **Parallel:** `tool_concurrency_limit` default 1 (`oh-sdk/agent/base.py:304-312`). Above 1, ThreadPool under `ResourceLockManager` keyed on `declared_resources()` (`oh-sdk/agent/parallel_executor.py:1-16`).

**verdict: steal** `declared_resources`: same-resource calls serialize, the rest parallel — the safe way back from sequential `hallucinate.js:111`.
```js
// subsystems/paladin/gestalten/tools/fs.js — sketch

.open({ nature: "/fs/write", lock: (input) => input.path, input: v.object(…) }, write)
```

### 2 identity
- **One sentence, doubles as proxy key:** "You are OpenHands agent, a helpful AI assistant that can interact with a computer to solve tasks." (`oh-sdk/llm/utils/openhands_provider.py:16-19`); proxy 403 without it (`:13-15`).
- **User-editable soul:** `SOUL.md` in persistence dir (`oh-sdk/agent/base.py:69`), loaded `:88-99`, rendered `<SOUL>` at `oh-sdk/context/prompts/sections/static.py:84-91`.
- **`persona` replaces 13 of 19 static sections** via `_ReplacedByPersona` (`oh-sdk/context/prompts/presets.py:65-81`). `system_prompt=` replaces everything (`base.py:205-217`).
- **Size:** static bodies ≈15.6 KB; 19 static + 6 dynamic sections (`presets.py:84-118`).

**verdict: steal.** A persona replaces a named subset (the voice sections), keeps safety + tool sections.
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

primer.open({ nature: "role", tier: "voice" }, ROLE);
if (ctx.mode.primer?.trie.has("/persona")) for (const nature of voiced(primer)) primer.trie.delete(nature);
```

### 3 instructions
- **Prose only.** Third-party files loaded as skills: `.cursorrules · agents.md · agent.md · claude.md · gemini.md` (`oh-sdk/skills/skill.py:347-353`).
- **Dirs**, cwd and repo root, cwd wins (`:1076-1096`): `.agents/skills/` › `.openhands/skills/` › `.openhands/microagents/`. User tier `~/.agents/skills`, `~/.openhands/skills` (`:963-968`).
- **Triggers:** `None` → `<REPO_CONTEXT>` · `KeywordTrigger` · `TaskTrigger` (`oh-sdk/skills/trigger.py:13-35`). AgentSkills listed in `<SKILLS>`, pulled via `InvokeSkillTool`.
- **Repo text fenced** `<UNTRUSTED_CONTENT>` … "may contain prompt injection" (`oh-sdk/context/prompts/sections/dynamic.py:63-69`).
- **Budget:** description ≤1024 chars (`skill.py:1495`); no total cap.

**verdict: steal** the untrusted fence; sibling/domain primers grafted with no provenance mark today (`harnessed.js:46-54`).
```js
// systems/runtime/subjects/mode/traits/harnessed.js:51 — sketch

primer.branch({ nature: sibling.manifest.slug, load: "lazy", trust: "untrusted" }).graft(sibling.primer);
```

### 4 world model
- **Dynamic tier only** (`oh-sdk/context/prompts/presets.py:109-118`): `<REPO_CONTEXT> · <MEMORY_CONTEXT> · <SKILLS> · suffix · <CUSTOM_SECRETS>` (names only) `· <CURRENT_DATETIME>` last — the only volatile value.
- **Platform** only to rewrite bash→powershell (`section.py:34-50`, `static.py:51-63`). No cwd, tree, VCS.
- **Memory two tiers:** `.openhands/memory/`, `~/.openhands/memory/` (`static.py:115-140`), fenced untrusted (`dynamic.py:80-102`).
- **Built once per conversation** (`agent.py:640-660`).

**verdict: already.** `thread` volatile, last (`harnessed.js:199-202`), cache mark before it (`:204-207`).

### 5 loop
- `while True: agent.step()` (`oh-sdk/conversation/impl/local_conversation.py:2122-2230`). `max_iteration_per_run=500` (`:243`) → `ERROR` + `MaxIterationsReached` (`:2211-2230`). `MaxBudgetReached` per step (`:2203-2209`).
- **StuckDetector** nudges once, then `STUCK` (`:808-833`).
- **Stop hook can veto finishing:** `run_stop()` → `should_stop=False` + feedback injected as user message, loop continues (`:2135-2160`).
- **Cancellation:** `pause()` between steps (`:2906-2915`); `interrupt()` cancels mid-LLM via `CancellationToken` checked by the parallel executor (`:2931-2945`).
- **Retry:** `num_retries=5`, `retry_min_wait=8` (`oh-sdk/llm/llm.py:379-382`).
- **Events:** `MessageEvent · ActionEvent · ObservationEvent · AgentErrorEvent · Condensation · CondensationRequest · ConversationErrorEvent · InterruptEvent`.
- **Confirmation:** an unmatched action stays in the log; next `run()` executes it as implicit approval (`oh-sdk/agent/agent.py:747-756`).

**verdict: steal** stop-veto as a `/dialogue` middleware — the home for verification in code (harness.md step 6). **skip** iteration cap (`rounds`).
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

harness.branch("/dialogue").use(async (ctx, next) => { await next(); const verdict = await ctx.mode.module.verify?.(ctx); if (verdict) ctx.output = await reenter(ctx, verdict); });
```

### 6 context economy
- **Default condenser:** `LLMSummarizingCondenser(max_size=80, keep_first=4)` (`oh-sdk/context/condenser/llm_summarizing_condenser.py:558-566`).
- **Triggers:** `REQUEST · TOKENS · EVENTS` (`:46-51`); EVENTS past `max_size`; TOKENS past `min(max_tokens, model limit)` (`:140-176`).
- **Algorithm:** keep first k, forget the middle down to `max_size//2`; summarize forgotten span with a separate LLM, record `summary_offset`; fail if <10% would be forgotten (`:73-76`); on failure retry hard reset ≤5×, shrink 0.8 (`:82-88`).
- **Event-sourced:** `Condensation(forgotten_event_ids, summary, summary_offset)` is an Event in the log (`oh-sdk/event/condenser.py:11-24`); View folds the log, drops forgotten ids, splices summary (`:91`, `oh-sdk/context/view/view.py:143` `from_events`). Nothing deleted.
- **Composition:** `PipelineCondenser([A,B,C])` stops at first `Condensation` (`pipeline_condenser.py:7-51`).
- **Reactive:** context-window or malformed-history error → `CondensationRequest` (`oh-sdk/agent/agent.py:861-905`).
- **Cache:** static block marked, dynamic not, last user/tool message = second breakpoint (`oh-sdk/llm/llm.py:3002-3030`).

**verdict: steal.** "state = reduce(events)": a condensation is a Turn row, `turn.history` folds it. Whole thread stored (F8), model sees a bounded view — closes law 9 / G9.
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

const view = (turns) => turns.reduce((seen, turn) => turn.role === "condensation" ? splice(seen, turn.meta) : [...seen, turn], []);
```

### 7 extension seam
- **Agent = serializable spec** (`oh-sdk/agent/base.py:115-312`): `llm · tools · mcp_config · filter_tools_regex · include_default_tools · agent_context · system_prompt · condenser · critic · tool_concurrency_limit`. Same JSON drives the remote agent-server.
- **Plugin layout:** `commands/ agents/ skills/ hooks/hooks.json .mcp.json` (`oh-sdk/plugin/plugin.py:36-67`).
- **Sub-agents:** `register_agent(name, factory_func, description)` (`oh-sdk/subagent/registry.py:86-106`); builtins `register_agent_if_absent`, so user/project/plugin win (`oh-tools/preset/default.py:141-150`).
- **Prompt sections:** `PromptRegistry.register` raises on duplicate; `.replace` overrides (`oh-sdk/context/prompts/registry.py:32-43`).
- **ACPAgent** hands the entire harness to an external ACP server: "The ACP server manages its own LLM, tools, and execution" (`oh-sdk/agent/acp_agent.py:1-15`, `:1832`).

**verdict: steal** ACPAgent as the far end of "each instance brings its own harness": a mode whose `/dialogue/stream` leaf proxies to an ACP endpoint. **already:** register vs replace = `open` vs `graft`.

### 8 gates
- **Hooks:** `PreToolUse · PostToolUse · UserPromptSubmit · SessionStart · SessionEnd · Stop` (`oh-sdk/hooks/types.py:9-17`); types `command · prompt · agent` (`oh-sdk/hooks/config.py:40-45`); only exit 2 blocks (`oh-sdk/hooks/executor.py:40-43`, `:569-570`); `.openhands/hooks.json` (`config.py:179-193`).
- **Risk scoring:** LLM predicts `security_risk` per non-readOnly call; analyzers `oh-sdk/security/`: llm · grayswan · ensemble · shell AST.
- **Confirmation policies:** `AlwaysConfirm · NeverConfirm · ConfirmRisky(threshold=HIGH, confirm_unknown=True)` (`oh-sdk/security/confirmation_policy.py:27-56`); hit → `WAITING_FOR_CONFIRMATION`, run breaks (`agent.py:1226-1235`).
- **Sandbox:** one Docker container per conversation (`openhands-workspace/openhands/workspace/docker/workspace.py:53-82`, `:177-203`), image `ghcr.io/openhands/agent-server:latest-python`; siblings `apptainer · cloud · remote_api · agent_sandbox`.
- **Plan preset:** glob · grep · `planning_file_editor` — view anything, edit only `PLAN.md` in `.agents_tmp/` (`oh-tools/planning_file_editor/definition.py:27-37`, `oh-tools/preset/planning.py:93-122`).

**verdict: skip** Docker at root; paladin mountpoint + `fs.resolve` refuse escape (`subsystems/paladin/gestalten/tools/fs.js:8-13`). **steal** the readOnly bit on tool edges so gates prune by data.

## Cline (sdk/packages)

### 1 tools
- **9 default names** (`cl/core/src/extensions/tools/constants.ts:12-22`): `read_files · search_codebase · run_commands · fetch_web_content · apply_patch · editor · skills · ask_question · submit_and_exit`. Team adds `spawn_agent` (`team/spawn-agent-tool.ts:121`); plan adds `switch_to_act_mode` (`cl/shared/src/prompt/cline.ts:43`).
- **Presets** (`cl/core/src/extensions/tools/presets.ts:20-111`): act 7 + team; plan = act − `editor`; search = read + search; minimal = bash only; yolo = read · bash · editor · submit.
- **Every built-in takes an array**, returns `ToolOperationResult[] = {query, result, error?, success}`; errors per item (`definitions.ts:239-251`).
- **Web:** `fetch_web_content({requests:[{url, prompt}]})`, `retryable: true, maxRetries: 2` (`:575-600`). No web_search.
- **`AgentTool` fields:** `executionMode · timeoutMs · retryable · maxRetries · successContext · policyDependencies` (`cl/shared/src/agent.ts:211-230`).
- **Output caps:** 48,000 chars command/read/search; 2,000 rows and 2,000 chars per row for reads (`executors/output-limits.ts:20-52`).
- **Parallel:** runtime default `"sequential"` (`cl/agents/src/agent-runtime.ts:629`); "Only adjacent parallel calls overlap" (`:2382-2400`).

**verdict: steal** per-edge `parallel` with adjacency — cheaper than resource locks.
```js
// subsystems/typology/gestalten/belt/hallucinate.js:111 — sketch

for (const run of adjacent(calls, (call) => edgeOf(tools, call).parallel)) settled.push(...(await Promise.all(run.map((call) => settle(policy, call)))));
```

### 2 identity
- "You are Cline, an AI coding agent." opens a 3,743 B template (`cl/shared/src/prompt/system/act.ts:1`); yolo 4,607 B. Not file-editable; host passes `systemPrompt` (`cl/shared/src/agent.ts:527`).

**verdict: skip.**

### 3 instructions
- Template ends `{{CLINE_RULES}} {{CLINE_METADATA}}` (`act.ts:35-36`).
- **Config dirs:** `.clinerules` (deprecated) · `.cline/` · `.claude/` (skills only) · `.agents/`, subdirs `rules skills workflows hooks agents plugins`, + `AGENTS.md` (`cl/shared/src/storage/paths.ts:34-57`; `user-instruction-config-loader.ts:563-581`).
- **Rules injected as an extension**, same merge as user plugins (`runtime-builder.ts:570-596`). No size budget.

**verdict: already** (`harnessed.js:46-54`).

### 4 world model
- **`<env>`, 4 rows:** Platform · Date · IDE · Working Directory (`act.ts:7-13`).
- **Each user message carries its mode:** `<user_input mode="plan|act|yolo">` + `<mode_notice>` at a switch; "the newest message's mode is what governs right now" (`cl/shared/src/prompt/cline.ts:17`).

**verdict: steal** the mode stamp — model never sees `Turn.mode` today (m84 build-list 5).
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

const stamped = (turn) => turn.role === "user" ? { ...turn, parts: [{ type: "text", text: `<turn mode="${turn.mode.reference}">` }, ...turn.parts] } : turn;
```

### 5 loop
- **Unbounded by default:** `while (maxIterations === undefined || iteration < maxIterations)` (`cl/agents/src/agent-runtime.ts:850-851`); exhaustion throws (`:1039`).
- **Provider retry:** 3, 1 s doubling, 15 s cap, transient only (`:76-90`); **backoff cancellable:** "a retry backoff never blocks cancellation" (`:1347-1352`); context overflow forces compaction via `prepareTurn`, then retries (`:1372-1392`).
- **Abort:** `AbortController` per run (`:650-665`); tools get `signal` (`cl/shared/src/agent.ts:201`).
- **Events** (`cl/shared/src/agent.ts:638+`): `run-started · message-added · turn-started · assistant-text-delta · assistant-reasoning-delta · assistant-media · assistant-message · tool-call-delta · tool-started · tool-updated · tool-finished · usage-updated · status-notice · turn-finished · run-finished · run-failed`; every event carries a `snapshot`.
- **No tool call = done:** "Response without tool calls will considered as completed" (`act.ts:30`).

**verdict: steal** cancellable backoff; vivalence's sleep is a bare `setTimeout` (`hallucinate.js:77`).
```js
// subsystems/typology/gestalten/belt/hallucinate.js:77 — sketch

await new Promise((resolve, reject) => { const timer = setTimeout(resolve, delay); signal?.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); }, { once: true }); });
```

### 6 context economy
- **Off unless `compaction.enabled === true`** (`cl/core/src/extensions/context/compaction.ts:290`). Strategy `agentic` → `basic` fallback (`:297`, `:501-584`). Trigger `COMPACTION_TRIGGER_RATIO = 0.9` (`compaction-shared.ts:19`); target 0.5 (`compaction.ts:101`).
- **Summary must carry `readFiles` / `modifiedFiles`** (`compaction-shared.ts:40-41`); persists to a sidecar (`local-runtime-host.ts:843-856`). Hook `PreCompact` (`hook-file-config.ts:26`).
- **Cache:** top-level `cache_control: {type:"ephemeral"}` (`cl/llms/src/providers/routing/anthropic-compatible.ts:99-108`, `:400`).

**verdict: steal** the forced section: a condensation turn carries the entity ids it touched as data.

### 7 extension seam
- **Extension shape:** `AgentExtension { name, manifest:{capabilities}, hooks, setup(api, ctx) }` (`cl/shared/src/agents/types.ts:519-528`).
- **Register API**, capability-gated (`cl/shared/src/extensions/contribution-registry.ts:125-144`): `registerTool · registerCommand · registerRule · registerMessageBuilder · registerProvider · registerAutomationEventType · registerMcpServer`. `registerMessageBuilder` rewrites `Message[]` before send.
- **Hooks:** `beforeRun · afterRun · beforeModel · afterModel · beforeTool · afterTool · onEvent`, arrays in registration order (`agent-runtime.ts:329-333`, `:750-754`; `contribution-registry.ts:670`). `beforeTool` returns `{skip, stop, reason, input, policy, appendContext}` (`cl/shared/src/agent.ts:436-449`).
- **Plugin isolation:** `SubprocessSandbox` / `WorkerSandbox` (`plugin-sandbox.ts:18-19`).
- **Discovery:** `.cline/plugins` vs `.agents/plugins/<x>/plugin.json`; manifest file a hard stop between the two (`paths.ts:59-72`).
- **File hooks:** `TaskStart · TaskResume · TaskCancel · TaskComplete · TaskError · PreToolUse · PostToolUse · UserPromptSubmit · PreCompact · SessionShutdown` (`hook-file-config.ts:17-44`).
- **Core policies ride the same seam:** plan guard and user instructions are injected extensions (`runtime-builder.ts:593-600`).

**verdict: already.** One `(ctx, next)` covers before + after (`harnessed.js:98-102`). **steal** only the capability manifest: an instance declares `tools · primer · carry · gates`; root refuses an undeclared graft loudly.

### 8 gates
- **Plan mode blocks edits in code:** plan preset drops `editor` (`presets.ts:45-57`); `run_commands` stays, guarded by a `beforeTool` extension returning `{ skip: true, reason }` (`command-guard-extension.ts:42-88`); "`skip`, not `stop`" (`:15`): the run continues.
- **Blocklist** on command tokens (`command-guard.ts:479-505`): rm/mv/cp · `sed -i` · redirection outside /tmp · working-tree VCS changes · installs. Error text: "Command not executed: … file modifications are blocked in plan mode." (`:514-519`).
- **Mode switch:** "Mode switches rebuild the runtime, so the guard appears/disappears with the mode" (`runtime-builder.ts:578-584`); prompt contract `cline.ts:28-53`.
- **Approval:** `ToolPolicy {enabled, autoApprove}` (`cl/shared/src/llms/tools.ts:7-16`); yolo `"*"` (`presets.ts:139-160`). `beforeTool` runs before approval, so a blocked call never prompts (`command-guard-extension.ts:12-15`).
- **Isolation:** agent commands on host shell unsandboxed; only plugins sandboxed.

**verdict: steal.** Prune write routes + one gated middleware: the gate is grafted or absent.
```js
// systems/runtime/subjects/mode/traits/harnessed.js:arming — sketch

if (ctx.mode.implements("PLANNING")) {
  for (const nature of ["/fs/write", "/fs/move", "/fs/delete"]) armed.trie.get("/fs")?.trajectory.trie.delete(nature);
  armed.branch("/shell/run").use(async (ctx, next) => { const mutation = mutating(ctx.input.command); if (mutation) ctx.output = { condition: "ERROR", message: `${mutation} not run — plan mode; put it in the plan` }; else await next(); });
}
```

## Deep Agents (langchain-ai/deepagents)

### 1 tools
- **`FilesystemMiddleware`** contributes `ls · read_file · write_file · edit_file · delete · glob · grep · execute` (`da/middleware/filesystem.py:2106-3394`); `SubAgentMiddleware` adds `task`. Total 9; docstring lists 8, missing `delete` (`da/graph.py:312-316`).
- **No `write_todos` in core:** `TodoListMiddleware` only in the `openai:codex` profile (`profiles/harness/_openai_codex.py:72-73`).
- **No web tools in core:** `web_search` / `fetch_url` CLI-only (`libs/code/deepagents_code/tools.py:411`, `:503`).
- **Unsupported tools pruned:** "filtered out of the request rather than advertised to the model and left to fail" (`filesystem.py:3405-3421`).
- **Backends:** `StateBackend` (default, `da/graph.py:672`) · `FilesystemBackend` · `LocalShellBackend` · `CompositeBackend` · `LangSmithSandbox`. Partner sandboxes `libs/partners/{daytona,modal,quickjs,runloop,vercel}`.
- **Errors:** `ToolMessage(status="error")` (`filesystem.py:200`).
- **Large results:** over `tool_token_limit_before_evict=20000` tokens (4 chars/token) → written to `/large_tool_results/`, replaced by head+tail preview (`:1939`, `:2036`, `:1134`; `_message_eviction.py:1-9`).
- **Per-model description overrides** (`da/_tools.py:23-30`).

**verdict: steal both.** Arm a tool only where it can run; evict large output to a file.
```js
// subsystems/typology/gestalten/belt/hallucinate.js:speak — sketch

const evicted = async (ctx, output) => size(output) < LIMIT ? output : { message: `${head(output)}\n… ${size(output)} chars at ${await park(ctx, output)} — fs_read it` };
```

### 2 identity
- **No default base prompt:** "the main agent (which has no default base prompt)" (`harness_profiles.py:792`); `_apply_profile_prompt(_profile, "")` (`da/graph.py:674`). Legacy "You are a deep agent…" deprecated 0.7.0 (`:83`, `:130-142`).
- **Identity = caller prompt + per-model profile:** `base_system_prompt` replaces, `system_prompt_suffix` appends (`harness_profiles.py:783-801`); keyed `provider:model`.
- **Example:** `anthropic:claude-sonnet-4-6` adds only a suffix: `<use_parallel_tool_calls> <investigate_before_answering> <tool_result_reflection>` (`_anthropic_sonnet_4_6.py`, 3,162 B).

**verdict: steal.** Empty root; model quirks attached to the faculty.
```js
// systems/runtime/subjects/mode/traits/harnessed.js:priming — sketch

if (ctx.faculty?.primer) primer.graft(ctx.faculty.primer);
```

### 3 instructions
- **`MemoryMiddleware(sources=[…])`** loads AGENTS.md (`~/.deepagents/AGENTS.md`, `./.deepagents/AGENTS.md`) as `<agent_memory>` (`memory.py:1-27`, `:104`); agent edits it with `edit_file`.
- **`SkillsMiddleware`:** progressive disclosure over `SKILL.md`, description ≤1024 (`skills.py:3`, `:23-50`).
- **No discovery:** sources explicit, list order.

**verdict: already** (`harnessed.js:93`, `shape/primer.js:29-31`).

### 4 world model
- **No cwd, OS or date** in core. Only CompositeBackend host-path routing when `execute` is active (`filesystem.py:3432-3442`); with `StateBackend` the virtual FS lives in graph state.

**verdict: skip.**

### 5 loop
- **Delegated upstream:** LangChain `create_agent`, `recursion_limit: 9_999` (`da/graph.py:1012-1035`). Parallel calls in the LangGraph ToolNode (not in repo).
- **History:** `DeltaChannel` reducer, snapshot every 50, "O(N²) to O(N)" (`graph.py:77-80`).
- **Hook points:** `before_agent · before_model · wrap_model_call · after_model · wrap_tool_call` (`filesystem.py:3451`, `:3891`).
- **Repair:** `PatchToolCallsMiddleware` fixes dangling calls (`patch_tool_calls.py:17`).

**verdict: already.** `wrap_model_call(request, handler)` is `(ctx, next)` (`harnessed.js:220-226`).

### 6 context economy
- **Summarization in every stack** (`summarization.py:1922`): with a profile trigger `("fraction", 0.85)`, keep `("fraction", 0.10)`; without, `("tokens", 170000)`, keep 6 messages (`:301-329`).
- **Evicted history kept:** offloaded to `/conversation_history/{session_id}.md` (`:44`); old `write_file` / `edit_file` args clipped first (`:1947`).
- **`compact_conversation` tool:** model triggers compaction itself (`:10`, `:142`). Overflow fallback: reactive tail-clip.
- **Cache middleware placement:** after profile, before memory, "so that memory updates … don't invalidate the Anthropic prompt cache prefix" (`graph.py:946-966`).

**verdict: steal** `compact_conversation` as a `thread` tool that chains a condensation Turn. **already:** cache mark before volatile sections (`harnessed.js:204-207`).

### 7 extension seam
- **User middleware merged by name** (`da/graph.py:216-256`): matching `.name` replaces that slot in place; new name spliced after the last core entry, ahead of the tail.
- **Main stack order** (`:910-1001`):
```
// libs/deepagents/deepagents/graph.py:910-1001

Filesystem · SubAgent(task) · _ParentNotifier · Summarization · PatchToolCalls · [AsyncSubAgent]
── user middleware lands here ──
profile.extra · Skills · PromptCaching · Memory · HumanInTheLoop · UnsupportedContent · ModelRefusal
── exclude · merge custom · exclude · _ToolExclusion LAST
```
- **Required set:** `_REQUIRED_MIDDLEWARE = (FilesystemMiddleware, SubAgentMiddleware)`; excluding one raises (`:259-270`); an exclusion matching nothing raises (`:1006-1012`).
- **Tool exclusion runs last**, "cannot be restored by a custom wrap_model_call" (`:878-880`, `:999-1001`).
- **Sub-agents** get their own stack the same way (`:800-907`); general-purpose sub-agent inherits only user middleware overriding one of its slots (`:868-871`).
- **`HarnessProfile` fields:** `base_system_prompt · system_prompt_suffix · tool_description_overrides · excluded_tools · excluded_middleware · extra_middleware · general_purpose_subagent`; declarative YAML/JSON (`harness_profiles.py:192-308`, `:483-715`).
- **ACP adapter:** `libs/acp/deepagents_acp`.

**verdict: steal (rank 1).** `graft` only concatenates `carry` (`subsystems/typology/prototypes/vector.js:57-70`), so an instance can add a step but never replace `summarizing` or `chaining`. Key the slots by function name.
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

const merge = (core, tail, carry) => {
  const named = new Map(carry.map((middleware) => [middleware.name, middleware]));
  const fresh = carry.filter((middleware) => ![...core, ...tail].some((slot) => slot.name === middleware.name));
  return [...core.map((slot) => named.get(slot.name) ?? slot), ...fresh, ...tail.map((slot) => named.get(slot.name) ?? slot)];
};
```

### 8 gates
- **Permission rule:** `FilesystemPermission(operations=["read"|"write"], paths, mode="allow"|"deny"|"interrupt")` (`filesystem.py:169`, `:375-405`, `:662`); first match wins; paths start with `/`; checked against the path and its symlink target (`:378-380`).
- **`interrupt`** via `HumanInTheLoopMiddleware` (`graph.py:968-973`). Bulk tools (ls · glob · grep) fire on any overlap with a protected prefix (`filesystem.py:393-398`).
- **Sandbox = backend choice;** default `StateBackend` no host access; `FilesystemBackend(root_dir="/")` warns "ensure the agent is running within a sandbox OR add human-in-the-loop" (`memory.py:19-21`).
- **No plan mode.**

**verdict: steal** the three-valued `allow|deny|interrupt` rule, first match wins. Maps onto PAUSED/consent (`systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:155`); an `interrupt` returns a suspension value rather than blocking.

## comparative — the three side by side

| axis | OpenHands | Cline | Deep Agents | best for a near-empty root |
|---|---|---|---|---|
| 1 default tools | 4 +browser | 7 act / 6 plan of 9 | 9 | DA pruned |
| 1 parallel | limit=1 · locks | sequential · `executionMode` | ToolNode | Cline adjacency |
| 1 web | browser · MCP | fetch_web_content | — | Cline |
| 1 error shape | AgentErrorEvent | per-item `{error,success}` | ToolMessage error | already |
| 2 identity bytes | 101 + ~15.6 KB (19 sections) | 3,743 | 0 + suffix | DA |
| 2 user-editable | SOUL.md · persona | systemPrompt | profile | OH SOUL.md |
| 3 discovery | AGENTS/CLAUDE/GEMINI.md · .cursorrules · .agents/skills | .cline · .clinerules · .agents · .claude · AGENTS.md | explicit | DA |
| 4 env rows | 2 (datetime · secret names) | 4 | 0 | Cline + mode stamp |
| 5 cap | 500 · budget · stuck | ∞ | 9,999 | already (rounds) |
| 5 retry | 5 × ≥8 s | 3 × 1–15 s, cancellable | upstream | Cline |
| 6 trigger | 80 events · tokens · request | 0.9 opt-in | 0.85 / 0.10 | DA |
| 6 algorithm | Condensation event | agentic › basic + files | summary + .md + tool | OH |
| 6 cache marks | 2 | 1 top-level | before memory | already |
| 7 seam | spec JSON · plugin · ACPAgent | 7 register* · 7 hooks | by-name merge | DA |
| 7 order | registry replace | registration | core · user · tail · exclusion | DA |
| 8 sandbox | Docker per conversation | none (plugins only) | backend | skip |
| 8 rules | exit 2 · ConfirmRisky | beforeTool skip · ToolPolicy | allow · deny · interrupt | DA + Cline |
| 8 plan | PLAN.md only | − editor + guard | — | Cline |

## steal list — ranked, ≤10

1. **Named middleware slots, merged by name.** Deep Agents `da/graph.py:216-256`, `:259-270`, `:999-1001`. An instance can replace a root step, not only stack on it (m84 L).
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

const core = [normalizing, claiming, activating, requesting];
const carry = [...(context.domain?.harness?.carry ?? []), ...(mode.module.harness?.carry ?? [])];
for (const middleware of merge(core, [summarizing], carry)) harness.use(middleware);
```
2. **Empty root identity + per-model profile overlay.** Deep Agents `harness_profiles.py:783-801`, `da/graph.py:674`.
3. **Event-sourced condensation.** OpenHands `oh-sdk/event/condenser.py:11-24`, `oh-sdk/context/view/view.py:143`, `pipeline_condenser.py:44-51`. Closes G9 without deleting a row.
```js
// systems/runtime/subjects/mode/traits/harnessed.js:chaining — sketch

ctx.hallucination.turns = view(await ctx.entities.turn.history({ thread: ctx.input.thread }));
```
4. **Plan gate: prune write routes + one `skip` middleware on shell.** Cline `command-guard-extension.ts:42-88`, `presets.ts:45-57`, `runtime-builder.ts:578-596`.
5. **Capability-pruned tools.** Deep Agents `da/middleware/filesystem.py:3405-3421`.
```js
// systems/runtime/subjects/mode/traits/harnessed.js:arming — sketch

if (paladin.scope.shell) armed.graft(paladin.tools.shell.shell);
```
6. **Mode stamp on every user turn.** Cline `cl/shared/src/prompt/cline.ts:17`.
7. **Per-tool `parallel` with adjacency.** Cline `cl/agents/src/agent-runtime.ts:2382-2400`, `cl/shared/src/agent.ts:222-223`.
8. **Evict large tool results to a file.** Deep Agents `filesystem.py:1939`, `:2036`, `_message_eviction.py`.
9. **Cancellable retry backoff.** Cline `agent-runtime.ts:1347-1352`.
10. **allow · deny · interrupt rules + a readOnly edge bit.** Deep Agents `filesystem.py:375-405`, OpenHands `oh-sdk/tool/tool.py:215-245`.
```js
// systems/runtime/subjects/mode/traits/harnessed.js — sketch

const RULES = [[(call) => call.write && under(call.path, "/secrets"), "deny"], [(call) => call.write, "interrupt"], [() => true, "allow"]];
```
