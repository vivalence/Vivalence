---
name: live-validation
description: Validate a kajuit change in Chrome without mistaking a tooling artifact — stale mode bundle, HMR scope, a missed coordinate-click — for a real bug. Run the sequence first; the rules explain why each step is there.
when_to_use: "is it wired?" · "check it in the browser" · "the dock isn't showing" · "thread/create hangs" · after any buffer-view or client change that needs eyes on the DOM.
paths: systems/kajuit/**
---

# live-validation — "is it wired?" / "check it in the browser": kajuit change, real DOM

Canon: `.ikiro/self/rituals.md ## live-validation`. Standing rules for the whole browser task, not a one-time walkthrough.

## Sequence — "did my change land?"

1. **Buffer-VIEW change? Restart the runtime.** `deno task runtime/run` caches mode bundles; HMR covers the app layer only. No restart ⇒ you are looking at stale output.
2. **Reload ONCE.** Batch the edits first. Rapid edit→HMR→click cycles fabricate bugs.
3. **Assert on the DOM, not a screenshot** — via `javascript_tool`:
   ```js
   document.querySelector('[data-testid="dock"]').click();
   console.log(document.querySelector(".thread-view")?.textContent);
   ```
   Then read it back with `read_console_messages`. STOP coordinate-clicking after 2–3 misses — misses read as failures.
4. **Still wrong? Read the runtime log before touching code.** esbuild errors surface there and stay silent in the browser console.

## The rules behind the sequence

- **`thread/create` hanging with the request `pending` ⇒ a buffer-bundle esbuild error**, not a network fault. Runtime log, not console.
- **HMR scope**: app layer hot-reloads; mode bundles and buffer views do not. A view change with no restart shows the old bundle.
- **Scoped `> *` styles do not cross a child component's root** — the pointer-events trap. A style that "isn't applying" across a component boundary is this, not specificity.
- **Never trigger `alert`/`confirm`** — a modal dialog blocks every subsequent extension command and the session goes dead until beef dismisses it by hand.
