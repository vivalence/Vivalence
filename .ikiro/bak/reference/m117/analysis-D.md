<!-- limit: 40000 chars · m117 evidence 2026-11-07, agents opus · reference, read-only -->
# analysis D — Pi · mini-swe-agent · Aider

Sources fetched 2026-11-07 from raw.githubusercontent HEAD (copies in scratchpad/srcD/). vivalence root = `systems/runtime/subjects/mode/traits/harnessed.js` (HARNESSED L215–263, arming L76–102); loop = `subsystems/typology/gestalten/belt/hallucinate.js`.

## Pi (earendil-works/pi)

### 1 tools
- 8 built-ins exist; 4 on by default: `read · bash · edit · write`.
  - `tools/index.ts:95-105`: `ToolName = "read" | "bash" | "powershell" | "edit" | "write" | "grep" | "find" | "ls"`.
  - `system-prompt.ts:64`: `selectedTools: [...(input.selectedTools ?? ["read", "bash", "edit", "write"])]`.
  - read-only preset `read grep find ls` (`tools/index.ts:173-180`).
- Schemas (TypeBox):
  - read `read.ts:14-18`: `path` "Path to the file to read (relative or absolute)", `offset?` "Line number to start reading from (1-indexed)", `limit?` "Maximum number of lines to read".
  - bash `bash.ts:39-42`: `command` "Shell command to execute", `timeout?` "Timeout in seconds (optional, no default timeout)".
  - edit `edit.ts:18-38`: `path`, `edits: [{ oldText` "Exact text for one targeted replacement. It must be unique in the original file and must not overlap with any other edits[].oldText in the same call.", `newText` "Replacement text for this targeted edit." `}]`.
  - write `write.ts:10-13`: `path`, `content` "Content to write to the file".
- ToolDefinition fields (`extensions/types.ts:600-675`): `name · label · description · promptSnippet? · promptGuidelines? · parameters · outputSchema? · exposure? · executionMode? · prepareArguments? · execute(id, params, signal, onUpdate, ctx)`.
- Each tool brings its own prompt text. `promptSnippet` → the tool's row in `<tools>`; `promptGuidelines` → bullets in `<rules>`. Both appear only while the tool is active (`system-prompt.ts:118-121,157-161`). `read.ts:20-23`: `snippet: "Read file contents", guidelines: ["Use read to examine files instead of cat or sed."]`.
- Results: `{content, details, structuredContent}`. bash output schema `output · truncated · full_output_path? · exit_code · wall_time_seconds` (`bash.ts:55-61`). Output cut at 2000 rows / 50 KB (`truncate.ts:11-12`); bash keeps the tail and writes full output to a temp file whose path it reports (`bash.ts:380`).
- Errors: thrown → `createErrorToolResult(msg)` `isError: true` (`agent-loop.ts:855-864`); unknown tool → "Tool X not found" (`:727-733`); model hit length limit → all its tool calls failed rather than run truncated (`:271-279`).
- Parallel by default; serial if config `toolExecution: "sequential"` or any called tool has `executionMode: "sequential"` (`:526-532`).
- No web/fetch/search/browser in core — extensions or MCP.

verdict: **steal** per-tool guidelines; **steal** exact-replace `edit` — vivalence fs (`subsystems/paladin/gestalten/tools/fs.js:39-195`) = tree · find · read · write · stat · move · delete, no edit, no content grep.
```js
{ nature: "/fs/edit", valence: "…", guidelines: ["Each edits[].old must match the file exactly once."],
  input: v.object({ path: PATH("the file"), edits: v.array(v.object({ old: v.string(), new: v.string() }), { minItems: 1 }) }) }
primer.open("rules", (ctx) => steer.trie.rollup(ctx.tools, (e) => e.guidelines ?? []).flat().map((g) => `- ${g}`).join("\n"))
```

