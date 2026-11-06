<!-- limit: 60000 chars · m117 evidence 2026-11-07, agents opus · reference, read-only -->
# scout — open-source LLM agent harnesses, 2026-11-07

How this was built. Star counts come from `api.github.com/repos/<repo>`, read 2026-11-07. File paths come from `api.github.com/repos/<repo>/git/trees/HEAD?recursive=1`, also read 2026-11-07; none of the trees was truncated. Line ranges come from `raw.githubusercontent.com/<repo>/HEAD/<path>` on the same day. All links point at `blob/HEAD`, so a line range can drift as the repos change. "Velocity" is the change in stars between the 2026-10-22 snapshot in the Graham Miranda comparison and today, a 16-day window. I found no reliable 90-day star series. The Terminal-Bench 4.0 leaderboard renders its rows client-side, and the fetch returned only headers, so its rankings are NOT included.

## sources

- https://tech.grahammiranda.com/ai-coding-harness-comparison/ — 2026-10-25 (data 2026-10-22); 32 harnesses, stars, licences
- https://cellcog.ai/blog/best-ai-agent-harnesses/ — 2026-11-01 (vendor-ranked, self-first)
- https://composio.dev/content/best-ai-agent-harnesses — 2026 (8-harness benchmark: Oh My Pi 88%, Claude Code 76%, Codex 68%; one vendor's test)
- https://www.firecrawl.dev/blog/best-ai-coding-agents — 2026
- https://northflank.com/blog/best-ai-agent-harnesses-for-enterprise-teams — 2026
- https://futureagi.com/blog/best-agent-harness/ — 2026
- https://www.alongside.team/blog/best-ai-coding-agent-harness-2026 — 2026
- https://winder.ai/ai-agent-harness-comparison/ — 2026
- https://www.tencentcloud.com/techpedia/147665 — 2026 (DeepSeek Harness vs Pi vs OpenCode vs Hermes vs Claude Code)
- https://docs.bswen.com/blog/2026-08-10-pi-vs-claude-code-vs-codex-vs-opencode/ — 2026-08-10
- https://gist.github.com/asermax/4fb2be4f6f1fc0d6be1e3966b6e2bb91 — 2026-03-29
- https://arxiv.org/abs/2609.00006 — 2026-07-15 "Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents — A Source-Code Study of Eleven Systems"
- https://arxiv.org/abs/2609.20804 — 2026-09-17 "An Empirical Study of Harness Design for Coding Agents"
- https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html — 2026-09-24
- https://earendil.com/posts/what-is-a-harness/ — 2026-08-20 (HN 589 pts: https://news.ycombinator.com/item?id=49409092, 2026-08-23)
- https://anoma.ly/notes/opencode-2-0/ — 2026-10 (HN 890 pts: https://news.ycombinator.com/item?id=50094994, 2026-10-14)
- https://claude.com/blog/harnessing-claudes-intelligence — 2026-04-02 "Agent harness design: 3 patterns"
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — cited by marmelab, not fetched
- https://www.anthropic.com/engineering/harness-design-long-running-apps — cited by marmelab, not fetched
- https://openai.com/index/harness-engineering/ — cited by marmelab, not fetched
- https://openai.com/index/unrolling-the-codex-agent-loop/ — cited by marmelab, not fetched
- https://blog.langchain.com/the-anatomy-of-an-agent-harness/ — cited by marmelab, not fetched
- https://blog.langchain.com/how-middleware-lets-you-customize-your-agent-harness/ — cited by marmelab, not fetched
- https://martinfowler.com/articles/harness-engineering.html — 2026-04-02, cited by marmelab, not fetched
- https://news.ycombinator.com/item?id=49285244 — 2026-08-13 "DeepSeek Harness developer preview" (747 pts)
- https://news.ycombinator.com/item?id=49929489 — 2026-10-02 "DeepSeek Harness Desktop" (417 pts)
- https://news.ycombinator.com/item?id=49733726 — 2026-09-16 "HarnessTax: How Much Does the Harness Matter" (233 pts; https://harnesstax.github.io/ body did not render)
- https://news.ycombinator.com/item?id=49753878 — 2026-09-18 "An empirical study of harness design" (225 pts)
- https://news.ycombinator.com/item?id=49452346 — 2026-08-26 "The Harness Is the Thing" (209 pts)
- https://news.ycombinator.com/item?id=50315226 — 2026-10-31 "Prospero: a new coding harness" (209 pts)
- https://news.ycombinator.com/item?id=49651221 — 2026-09-10 "Nine coding harnesses vs. your laptop" (186 pts)
- https://news.ycombinator.com/item?id=49464970 — 2026-08-27 "Harness Engineering" (128 pts)
- https://news.ycombinator.com/item?id=49760187 — 2026-09-18 "Claude Code now reads AGENTS.md" (741 pts)
- https://news.ycombinator.com/item?id=50133401 — 2026-10-17 "OpenCode Hacked: credentials leaked" (977 pts)
- https://news.ycombinator.com/item?id=50151059 — 2026-10-19 "Harness2 by Google Research – Recursive Agent Harnessing" (81 pts)
- https://hn.algolia.com/api/v1/search?query=harness&tags=story — queried 2026-11-07, last 90 days (queries: "agent harness", "harness", "coding agent", "claude code", "opencode")
- https://www.tbench.ai/leaderboard — 2026-11-07, Terminal-Bench 4.0; rows did not render
- https://letsdatascience.com/news/google-replaces-gemini-cli-with-antigravity-cli-574b2056 — 2026 (Gemini CLI shut down for consumers 2026-06-18; Antigravity CLI closed source)

