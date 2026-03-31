// Daemon-level harness traits — first approximation
// Context vector traversal, history management, turn persistence, resolve utility.

import { shape } from "@vivalence/typology";
import { observe } from "../typology/accumulate.js";

// --- helpers ---

function isAsyncIterable(x) {
  return x != null && typeof x[Symbol.asyncIterator] === "function";
}

function walkParents(parentId, store) {
  if (!parentId) return [];
  const chain = [];
  let current = store.find((t) => t.id === parentId);
  while (current) {
    chain.unshift(current);
    current = current.parent ? store.find((t) => t.id === current.parent) : null;
  }
  return chain;
}

let turnCounter = 0;

function createTurn(fields, store) {
  const turn = { id: "turn_" + turnCounter++, ...fields };
  store.push(turn);
  return turn;
}

// --- context vector ---

// The context vector is mode-owned. Its effects receive ambient state
// and return { turns?, config? }. The harness collects and merges.
//
// What goes IN:  { mode, daemon, thread, tune, input, faculty }
// What comes OUT: { turns?, config? } — merged into the faculty call
//
// For now effects are flat (rollup collects all). Later: branches,
// conditional traversal, middleware on the context vector itself.

async function gatherContext(contextVector, state) {
  const turns = [];
  const config = {};

  for (const [, effect] of contextVector.effects) {
    const result = await effect(state);
    if (!result) continue;
    if (result.turns) turns.push(...result.turns);
    if (result.config) Object.assign(config, result.config);
  }

  return { turns, config };
}

// --- trait: apply harness to mode ---

// Constructs the harness from the cortex, decorates with middleware,
// compiles to mode.harness.
//
// This is the first approximation — LANGUAGED/AGENTIC distinction
// doesn't exist yet. There's just "a mode that has a harness."

export function applyHarness(mode, daemon) {
  const cortex = daemon.cortex;
  const types = Object.keys(Object.fromEntries(cortex.table));
  const harness = cortex.harness(types);

  // root middleware: resolve tune from input
  harness.use(async (ctx, next) => {
    ctx.tune = ctx.input.tune ?? "balanced";
    ctx.mode = mode;
    ctx.daemon = daemon;
    await next();
  });

  // context vector middleware: traverse mode.context, prepend system turns
  harness.use(async (ctx, next) => {
    if (mode.context) {
      const state = {
        mode,
        daemon,
        thread: ctx.input.thread,
        tune: ctx.tune, // set by root middleware above
        input: ctx.input,
      };
      const { turns: systemTurns, config } = await gatherContext(mode.context, state);
      if (systemTurns.length) {
        ctx.input.turns = [...systemTurns, ...(ctx.input.turns || [])];
      }
      if (config) Object.assign(ctx, config);
    }
    await next();
  });

  // conversation branch: history + persistence
  if (cortex.table.has("conversation")) {
    const store = daemon._turnStore ?? (daemon._turnStore = []);

    harness.branch("conversation").use(async (ctx, next) => {
      // pre: build history from parent chain
      if (ctx.input.parent !== undefined) {
        const history = walkParents(ctx.input.parent, store);
        const userTurn = createTurn(
          { role: "user", parts: ctx.input.turn.parts, parent: ctx.input.parent },
          store,
        );
        ctx.input.turns = [
          ...(ctx.input.turns || []), // system turns from context vector
          ...history,
          userTurn,
        ];
        ctx._userTurn = userTurn;
      }

      await next();

      // post: persist assistant turn
      if (ctx._userTurn) {
        if (isAsyncIterable(ctx.output)) {
          // stream path: wrap with observe, persist on drain
          ctx.output = observe(ctx.output, (sealed) => {
            createTurn(
              { role: "assistant", parts: sealed.parts, meta: sealed.meta, parent: ctx._userTurn.id },
              store,
            );
          });
        } else if (ctx.output?.role) {
          // render path: persist immediately
          const saved = createTurn(
            { role: "assistant", parts: ctx.output.parts, meta: ctx.output.meta, parent: ctx._userTurn.id },
            store,
          );
          ctx.output = { ...ctx.output, id: saved.id };
        }
      }
    });
  }

  mode.harness = shape.object(harness);
  return harness;
}

// --- resolve: tool-execution loop ---

// Higher-order composition over mode.harness.conversation.render.
// Calls render, executes tool_use parts, loops until end_turn.

export async function resolve(harness, input) {
  const { tools, maxIterations = 10, ...rest } = input;
  let turns = rest.turns;

  for (let i = 0; i < maxIterations; i++) {
    const turn = await harness.conversation.render({ ...rest, turns, tools });
    if (turn.meta?.stop !== "tool_use") return turn;

    // execute tools
    const toolResults = [];
    for (const part of turn.parts) {
      if (part.type !== "tool_use") continue;
      const tool = tools?.get?.(part.name) ?? tools?.[part.name];
      const execute = typeof tool === "function" ? tool : tool?.execute;
      if (!execute) {
        toolResults.push({ type: "tool_result", id: part.id, output: { error: `unknown tool: ${part.name}` } });
        continue;
      }
      try {
        const result = await execute(JSON.parse(part.input));
        toolResults.push({ type: "tool_result", id: part.id, output: result });
      } catch (e) {
        toolResults.push({ type: "tool_result", id: part.id, output: { error: e.message } });
      }
    }

    turns = [...turns, turn, { role: "user", parts: toolResults }];
  }

  throw new Error("resolve: max iterations exceeded");
}