### 2 identity
- One sentence, 126 B (`system-prompt.ts:155-156`): "You are a coding assistant running inside pi, a coding agent harness. Help users inspect files, run commands, and modify code."
- Default prompt ≈2.1 KB, 5 sections: `preamble · tools · rules · docs · cwd` (rebuilt with the 4 default tools). `docs` ≈1.1 KB points at Pi's own docs.
- Override: `.pi/SYSTEM.md` (trusted project) or `<agentDir>/SYSTEM.md` replaces the preamble; `APPEND_SYSTEM.md` added as `<addendum>` (`resource-loader.ts:1245-1268`; `system-prompt.ts:152-171`).

verdict: **already** — persona is a mode-supplied primer section (`harnessed.js:47-53`).

### 3 instructions
- Per directory, first of `AGENTS.override.md, AGENTS.md, AGENTS.MD, CLAUDE.md, CLAUDE.MD` (`resource-loader.ts:212-213`). Order: global agentDir first, then ancestors root→cwd (`:261-301`); worktree duplicates dropped (`:233-258`). Each wrapped `<project_instructions path>` inside `<project_context>` (`system-prompt.ts:79-86`).
- Skills from `<agentDir>/skills` and `<cwd>/.pi/skills` (`resource-loader.ts:1023-1029`); only a listing goes in the prompt, body read on demand (`system-prompt.ts:173-181`).
- Instructions as code: `before_agent_start` can change sections or replace the whole prompt (`runner.ts:1434-1484`).
- No size budget found.

verdict: **already** — lazy sections + `primer_read` (`gestalten/tools/primer.js`, `shape/primer.js:29-46`). **skip** AGENTS.md walk at root — a coding instance's harness.

### 4 world model
- Only cwd in the prompt (`:182`). No date, OS, git, tree. bash guideline mentions `PI_*` env (`bash.ts:44-47`).
- Each run rebuilds the prompt and diffs against the previous; only changed sections recorded as a patch system message (`system-prompt.ts:216-228`, `agent-session.ts:1828-1840`). Tool add/remove recorded as `toolsAdded/toolsRemoved` (`agent-loop.ts:342-375`).

verdict: **steal** the section diff — vivalence rebuilds whole system prompt per call (`harnessed.js:209-214`).
```js
const patch = Object.fromEntries(Object.entries(system).filter(([k, s]) => ctx.thread.trait.PRIMED?.[k] !== s));
```

### 5 loop
- `runLoop` (`agent-loop.ts:172-330`): outer `while(true)` for follow-ups around inner `while (hasMoreToolCalls || pending)`.
- Turn: `prepareNextTurn` → steering check → declare tool changes → `prepareRequest` → stream → run tool calls → `finishTurn` (end | continue).
- No round cap. Stops when: no tool calls; `finishTurn` end; every call in a batch returns `terminate` (`:700-702`); stream error/abort (`:254-265`).
- Steering: user messages typed mid-run injected between turns (`:185,213,302`); follow-ups when the agent would stop (`:311-316`).
- Abort: one `AbortSignal` to the stream and every `tool.execute` (`:838-846`).
- Events: 10 (`agent/src/types.ts:530-546`); tools stream partials via `onUpdate`.
- Retry: 3, 2000 ms base, 60 s cap (`settings-defaults.ts`).

verdict: **steal** steering + per-tool sequential flag; vivalence runs every call serially (`hallucinate.js:108-111`, comment: em forks). **already**: abort (`hallucinate.js:82-87`), stream grammar (harness.md §2.6), `rounds`.
```js
if (calls.some((c) => edgeOf(policy.tools, c).sequential)) return serial(policy, calls);
return Promise.all(calls.map((c) => settle(policy, c)));
```

### 6 context economy
- Compaction when context > window − `reserveTokens` 16384 (`compaction.ts:267-269`); keeps ≈20000 recent tokens, cuts at a turn boundary (`:431-472`).
- Summary with 6 fixed headings: Goal · Constraints & Preferences · Progress · Key Decisions · Next Steps · Critical Context (`:507-540`); later compactions update the previous summary (`:577`).
- Extension can cancel or supply its own via `session_before_compact` (`types.ts:1532-1535`).