## ranking

The ranking blends stars, 16-day velocity, how often the harness appears in the comparisons above, and its presence in arxiv 2609.00006 (11 systems) and in benchmarks.

| rank | name | repo | stars (2026-11-07) | Δ16d | lang | kind | license | known-for |
|---|---|---|---|---|---|---|---|---|
| 1 | OpenClaw | https://github.com/openclaw/openclaw | 394,101 | +1.8k | TypeScript | CLI + gateway daemon (personal assistant) | MIT | workspace bootstrap files (AGENTS.md · SOUL.md · IDENTITY.md · USER.md) injected into the prompt; hosts other harnesses as plugins/ACP |
| 2 | DeepSeek Harness | https://github.com/deepseek-ai/deepseek-harness | 275,385 | +23.4k | TypeScript | CLI · web · desktop · SDK | MIT | everything is a plugin on the Cordis framework (~200 micro-packages) |
| 3 | Hermes Agent | https://github.com/NousResearch/hermes-agent | 261,340 | +7.7k | Python | CLI · desktop · chat gateway | MIT | curated long-term memory + SOUL.md identity; delegates jobs to other harnesses |
| 4 | OpenCode (v2) | https://github.com/anomalyco/opencode (was sst/opencode) | 225,155 | +5.3k | TypeScript | CLI · TUI · desktop · SDK | MIT | one background service every client attaches to; 80+ internal plugins; Code Mode |
| 5 | Claude Code | https://github.com/anthropics/claude-code | 154,857 | +1.9k | (closed core) | CLI · IDE · desktop | proprietary (no SPDX) | hooks + subagents + skills + plugins; public repo holds plugins/mods only |
| 6 | Codex CLI | https://github.com/openai/codex | 133,544 | +5.4k | Rust | CLI · IDE · app-server | Apache-2.0 | OS sandbox on by default; AGENTS.md origin; app-server protocol |
| 7 | Pi | https://github.com/earendil-works/pi (was badlogic/pi-mono) | 120,573 | +3.5k | TypeScript | CLI + SDK | MIT | four tools, no permission system, everything else is a TS extension |
| 8 | Gemini CLI | https://github.com/google-gemini/gemini-cli | 108,758 | n/a | TypeScript | CLI | Apache-2.0 | GEMINI.md hierarchical memory + hook system; consumer product retired 2026-06-18 (Antigravity CLI is closed) |
| 9 | OpenHands | https://github.com/OpenHands/OpenHands (harness: https://github.com/OpenHands/software-agent-sdk) | 92,860 | +1.4k | TS GUI / Python SDK | SDK · GUI · server | MIT | per-conversation Docker sandbox; pluggable condensers |
| 10 | Cline | https://github.com/cline/cline | 71,439 | +3.4k | TypeScript | IDE plugin · CLI · SDK | Apache-2.0 | plan/act split (edits hard-blocked in plan mode) |
| 11 | goose | https://github.com/aaif-goose/goose (was block/goose) | 56,320 | +0.8k | Rust | desktop · CLI · API | Apache-2.0 | MCP extensions as the only tool wire; shareable recipes; Linux Foundation AAIF |
| 12 | nanobot (HKUDS) | https://github.com/HKUDS/nanobot | 49,899 | n/a | Python | CLI + chat-channel gateway | MIT | ultra-lightweight personal agent; "Dream" memory consolidation into USER.md / MEMORY.md |
| 13 | Aider | https://github.com/Aider-AI/aider | 50,002 | ~0 (last push 2026-05-22) | Python | CLI | Apache-2.0 | repo map + git commit per change; SEARCH/REPLACE diff edits |
| 14 | Deep Agents | https://github.com/langchain-ai/deepagents | 31,055 | n/a | Python | SDK (+CLI) | MIT | the harness as a LangGraph middleware stack (todo · filesystem · subagents · summarization) |
| 15 | mini-swe-agent | https://github.com/SWE-agent/mini-swe-agent | 9,279 | n/a | Python | CLI · library | MIT | ~100-line loop, bash-only action space, linear history; the benchmark baseline |

