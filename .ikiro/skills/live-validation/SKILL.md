---
name: live-validation
description: Use when validating kajuit (the client) in Chrome — checking whether a UI change is wired, debugging a hung thread/create, or verifying a buffer-view change took effect. The rules that separate real bugs from tooling artifacts (bundle caching, HMR scope, coordinate-click misses). Triggers like "is it wired?", "check it in the browser", "the dock isn't showing", "thread/create hangs".
---

# live-validation

Invocable runner for validating kajuit in the browser. Canon: `.ikiro/self/rituals.md ## live-validation`. The recurring trap is mistaking a tooling artifact (stale bundle, HMR scope, a missed coordinate-click) for a real bug — these rules cut that.

## The rules

1. **"is it wired?" → JS DOM assertion**, never coordinate-clicks. Use `javascript_tool`: `document.querySelector(...).click()` then assert on the resulting DOM. STOP coordinate-clicking after 2–3 misses — it fakes failures.
2. **`thread/create` hangs (network `pending`) ⇒ a buffer-bundle esbuild error**, NOT a network problem. Read the **runtime log**, not the browser console.
3. **`deno task runtime/run` caches mode bundles** — a buffer-view change needs a runtime **RESTART**. HMR covers only the app layer; a view change with no restart shows stale.
4. **Batch edits → ONE reload → test.** Rapid edit→HMR→click cycles fabricate bugs; slow down, one clean reload.
5. **Scoped `> *` styles don't cross a child component's root** — the pointer-events trap. A style that "isn't applying" across a component boundary is this, not a specificity bug.

## Sequence for "did my change land?"

1. Was it a buffer-VIEW change? → restart the runtime (bundles cache), don't trust HMR.
2. Reload ONCE.
3. Assert via `querySelector` + DOM check, not a screenshot.
4. Still wrong? → read the runtime log before touching the code again (esbuild errors surface there, silent in the console).

---
_Wiring: `.ikiro/skills/` is auto-discovered only once symlinked — `ln -s ../.ikiro/skills .claude/skills`._