verdict: **steal** — vivalence history unbounded (harness.md law 9).
```js
harness.branch("/dialogue").use(compacting({ reserve: 16384, keep: 20000 }));
```

### 7 extension seam
- Extension = module exporting `ExtensionFactory = (pi: ExtensionAPI) => void|Promise<void>` (`types.ts:2094`); factory throws → everything it registered discarded (`loader.ts:633-641`).
- Discovery: `<cwd>/.pi/extensions` → `<agentDir>/extensions` → configured paths; dir loads via `package.json` `"pi.extensions"` or `index.ts|js`, one level (`loader.ts:756-801,840-880`).
- API (`types.ts:1638-1960`): 41 events via `on()` (session_* / context / before_agent_start / turn / message / tool_execution / tool_call / tool_result / user_bash / input / provider); `registerTool · registerCommand · registerShortcut · registerFlag · sendMessage(deliverAs steer|followUp|nextTurn) · exec · setActiveTools · setModel · registerProvider · registerMcpServer · registerVirtualModel`.
- Precedence: extension tool replaces a built-in of the same name (`agent-session.ts:3715-3718`); between extensions first registered wins (`runner.ts:637-646`); `tool_call` first blocker wins (`:1256-1273`); `before_agent_start` chain, a returned `systemPrompt` replaces whole prompt (`:1434-1484`); `context` handlers rewrite the message list in chain (`:1312-1340`).
- Core keeps: loop, 8 tools, sessions, compaction. MCP, web, permissions, subagents → extensions.

verdict: **already** — graft of `context.domain.harness` · `mode.module.harness` (`harnessed.js:241-242`), tools grafted (`:85-97`); `use` middleware = Pi's 41 events. **steal** two rules: instance tool overrides root tool of same name, stated; a `tool_call`-style gate as middleware on the armed vector, first refusal wins.
```js
export const tools = new Vector().use(async (ctx, next) => refused(ctx) ? { condition: "ERROR", output: { message: "blocked: …" } } : next());
```

### 8 gates
- No permission system. Only block point: `tool_call` event (`agent-loop.ts:738-765` → `runner.ts:1256-1273`) returning `{block, reason, terminate}`.
- Project `SYSTEM.md` / `APPEND_SYSTEM.md` loaded only if trusted (`resource-loader.ts:1247,1261`); default `defaultProjectTrust "ask"`. Project extensions trust-gated: not verified.
- No sandbox, no plan mode.

verdict: **already** — root has no gate; R2 stricter. Gates stay with the instance.

## mini-swe-agent

### 1 tools
- One tool (`actions_toolcall.py:11-27`): `{"name": "bash", "description": "Execute a bash command", "parameters": {"type": "object", "properties": {"command": {"type": "string", "description": "The bash command to execute"}}, "required": ["command"]}}`.
- Text mode: one fenced block per reply tagged `mswea_bash_command` (`default.yaml:5-14`).
- Result `{output, returncode, exception_info}` as JSON. Output > 10000 chars → 5000 head + 5000 tail + `elided_chars` + "Output too long." (`mini.yaml:112-128`).
- Errors: nonzero rc = data; exception → rc −1 + `exception_info` (`local.py:31-41`); malformed/unknown/missing call → `FormatError` → user message (`actions_toolcall.py:40-74`).
- Multiple calls in one reply run serially (`default.py:156`); unrun ones filled "action was not executed".
- Fresh subshell per command; default timeout 30 s kills the process group (`local.py:16,72-92`).

verdict: **already** — `/shell/run` (`shell.js:22-51`) returns code as data, 8000 B tail. **steal** head + tail.

### 2 identity
- One row, 63 B: "You are a helpful assistant that can interact with a computer." (`mini.yaml:2-3`). Everything else in the first user message (config file 5228 B).

verdict: **steal** the split: root keeps a one-sentence system prompt; task in first user turn → cached prefix identical across instances.

### 3 instructions
- No discovery. Fixed text in the first message: 6-step workflow, execution rules, example (`mini.yaml:9-49`). Rules in code by subclassing (`default.py:126-157`).