Nanobot disambiguation (per the coordinator's request). HKUDS/nanobot (49.9k, Python, MIT) describes itself as "Your lightweight open-source personal agent", and its README says "ultra-lightweight … personal AI agent framework". This is the harness the discourse means, and it made the top 15 on its own merits, so no extra 16th entry was needed. The other repo is https://github.com/nanobot-ai/nanobot: about 1.4k stars, Apache-2.0, Go/TS, an "MCP host" ("Build MCP Agents"), and archived. It is not ranked.

Read but not ranked (stars 2026-11-07): warpdotdev/warp 65,906 (a terminal that hosts agents) · langchain-ai/langgraph 44,610 (framework) · openai/openai-agents-python 30,543 · huggingface/smolagents 30,247 · mastra-ai/mastra 29,394 · QwenLM/qwen-code 29,068 · charmbracelet/crush 28,984 (FSL) · Kilo-Org/kilocode 27,891 · vercel/ai 27,793 · letta-ai/letta 25,374 · RooCodeInc/Roo-Code 24,241 (archived; shut down 2026-05-15) · SWE-agent/SWE-agent 20,748 · MoonshotAI/kimi-cli 11,420 (archived) · anthropics/claude-agent-sdk-python 8,451 · mistralai/mistral-vibe 5,325 · letta-ai/letta-code 3,796.

## files

Key: (a) system prompt assembly · (b) tool registry · (c) agentic loop · (d) hooks/plugins · (e) memory/compaction · (f) subagents · (g) identity · (h) world model.

### 1 · OpenClaw
- (a) https://github.com/openclaw/openclaw/blob/HEAD/src/agents/system-prompt.ts (`buildAgentSystemPrompt`, L285)
- (b) https://github.com/openclaw/openclaw/blob/HEAD/src/agents/openclaw-tools.ts · https://github.com/openclaw/openclaw/blob/HEAD/src/agents/agent-tools.ts
- (c) https://github.com/openclaw/openclaw/blob/HEAD/src/agents/embedded-agent-runner.ts · https://github.com/openclaw/openclaw/blob/HEAD/src/agents/embedded-agent.runtime.ts
- (d) https://github.com/openclaw/openclaw/blob/HEAD/src/plugins/registry.ts · https://github.com/openclaw/openclaw/blob/HEAD/src/plugins/hooks.ts · https://github.com/openclaw/openclaw/blob/HEAD/src/hooks/hooks.ts · before-tool-call gate: https://github.com/openclaw/openclaw/blob/HEAD/src/agents/agent-tools.before-tool-call.ts
- (e) https://github.com/openclaw/openclaw/blob/HEAD/src/agents/compaction.ts · https://github.com/openclaw/openclaw/blob/HEAD/src/context-engine/registry.ts
- (f) https://github.com/openclaw/openclaw/blob/HEAD/src/agents/tools/sessions-spawn-tool.ts
- (g) inside (a): https://github.com/openclaw/openclaw/blob/HEAD/src/agents/system-prompt.ts#L368 and #L603 ("You are a personal assistant running inside OpenClaw."), model identity at #L237-L244 · https://github.com/openclaw/openclaw/blob/HEAD/src/agents/identity.ts · templates: https://github.com/openclaw/openclaw/blob/HEAD/docs/reference/templates/SOUL.md · https://github.com/openclaw/openclaw/blob/HEAD/docs/reference/templates/IDENTITY.md
- (h) inside (a): https://github.com/openclaw/openclaw/blob/HEAD/src/agents/system-prompt.ts#L476-L506 (workspace / working directory / sandbox roles), L609-L615 (runtime context, "Workspace Files (injected)") · https://github.com/openclaw/openclaw/blob/HEAD/src/agents/bootstrap-files.ts · https://github.com/openclaw/openclaw/blob/HEAD/src/agents/workspace.ts

### 2 · DeepSeek Harness
- (a) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/core/system-prompt/src/index.ts
- (b) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/core/tools/src/index.ts · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/core/tools/src/executor.ts
- (c) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/core/agent-loop/src/agent.ts
- (d) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/extensions/cordis-host-runner/src/registry.ts (Cordis plugin host)
- (e) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/compaction/compaction/src/index.ts · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/compaction/compaction-basic/src/summarizer.ts · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/compaction/compaction-tool-result-pruner/src/index.ts
- (f) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/subagent/tool-subagent/src/index.ts · external harnesses as subagents: https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/subagent/subagent-claude-code/src/run.ts · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/subagent/subagent-codex/src/run.ts · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/subagent/subagent-acp/src/run.ts
- (g) inside (a): https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/core/system-prompt/src/index.ts#L459 ("You are an AI agent powered by DeepSeek Harness."), persona prefix/suffix at #L191-L199 and #L263-L278 · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/preset/persona/src/index.ts
- (h) https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/context/agent-instructions/src/render.ts (AGENTS.md / CLAUDE.md, L131-L195) · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/context/time-context/src/index.ts · https://github.com/deepseek-ai/deepseek-harness/blob/HEAD/packages/session/working-directory/src/index.ts

### 3 · Hermes Agent
- (a) https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/system_prompt.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/prompt_builder.py
- (b) https://github.com/NousResearch/hermes-agent/blob/HEAD/tools/registry.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/model_tools.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/toolsets.py
- (c) https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/conversation_loop.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/run_agent.py
- (d) https://github.com/NousResearch/hermes-agent/blob/HEAD/hermes_cli/plugins.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/hermes_cli/hooks.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/shell_hooks.py
- (e) https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/memory_manager.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/context_compressor.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/context_engine.py
- (f) https://github.com/NousResearch/hermes-agent/blob/HEAD/tools/delegate_tool.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/delegation_registry.py
- (g) https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/prompt_builder.py#L160-L170 (`DEFAULT_AGENT_IDENTITY`) · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/system_prompt.py#L557-L562 (SOUL.md first, else the default) and #L603 (model line) · https://github.com/NousResearch/hermes-agent/blob/HEAD/hermes_cli/default_soul.py · https://github.com/NousResearch/hermes-agent/blob/HEAD/SOUL.md
- (h) https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/prompt_builder.py#L37-L145 (context files SOUL.md / AGENTS.md / .cursorrules / .hermes.md walked to the git root, with an injection scan) · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/system_prompt.py#L56-L94 (platform hints, cwd) and #L182-L224 ("Conversation started:" timestamp) · https://github.com/NousResearch/hermes-agent/blob/HEAD/agent/coding_context.py

### 4 · OpenCode (v2)
- (a) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/system-prompt.ts · template: https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/runner/prompt/system.txt · per-provider: https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/plugin/system-prompt/anthropic.txt (siblings gpt.txt, kimi.txt, …)
- (b) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/tool.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/tool/mcp.ts
- (c) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/runner/index.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/runner/step.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/runner/llm.ts
- (d) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/plugin.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/plugin/hooks.ts
- (e) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/compaction.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/history.ts
- (f) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/subagent-job.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/subagent-completion.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/agent.ts
- (g) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/runner/prompt/system.txt#L1 ("You are an AI agent running in OpenCode, a coding agent harness.")
- (h) https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/context.ts#L151-L163 (ordered instruction stack: catalog, MCP, references, skills, discovery, builtins; "the date and environment" last for cache reuse) · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/instruction-discovery.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/session/instructions.ts · https://github.com/anomalyco/opencode/blob/HEAD/packages/core/src/environment/environment.ts

### 5 · Claude Code (closed core)
The public repo holds plugins, mods, examples and docs only. No harness source is published.
- (a) not found (closed source)
- (b) not found (closed source)
- (c) not found (closed source)
- (d) public extension surface only: https://github.com/anthropics/claude-code/tree/HEAD/plugins · https://github.com/anthropics/claude-code/tree/HEAD/mods · https://github.com/anthropics/claude-code/blob/HEAD/examples/hooks/bash_command_validator_example.py
- (e) not found (closed source)
- (f) not found (closed source)
- (g) not found (closed source)
- (h) not found in source. The public mod https://github.com/anthropics/claude-code/tree/HEAD/mods/agents-md (a hooks-based AGENTS.md walker) shows how project instructions are added.

### 6 · Codex CLI
- (a) https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/context/base_instructions.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/prompts/src/model_instructions.rs (template from model metadata) · text: https://github.com/openai/codex/blob/HEAD/codex-rs/protocol/src/prompts/base_instructions/default.md (also per-model `codex-rs/core/gpt_5_2_prompt.md`, etc.)
- (b) https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/tools/registry.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/tools/router.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/tools/src/lib.rs
- (c) https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/session/turn.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/session/mod.rs
- (d) https://github.com/openai/codex/blob/HEAD/codex-rs/hooks/src/registry.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/hooks/src/engine/dispatcher.rs (events: pre_tool_use, post_tool_use, stop, compact, …) · plugins: https://github.com/openai/codex/tree/HEAD/codex-rs/plugin-host
- (e) https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/compact.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/context_manager/history.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/prompts/src/compact.rs · https://github.com/openai/codex/tree/HEAD/codex-rs/memories
- (f) https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/agent/control/spawn.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/agent/registry.rs · https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/codex_delegate.rs
- (g) https://github.com/openai/codex/blob/HEAD/codex-rs/protocol/src/prompts/base_instructions/default.md#L1 ("You are a coding agent running in the Codex CLI…")
- (h) https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/context/environment_context.rs (environment context: cwd, shell, filesystem and network context) · https://github.com/openai/codex/blob/HEAD/codex-rs/core/src/agents_md.rs#L1-L42 (AGENTS.md walked from the project root to the cwd)

### 7 · Pi
- (a) https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/system-prompt.ts
- (b) https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/tools/index.ts
- (c) https://github.com/earendil-works/pi/blob/HEAD/packages/agent/src/agent-loop.ts · https://github.com/earendil-works/pi/blob/HEAD/packages/agent/src/agent.ts
- (d) https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/extensions/runner.ts · https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/extensions/types.ts · https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/extensions/loader.ts
- (e) https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/compaction/compaction.ts · https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/compaction/branch-summarization.ts · https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/session-manager.ts
- (f) no subagent tool in the core harness. One exists as a plugin in the `apps/p2` app: https://github.com/earendil-works/pi/blob/HEAD/apps/p2/plugins/subagents/tools.ts
- (g) inside (a): https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/system-prompt.ts#L156 ("You are a coding assistant running inside pi, a coding agent harness.")
- (h) inside (a): https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/system-prompt.ts#L27-L33 (context files, cwd) and #L182 (cwd section) · https://github.com/earendil-works/pi/blob/HEAD/packages/coding-agent/src/core/resource-loader.ts · date injection not found

### 8 · Gemini CLI
- (a) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/prompts/snippets.ts (`getCoreSystemPrompt`, L136) · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/prompts/promptProvider.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/core/prompts.ts
- (b) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/tools/tool-registry.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/tools/tools.ts
- (c) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/core/client.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/core/turn.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/scheduler/scheduler.ts
- (d) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/hooks/hookSystem.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/hooks/hookRegistry.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/core/coreToolHookTriggers.ts
- (e) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/context/chatCompressionService.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/context/contextCompressionService.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/utils/memoryDiscovery.ts
- (f) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/agents/local-executor.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/agents/registry.ts · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/agents/agent-tool.ts
- (g) inside (a): https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/prompts/snippets.ts#L183-L196 (`renderPreamble`: "You are Gemini CLI, an interactive CLI agent…")
- (h) https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/utils/environmentContext.ts#L44-L111 (cwd, date, OS, folder structure, session memory) · inside (a): https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/prompts/snippets.ts#L501-L577 (`renderGitRepo`, `renderUserMemory`) · https://github.com/google-gemini/gemini-cli/blob/HEAD/packages/core/src/prompts/promptProvider.ts#L246-L249 (git detection)

### 9 · OpenHands (harness lives in OpenHands/software-agent-sdk)
- (a) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/prompts/prompt.py · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/prompts/registry.py · sections: https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/prompts/sections/static.py
- (b) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/tool/registry.py · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/tool/tool.py
- (c) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/agent/agent.py · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py
- (d) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/hooks/manager.py · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/hooks/executor.py
- (e) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/condenser/pipeline_condenser.py
- (f) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/subagent/registry.py · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/subagent/load.py
- (g) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/llm/utils/openhands_provider.py#L16-L17 (`OPENHANDS_SYSTEM_IDENTITY`: "You are OpenHands agent…") · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/prompts/sections/static.py#L84-L113 (Soul / Role / Persona sections)
- (h) https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/prompts/sections/dynamic.py#L32-L102 (DateTime, REPO_CONTEXT, MemoryContext) · https://github.com/OpenHands/software-agent-sdk/blob/HEAD/openhands-sdk/openhands/sdk/context/agent_context.py#L50-L131 (repo skills, runtime context, AGENTS.md)

### 10 · Cline (SDK rewrite under sdk/packages)
- (a) https://github.com/cline/cline/blob/HEAD/sdk/packages/shared/src/prompt/system/index.ts · https://github.com/cline/cline/blob/HEAD/sdk/packages/shared/src/prompt/system/act.ts · https://github.com/cline/cline/blob/HEAD/sdk/packages/shared/src/prompt/system/yolo.ts
- (b) https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/tools/index.ts
- (c) https://github.com/cline/cline/blob/HEAD/sdk/packages/agents/src/agent-runtime.ts · https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/runtime/orchestration/session-runtime.ts
- (d) https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/hooks/index.ts · https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/plugin/plugin-registry.ts
- (e) https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/context/compaction.ts · https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/context/agentic-compaction.ts
- (f) https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/tools/team/spawn-agent-tool.ts · https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/tools/team/delegated-agent.ts
- (g) inside (a): https://github.com/cline/cline/blob/HEAD/sdk/packages/shared/src/prompt/system/act.ts#L1 ("You are Cline, an AI coding agent.")
- (h) inside (a): https://github.com/cline/cline/blob/HEAD/sdk/packages/shared/src/prompt/system/act.ts#L7-L13 (`<env>` Platform · Date · IDE · Working Directory) · https://github.com/cline/cline/blob/HEAD/sdk/packages/core/src/extensions/config/user-instruction-plugin.ts

### 11 · goose
- (a) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/prompt_manager.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/prompts/system.md
- (b) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/extension_manager/mod.rs (MCP extensions) · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/platform_tools.rs
- (c) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/state_machine/mod.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/state_machine/ops_toolcalling.rs
- (d) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/hooks/mod.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/state_machine/pre_tool_hook.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/state_machine/post_tool_hook.rs
- (e) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/context_mgmt/mod.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/state_machine/proactive_compaction.rs
- (f) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/subagent_handler.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/subagent_execution_tool/mod.rs · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/prompts/subagent_system.md
- (g) inside (a): https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/prompts/system.md#L1 ("You are a general-purpose AI agent called goose, created by AAIF…")
- (h) https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/agents/prompt_manager.rs#L19-L31 (current date) and #L90-L99 (`with_hints(working_dir)`) · https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/hints/load_hints.rs#L10-L21 (.goosehints, AGENTS.md) · inside (a): https://github.com/aaif-goose/goose/blob/HEAD/crates/goose/src/prompts/system.md#L8-L28 (active extensions listed)

### 12 · nanobot (HKUDS)
- (a) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/context.py (`build_system_prompt`, L86)
- (b) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/tools/registry.py · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/tools/base.py
- (c) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/loop.py · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/runner.py
- (d) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/hook.py · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/turn_hooks.py · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/plugins.py
- (e) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/memory.py · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/autocompact.py · Dream prompt: https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/templates/agent/dream.md
- (f) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/subagent.py · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/tools/subagent.py
- (g) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/context.py#L143-L156 (`_get_identity` renders `agent/identity.md`) · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/templates/agent/identity.md · SOUL.md bootstrap at context.py#L77 and #L183-L200
- (h) https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/agent/context.py#L108 ("Working directory:") and #L147-L156 (OS, arch, Python runtime, platform policy) · https://github.com/HKUDS/nanobot/blob/HEAD/nanobot/templates/agent/identity.md#L1-L8 (Runtime / Workspace sections) · AGENTS.md / USER.md bootstrap at context.py#L77-L78 and #L187

### 13 · Aider
- (a) https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/base_prompts.py · https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/editblock_prompts.py · assembly in https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/base_coder.py
- (b) not found as a registry. Aider has no tool-call registry: edits are parsed from text formats, one coder class per format (`aider/coders/*_coder.py`), and user commands live in https://github.com/Aider-AI/aider/blob/HEAD/aider/commands.py
- (c) https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/base_coder.py
- (d) not found
- (e) https://github.com/Aider-AI/aider/blob/HEAD/aider/history.py (chat summarization) · https://github.com/Aider-AI/aider/blob/HEAD/aider/repomap.py
- (f) architect → editor two-model handoff: https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/architect_coder.py (no general subagent: not found)
- (g) https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/editblock_prompts.py#L8 ("Act as an expert software developer.")
- (h) https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/base_coder.py#L1127-L1140 (`get_platform_info`: platform, shell, …) and #L709 (`get_repo_map`) · https://github.com/Aider-AI/aider/blob/HEAD/aider/coders/base_prompts.py#L45 (repo map prefix)

### 14 · Deep Agents
- (a) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/graph.py (`create_deep_agent`, L289) · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/profiles/harness/harness_profiles.py (per-model base prompts)
- (b) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/_tools.py · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/filesystem.py
- (c) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/graph.py (delegates to LangChain `create_agent` / LangGraph; the loop itself is not in this repo)
- (d) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/__init__.py (the middleware stack is the extension point) · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/permissions.py
- (e) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/summarization.py · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/memory.py · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/_message_eviction.py
- (f) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/subagents.py · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/async_subagents.py
- (g) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/graph.py#L83 (`_LEGACY_BASE_AGENT_PROMPT`: "You are a deep agent…", deprecated in 0.7.0; the current base comes from the profile, L674) · https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/profiles/harness/harness_profiles.py#L119-L131
- (h) https://github.com/langchain-ai/deepagents/blob/HEAD/libs/deepagents/deepagents/middleware/memory.py#L1-L27 (AGENTS.md loading, `~/.deepagents/AGENTS.md`) · cwd/OS/date injection not found in core

### 15 · mini-swe-agent
- (a) https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/config/mini.yaml (Jinja templates) · https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/config/default.yaml
- (b) https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/models/utils/actions_toolcall.py (bash is the only action) · https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/models/utils/actions_text.py
- (c) https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/agents/default.py
- (d) not found (extension is by subclassing, e.g. https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/agents/interactive.py)
- (e) not found (linear history by design)
- (f) not found
- (g) https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/config/mini.yaml#L3 ("You are a helpful assistant that can interact with a computer.")
- (h) https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/config/mini.yaml#L23-L46 (environment rules: every action runs in a fresh subshell) and #L71 (MacOS note) · https://github.com/SWE-agent/mini-swe-agent/blob/HEAD/src/minisweagent/environments/local.py

## discourse

1. The field converged on one definition: harness = system prompt + tools + agentic loop + model translation layer, with "Agent = Model + Harness" as the slogan — https://earendil.com/posts/what-is-a-harness/ · https://blog.langchain.com/the-anatomy-of-an-agent-harness/
2. The harness turned from a tool into a platform in H1 2026, and convergence is now turning into imitation — https://arxiv.org/abs/2609.00006
3. Behaviour is moving out of prompt prose and into configuration, hooks and executable guards. Only 4.4% of security rules in public CLAUDE.md files are backed by a real control — https://arxiv.org/abs/2609.00006 · https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html
4. Skills are now more widely adopted than MCP (9 of 11 systems vs 8 of 11). Skills are lazy-loaded markdown dirs, and the Agent Skills standard works across harnesses — https://arxiv.org/abs/2609.00006 · https://tech.grahammiranda.com/ai-coding-harness-comparison/
5. ACP appears in 6 of 11 systems and has a new third role: harness hosting, where one harness runs another as a subagent. DeepSeek `subagent-claude-code` / `subagent-codex` / `subagent-acp`, OpenClaw and Hermes all do this — https://arxiv.org/abs/2609.00006 · https://tech.grahammiranda.com/ai-coding-harness-comparison/
6. None of the 11 studied runtimes imports a general agent framework, and none retrieves code with embeddings. Loops are hand-rolled and async, and retrieval is deterministic (grep, globs, repo maps) — https://arxiv.org/abs/2609.00006
7. Minimal cores win the build-your-own crowd. Pi ships a short prompt, four tools and no permission system, and its users have shared 5,000+ extensions — https://earendil.com/posts/what-is-a-harness/ · https://www.xda-developers.com/replaced-claude-code-and-opencode-with-pi/
8. "Strip the harness down": scaffolding built for one model becomes dead weight for the next, so re-test what the model can't do — https://claude.com/blog/harnessing-claudes-intelligence · https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html
9. Fewer, broader tools help. Vercel reportedly cut 80% of its tools and success went up (second-hand, unreproduced), and Microsoft collapsed 100+ tools into two — https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html
10. A bash-only action space matches predefined tools for strong models at much lower cost, while predefined tools help weaker models — https://arxiv.org/abs/2609.20804 · https://tech.grahammiranda.com/ai-coding-harness-comparison/ (bash-only nearly matched lab agents on Terminal-Bench 4.0)
11. For compaction, rule-based elision before LLM summarization is the most efficient order. Making elided content recoverable adds complexity that models rarely use — https://arxiv.org/abs/2609.20804
12. Planning mostly helps weaker models. For strong models it mainly cuts cost — https://arxiv.org/abs/2609.20804
13. The evidence on multi-agent setups is weak. A reviewer agent lowered success in one ablation, a four-role team barely beat a single agent, and tasks with more than 4 handoffs almost always failed — https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html
14. AGENTS.md is the cross-harness instruction file. Claude Code started reading it in Sept 2026, and OpenAI cut its own to a ~100-row table of contents. Machine-generated context files hurt success, while human-written ones helped slightly — https://news.ycombinator.com/item?id=49760187 · https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html
15. The architecture has gone service-first: one daemon that many clients attach to (OpenCode 2.0, Codex app-server) or everything-is-a-plugin (OpenCode's 80+ internal plugins, DeepSeek's Cordis) — https://anoma.ly/notes/opencode-2-0/ · https://openai.com/index/unlocking-the-codex-harness/ · https://tech.grahammiranda.com/ai-coding-harness-comparison/
16. Code Mode, where MCP servers and OpenAPI become functions the agent chains in one script, is spreading. It appears in OpenCode `@opencode/codemode`, Codex `codex-rs/code-mode*` and Pi `packages/codemode` — https://anoma.ly/notes/opencode-2-0/ (paths from the repo trees above)
17. Open-model labs now ship their own harnesses (DeepSeek Harness, Kimi Code, Mistral Vibe, Qwen Code), because a model is judged by the agent it runs in — https://tech.grahammiranda.com/ai-coding-harness-comparison/
18. The harness moves cost more than score. On the Artificial Analysis index, Codex and Claude Code reach the same score at very different prices — https://tech.grahammiranda.com/ai-coding-harness-comparison/
19. The security failures share one pattern: untrusted text gets the agent to write a file that other tooling trusts. Recent cases include the OpenCode credential leak and backdoored Claude Code extensions. Structured permission rules written up front beat per-action approval by 20.1 points — https://news.ycombinator.com/item?id=50133401 · https://news.ycombinator.com/item?id=50300683 · https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html
20. The field is consolidating. Roo Code shut down (2026-05-15), Gemini CLI was retired for consumers (2026-06-18; Antigravity CLI is closed), Aider's last release was in February, and Kilo was rebuilt on OpenCode — https://tech.grahammiranda.com/ai-coding-harness-comparison/ · https://letsdatascience.com/news/google-replaces-gemini-cli-with-antigravity-cli-574b2056