verdict: **skip**.

### 4 world model
- Template vars = config ∪ `platform.uname()` ∪ `os.environ` ∪ kwargs (`local.py:58-59`).
- `<system_information>{{system}} {{release}} {{version}} {{machine}}</system_information>` (`mini.yaml:51-53`) + macOS `sed -i ''` note (`:69-73`).
- Env pinned non-interactive: `PAGER=cat MANPAGER=cat LESS=-R PIP_PROGRESS_BAR=off TQDM_DISABLE=1` (`:104-110`).
- Rendered once, never refreshed.

verdict: **steal** pinned env for `/shell/run` + an OS row in the root primer.

### 5 loop — verbatim `agents/default.py:88-157`
```python
    def run(self, task: str = "", **kwargs) -> dict:
        self.extra_template_vars |= {"task": task, **kwargs}
        self.messages = []
        self.add_messages(
            self.model.format_message(role="system", content=self._render_template(self.config.system_template)),
            self.model.format_message(role="user", content=self._render_template(self.config.instance_template)),
        )
        while True:
            try:
                self.step()
                self.n_consecutive_format_errors = 0
            except FormatError as e:
                self.cost += e.messages[0].get("extra", {}).get("cost", 0.0)
                self.n_consecutive_format_errors += 1
                if 0 < self.config.max_consecutive_format_errors <= self.n_consecutive_format_errors:
                    self.add_messages(*e.messages, {"role": "exit", "content": "RepeatedFormatError",
                                                    "extra": {"exit_status": "RepeatedFormatError", "submission": ""}})
                else:
                    self.add_messages(*e.messages)
            except InterruptAgentFlow as e:
                self.add_messages(*e.messages)
            except Exception as e:
                self.handle_uncaught_exception(e)
                raise
            finally:
                self.save(self.config.output_path)
            if self.messages[-1].get("role") == "exit":
                break
        return self.messages[-1].get("extra", {})

    def step(self) -> list[dict]:
        return self.execute_actions(self.query())

    def query(self) -> dict:
        if 0 < self.config.step_limit <= self.n_calls or 0 < self.config.cost_limit <= self.cost:
            raise LimitsExceeded({"role": "exit", "content": "LimitsExceeded", "extra": {"exit_status": "LimitsExceeded", "submission": ""}})
        if 0 < self.config.wall_time_limit_seconds <= int(time.time() - self._start_time):
            raise TimeExceeded({"role": "exit", "content": "TimeExceeded", "extra": {"exit_status": "TimeExceeded", "submission": ""}})
        self.n_calls += 1
        message = self.model.query(self.messages)
        self.cost += message.get("extra", {}).get("cost", 0.0)
        self.add_messages(message)
        return message

    def execute_actions(self, message: dict) -> list[dict]:
        outputs = [self.env.execute(action) for action in message.get("extra", {}).get("actions", [])]
        return self.add_messages(*self.model.format_observation_messages(message, outputs, self.get_template_vars()))
```
- Control flow = exceptions carrying messages: `InterruptAgentFlow` → `Submitted · LimitsExceeded · TimeExceeded · UserInterruption · FormatError` (`exceptions.py:1-26`).
- Ends when first output row is `COMPLETE_TASK_AND_SUBMIT_FINAL_OUTPUT` and rc 0 (`local.py:45-56`).
- Budgets: `step_limit` 0, `cost_limit` 3.0, wall 0, ≤3 consecutive format errors (`default.py:26-33`). No streaming, no abort. Retry 10, backoff 4–60 s (`retry.py:19-25`). Trajectory saved every step.

verdict: **steal** cost + wall-time budget beside `rounds` — the only enforced limit today (`hallucinate.js:129`).

### 6 context economy
- None by design; long outputs elided. `default_end` cache mode = one mark on the last message (`cache_control.py:49-67`), off by default.

verdict: **already** — two marks (`harnessed.js:204-207`). **steal** a rolling mark on the last message as a third.

### 7 extension seam
- Three Protocols: `Model`, `Environment`, `Agent` (`__init__.py:14-51`). Subclass or swap the environment class. No hooks, no MCP.

verdict: **skip** mechanism; **steal** the Environment/Model split: `/shell/run` with a swappable executor (local · docker · remote).

### 8 gates
- `InteractiveAgent` modes human · confirm · yolo, confirm default (`interactive.py:24-30`). `whitelist_actions` regexes skip confirm (`:162-163`). `confirm_exit`; a rejection → human mode (`:177`). Sandbox = another environment class.

verdict: **steal** the three-mode dial + allowlist as middleware on `/shell/run`; PAUSED controller could carry the confirm (`control.js:13`).

## Aider

### 1 tools
- No tool calls. Edits are text, one Coder per edit format (`coders/__init__.py`). editblock = path + `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` (`editblock_prompts.py:8-31`).
- Shell: model suggests `bash` blocks, each needs `confirm_ask(explicit_yes_required=True)`; adding output needs a second confirm (`base_coder.py:2450-2484`).
- Web: user runs `/web` or confirms a URL in their message (`:965-983`). 43 `/` commands (`commands.py`).
- Errors return as the next user message: "SearchReplaceNoExactMatch: This SEARCH block failed to exactly match lines in {path}" (`editblock_coder.py:84-114`) via `reflected_message` (`base_coder.py:2305-2316`).

verdict: **skip** text edits; **steal** the "did you mean" miss message for `/fs/edit`.

### 2 identity
- "Act as an expert software developer." (`editblock_prompts.py:8`) + lazy/overeager reminders per model (`base_prompts.py:12-20`, `base_coder.py:1175-1179`). Prompt file ≤5.7 KB.

verdict: **steal** reminder sections keyed by model, not tier.

### 3 instructions
- No discovery. Convention files via `--read` as read-only (`args.py:736`; `base_prompts.py:50-52`). `.aider.conf.yml`. `system_reminder` re-sent at the end of the prompt (`base_coder.py:1292-1327`).

verdict: **steal** a primer section rendered after the turns (`place: "tail"`).

### 4 world model
- `get_platform_info`: platform · shell · language · date · in-git · lint/test commands (`base_coder.py:1127-1172`).
- Repo map (`repomap.py`): tree-sitter tags of defs/refs, cached by mtime (`:29,43,217-233`); edge weight `mul × sqrt(refs)` (`:480-512`), mul ×10 mentioned in message, ×10 long names, ×0.1 `_private` or defined in >5 files, ×50 referencing file in chat; personalized PageRank (`:374-445,519-529`); binary search to fit within 15% of budget (`:676-705`); budget 1024 tokens, ×8 with no files in chat (`base_coder.py:311`; `repomap.py:56,122-131`); refresh auto · always · files · manual (`:592-612`); sent as a user/assistant pair "treat them as *read-only*" (`base_coder.py:741-750`; `base_prompts.py:45-48`).

verdict: **steal** the pattern: ranked index of what exists, weighted by mentions, fitted to a budget — entities and modes, not files.
```js
primer.open({ nature: "world" }, async (ctx) => fit(rank(await index(ctx), mentions(ctx.input.parts)), 4096));
```

### 5 loop
- `run_one` (`base_coder.py:924-944`) loops while a reflected message exists, ≤ `max_reflections` 3. After each reply: apply edits → auto-commit → lint → shell → tests (`:1585-1624`). Retry 0.125 s doubling (`:1449-1487`). Ctrl-C adds "^C KeyboardInterrupt" + "I see that you interrupted my previous reply." to history (`:1577-1585`).

verdict: **already** — the tool loop does reflections. **steal** recording the interrupt in history: vivalence closes an aborted turn with `abort` (`hallucinate.js:131`) but the model never sees it.

### 6 context economy
- Order: system · examples · read-only files · repo map · done · chat files · current · reminder (`chat_chunks.py:16-26`). Three cache marks: after examples (or system), after repo map (or read-only), after chat files (`:28-41`); `warm_cache` pings (`base_coder.py:1340-1360`).
- Old history summarized in a background thread; swapped in only if history unchanged (`:1002-1034`); tail under half budget, rest recursive ≤3 levels (`history.py:33-80`).

verdict: **steal** background swap as compaction strategy. **already**: marks stable→volatile.

### 7 extension seam
- None. Coder subclasses + architect→editor two-model handoff.

verdict: **skip**.

### 8 gates
- Seven `confirm_ask` points: create file, add file, add URL, run shell (explicit yes even with `--yes-always`), add shell output, fix lint, fix tests (`base_coder.py:2207,1772,976,2456,2479,1604,1620`). Every edit auto-committed; `/undo` is the net (`args.py:440`). Modes `/ask · /code · /architect · /context`. Model edits only files added to chat (`editblock_prompts.py:16-20`).

verdict: **steal** two: undo is the gate (snapshot before write instead of ask); write scope (an instance declares writable roots) — fs tools accept any absolute path today (`fs.js:134-140`).

## comparative
| axis | Pi | mini-swe | Aider | best for near-empty root |
|---|---|---|---|---|
| 1 default tools | 4 of 8 | 1 | 0 · text blocks · 43 cmds | Pi |
| 1 parallel | parallel · `executionMode` | sequential | – | Pi |
| 1 output bound | 2000 rows · 50 KB · spill | 10000 → 5000+5000 | – | mini + Pi |
| 2 identity B | 126 · ≈2100 | 63 · 5228 | ≲5723 | mini |
| 3 discovery | AGENTS/CLAUDE.md root→cwd · skills | – | `--read` | – |
| 4 world | cwd | uname · env | platform · date · repo map | Aider |
| 4 refresh | per run · diff | once | per send | Pi |
| 5 cap | – | steps 0 · cost 3.0 · wall 0 | reflections 3 | rounds + cost |
| 5 abort | AbortSignal | timeout | KeyboardInterrupt | Pi |
| 5 retry | 3 · 2 s · 60 s | 10 · 4–60 s | 0.125 ×2 | vivalence |
| 6 compaction | W−16384 · keep 20000 | – | background · depth ≤3 | Pi + Aider |
| 6 cache marks | warming | 1 | 3 + pings | 3 |
| 7 seam | factory · 41 events | 3 Protocols | – | Pi ≈ vivalence graft |
| 8 gate | `tool_call` block · trust | human/confirm/yolo + regex | confirm ×7 · `/undo` | instance middleware |

## steal list (ranked)
1. **Per-tool prompt guidelines** — Pi `system-prompt.ts:118-121,157-161`; tool rows and rules always match what is armed.
```js
primer.open("rules", (ctx) => steer.trie.rollup(ctx.tools, (e) => e.guidelines ?? []).flat().map((g) => `- ${g}`).join("\n"));
```
2. **`/fs/edit` exact replace** — Pi `edit.ts:18-38` + Aider's miss message `editblock_coder.py:84-114`.
3. **Compaction as a `/dialogue` middleware an instance can replace** — Pi `compaction.ts:267-269,507-540` + Aider background swap `base_coder.py:1002-1034`.
4. **Per-tool `sequential` flag, parallel default** — Pi `agent-loop.ts:526-532`; undoes all-serial `hallucinate.js:108-111`.
5. **System prompt as section diff** — Pi `system-prompt.ts:216-228`, `agent-loop.ts:342-375`.
6. **Budgeted ranked world index** — Aider `repomap.py:480-529,676-705`.
7. **Cost + wall-time budget** — mini `default.py:26-33,130-147`.
8. **Shell output head+tail, spill file, pinned env** — mini `mini.yaml:104-128`, Pi `bash.ts:55-61,380`.
9. **Gate dial as instance middleware** — mini `interactive.py:24-30,162-177`, Pi `runner.ts:1256-1273`.
10. **Steering queue** — Pi `agent-loop.ts:185,213,302-316`.
