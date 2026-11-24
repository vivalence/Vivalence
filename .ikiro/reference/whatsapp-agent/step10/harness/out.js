// node_modules/.deno/esm-env@1.2.2/node_modules/esm-env/dev-fallback.js
var node_env = globalThis.process?.env?.NODE_ENV;
var dev_fallback_default = node_env && !node_env.toLowerCase().startsWith("prod");

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var object_keys = Object.keys;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
var noop = () => {
};
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
function deferred() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/constants.js
var DERIVED = 1 << 1;
var EFFECT = 1 << 2;
var RENDER_EFFECT = 1 << 3;
var MANAGED_EFFECT = 1 << 24;
var BLOCK_EFFECT = 1 << 4;
var BRANCH_EFFECT = 1 << 5;
var ROOT_EFFECT = 1 << 6;
var BOUNDARY_EFFECT = 1 << 7;
var PAUSED = 1 << 8;
var CONNECTED = 1 << 9;
var CLEAN = 1 << 10;
var DIRTY = 1 << 11;
var MAYBE_DIRTY = 1 << 12;
var INERT = 1 << 13;
var DESTROYED = 1 << 14;
var REACTION_RAN = 1 << 15;
var DESTROYING = 1 << 25;
var EFFECT_TRANSPARENT = 1 << 16;
var EAGER_EFFECT = 1 << 17;
var HEAD_EFFECT = 1 << 18;
var EFFECT_PRESERVED = 1 << 19;
var USER_EFFECT = 1 << 20;
var EFFECT_OFFSCREEN = 1 << 25;
var REACTION_IS_UPDATING = 1 << 21;
var ASYNC = 1 << 22;
var ERROR_VALUE = 1 << 23;
var STATE_SYMBOL = Symbol("$state");
var COMPONENT_SYMBOL = Symbol("component");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");
var PROXY_PATH_SYMBOL = Symbol("proxy path");
var ATTRIBUTES_CACHE = Symbol("attributes");
var CLASS_CACHE = Symbol("class");
var STYLE_CACHE = Symbol("style");
var TEXT_CACHE = Symbol("text");
var FORM_RESET_HANDLER = Symbol("form reset");
var HMR_ANCHOR = Symbol("hmr anchor");
var STALE_REACTION = new class StaleReactionError extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
var IS_XHTML = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_FRAGMENT_NODE = 11;

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/constants.js
var EACH_ITEM_REACTIVE = 1;
var EACH_INDEX_REACTIVE = 1 << 1;
var EACH_IS_CONTROLLED = 1 << 2;
var EACH_IS_ANIMATED = 1 << 3;
var EACH_ITEM_IMMUTABLE = 1 << 4;
var PROPS_IS_RUNES = 1 << 1;
var PROPS_IS_UPDATED = 1 << 2;
var PROPS_IS_BINDABLE = 1 << 3;
var PROPS_IS_LAZY_INITIAL = 1 << 4;
var TRANSITION_OUT = 1 << 1;
var TRANSITION_GLOBAL = 1 << 2;
var TEMPLATE_FRAGMENT = 1;
var TEMPLATE_USE_IMPORT_NODE = 1 << 1;
var TEMPLATE_USE_SVG = 1 << 2;
var TEMPLATE_USE_MATHML = 1 << 3;
var HYDRATION_START = "[";
var HYDRATION_START_ELSE = "[!";
var HYDRATION_START_FAILED = "[?";
var HYDRATION_END = "]";
var HYDRATION_ERROR = {};
var ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
var ELEMENT_IS_INPUT = 1 << 2;
var UNINITIALIZED = Symbol("uninitialized");
var FILENAME = Symbol("filename");
var HMR = Symbol("hmr");
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/warnings.js
var bold = "font-weight: bold";
var normal = "font-weight: normal";
function await_reactivity_loss(name) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] await_reactivity_loss
%cDetected reactivity loss when reading \`${name}\`. This happens when state is read in an async function after an earlier \`await\`
https://svelte.dev/e/await_reactivity_loss`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/await_reactivity_loss`);
  }
}
function await_waterfall(name, location) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] await_waterfall
%cAn async derived, \`${name}\` (${location}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app
https://svelte.dev/e/await_waterfall`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/await_waterfall`);
  }
}
function derived_inert() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] derived_inert
%cReading a derived belonging to a now-destroyed effect may result in stale values
https://svelte.dev/e/derived_inert`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/derived_inert`);
  }
}
function hydration_attribute_changed(attribute, html2, value) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] hydration_attribute_changed
%cThe \`${attribute}\` attribute on \`${html2}\` changed its value between server and client renders. The client value, \`${value}\`, will be ignored in favour of the server value
https://svelte.dev/e/hydration_attribute_changed`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/hydration_attribute_changed`);
  }
}
function hydration_mismatch(location) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] hydration_mismatch
%c${location ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${location}` : "Hydration failed because the initial UI does not match what was rendered on the server"}
https://svelte.dev/e/hydration_mismatch`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/hydration_mismatch`);
  }
}
function lifecycle_double_unmount() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] lifecycle_double_unmount
%cTried to unmount a component that was not mounted
https://svelte.dev/e/lifecycle_double_unmount`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/lifecycle_double_unmount`);
  }
}
function state_proxy_equality_mismatch(operator) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] state_proxy_equality_mismatch
%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results
https://svelte.dev/e/state_proxy_equality_mismatch`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
  }
}
function svelte_boundary_reset_noop() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] svelte_boundary_reset_noop
%cA \`<svelte:boundary>\` \`reset\` function only resets the boundary the first time it is called
https://svelte.dev/e/svelte_boundary_reset_noop`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/hydration.js
var hydrating = false;
function set_hydrating(value) {
  hydrating = value;
}
var hydrate_node;
function set_hydrate_node(node) {
  if (node === null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return hydrate_node = node;
}
function hydrate_next() {
  return set_hydrate_node(get_next_sibling(hydrate_node));
}
function reset(node) {
  if (!hydrating) return;
  if (get_next_sibling(hydrate_node) !== null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  hydrate_node = node;
}
function next(count2 = 1) {
  if (hydrating) {
    var i = count2;
    var node = hydrate_node;
    while (i--) {
      node = /** @type {TemplateNode} */
      get_next_sibling(node);
    }
    hydrate_node = node;
  }
}
function skip_nodes(remove = true) {
  var depth = 0;
  var node = hydrate_node;
  while (true) {
    if (node.nodeType === COMMENT_NODE) {
      var data = (
        /** @type {Comment} */
        node.data
      );
      if (data === HYDRATION_END) {
        if (depth === 0) return node;
        depth -= 1;
      } else if (data === HYDRATION_START || data === HYDRATION_START_ELSE || // "[1", "[2", etc. for if blocks
      data[0] === "[" && !isNaN(Number(data.slice(1)))) {
        depth += 1;
      }
    }
    var next2 = (
      /** @type {TemplateNode} */
      get_next_sibling(node)
    );
    if (remove) node.remove();
    node = next2;
  }
}
function read_hydration_instruction(node) {
  if (!node || node.nodeType !== COMMENT_NODE) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return (
    /** @type {Comment} */
    node.data
  );
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/equality.js
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/errors.js
function invariant_violation(message) {
  if (dev_fallback_default) {
    const error = new Error(`invariant_violation
An invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app \u2014 please open an issue at https://github.com/sveltejs/svelte, citing the following message: "${message}"
https://svelte.dev/e/invariant_violation`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/invariant_violation`);
  }
}
function store_invalid_shape(name) {
  if (dev_fallback_default) {
    const error = new Error(`store_invalid_shape
\`${name}\` is not a store with a \`subscribe\` method
https://svelte.dev/e/store_invalid_shape`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/store_invalid_shape`);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/errors.js
function async_derived_orphan() {
  if (dev_fallback_default) {
    const error = new Error(`async_derived_orphan
Cannot create a \`$derived(...)\` with an \`await\` expression outside of an effect tree
https://svelte.dev/e/async_derived_orphan`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/async_derived_orphan`);
  }
}
function component_api_changed(method, component2) {
  if (dev_fallback_default) {
    const error = new Error(`component_api_changed
Calling \`${method}\` on a component instance (of ${component2}) is no longer valid in Svelte 5
https://svelte.dev/e/component_api_changed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/component_api_changed`);
  }
}
function component_api_invalid_new(component2, name) {
  if (dev_fallback_default) {
    const error = new Error(`component_api_invalid_new
Attempted to instantiate ${component2} with \`new ${name}\`, which is no longer valid in Svelte 5. If this component is not under your control, set the \`compatibility.componentApi\` compiler option to \`4\` to keep it working.
https://svelte.dev/e/component_api_invalid_new`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/component_api_invalid_new`);
  }
}
function derived_references_self() {
  if (dev_fallback_default) {
    const error = new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/derived_references_self`);
  }
}
function each_key_duplicate(a, b, value) {
  if (dev_fallback_default) {
    const error = new Error(`each_key_duplicate
${value ? `Keyed each block has duplicate key \`${value}\` at indexes ${a} and ${b}` : `Keyed each block has duplicate key at indexes ${a} and ${b}`}
https://svelte.dev/e/each_key_duplicate`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/each_key_duplicate`);
  }
}
function each_key_volatile(index2, a, b) {
  if (dev_fallback_default) {
    const error = new Error(`each_key_volatile
Keyed each block has key that is not idempotent \u2014 the key for item at index ${index2} was \`${a}\` but is now \`${b}\`. Keys must be the same each time for a given item
https://svelte.dev/e/each_key_volatile`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/each_key_volatile`);
  }
}
function effect_in_teardown(rune) {
  if (dev_fallback_default) {
    const error = new Error(`effect_in_teardown
\`${rune}\` cannot be used inside an effect cleanup function
https://svelte.dev/e/effect_in_teardown`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_in_teardown`);
  }
}
function effect_in_unowned_derived() {
  if (dev_fallback_default) {
    const error = new Error(`effect_in_unowned_derived
Effect cannot be created inside a \`$derived\` value that was not itself created inside an effect
https://svelte.dev/e/effect_in_unowned_derived`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
  }
}
function effect_orphan(rune) {
  if (dev_fallback_default) {
    const error = new Error(`effect_orphan
\`${rune}\` can only be used inside an effect (e.g. during component initialisation)
https://svelte.dev/e/effect_orphan`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_orphan`);
  }
}
function effect_update_depth_exceeded() {
  if (dev_fallback_default) {
    const error = new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
https://svelte.dev/e/effect_update_depth_exceeded`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function hydration_failed() {
  if (dev_fallback_default) {
    const error = new Error(`hydration_failed
Failed to hydrate the application
https://svelte.dev/e/hydration_failed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/hydration_failed`);
  }
}
function rune_outside_svelte(rune) {
  if (dev_fallback_default) {
    const error = new Error(`rune_outside_svelte
The \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
  }
}
function state_descriptors_fixed() {
  if (dev_fallback_default) {
    const error = new Error(`state_descriptors_fixed
Property descriptors defined on \`$state\` objects must contain \`value\` and always be \`enumerable\`, \`configurable\` and \`writable\`.
https://svelte.dev/e/state_descriptors_fixed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  if (dev_fallback_default) {
    const error = new Error(`state_prototype_fixed
Cannot set prototype of \`$state\` object
https://svelte.dev/e/state_prototype_fixed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_mutation() {
  if (dev_fallback_default) {
    const error = new Error(`state_unsafe_mutation
Updating state inside \`$derived(...)\`, \`$inspect(...)\` or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`
https://svelte.dev/e/state_unsafe_mutation`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
function svelte_boundary_reset_onerror() {
  if (dev_fallback_default) {
    const error = new Error(`svelte_boundary_reset_onerror
A \`<svelte:boundary>\` \`reset\` function cannot be called while an error is still being handled
https://svelte.dev/e/svelte_boundary_reset_onerror`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/flags/index.js
var async_mode_flag = false;
var legacy_mode_flag = false;
var tracing_mode_flag = false;

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dev/tracing.js
var tracing_expressions = null;
function tag(source2, label) {
  source2.label = label;
  tag_proxy(source2.v, label);
  return source2;
}
function tag_proxy(value, label) {
  value?.[PROXY_PATH_SYMBOL]?.(label);
  return value;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/dev.js
function get_error(label) {
  const error = new Error();
  const stack2 = get_stack();
  if (stack2.length === 0) {
    return null;
  }
  stack2.unshift("\n");
  define_property(error, "stack", {
    value: stack2.join("\n")
  });
  define_property(error, "name", {
    value: label
  });
  return (
    /** @type {Error & { stack: string }} */
    error
  );
}
function get_stack() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack2 = new Error().stack;
  Error.stackTraceLimit = limit;
  if (!stack2) return [];
  const lines = stack2.split("\n");
  const new_lines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const posixified = line.replaceAll("\\", "/");
    if (line.trim() === "Error") {
      continue;
    }
    if (line.includes("validate_each_keys")) {
      return [];
    }
    if (posixified.includes("svelte/src/internal") || posixified.includes("node_modules/.vite")) {
      continue;
    }
    new_lines.push(line);
  }
  return new_lines;
}
function invariant(condition, message) {
  if (!dev_fallback_default) {
    throw new Error("invariant(...) was not guarded by if (DEV)");
  }
  if (!condition) invariant_violation(message);
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/context.js
var component_context = null;
function set_component_context(context) {
  component_context = context;
}
var dev_stack = null;
function set_dev_stack(stack2) {
  dev_stack = stack2;
}
function add_svelte_meta(callback, type, component2, line, column, additional) {
  const parent = dev_stack;
  dev_stack = {
    type,
    file: component2[FILENAME],
    line,
    column,
    parent,
    ...additional
  };
  try {
    return callback();
  } finally {
    dev_stack = parent;
  }
}
var dev_current_component_function = null;
function set_dev_current_component_function(fn) {
  dev_current_component_function = fn;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    i: false,
    c: null,
    e: null,
    s: props,
    x: null,
    r: (
      /** @type {Effect} */
      active_effect
    ),
    l: legacy_mode_flag && !runes ? {
      s: null,
      u: null,
      $: []
    } : null
  };
  if (dev_fallback_default) {
    component_context.function = fn;
    dev_current_component_function = fn;
  }
}
function pop(component2) {
  var context = (
    /** @type {ComponentContext} */
    component_context
  );
  var effects = context.e;
  if (effects !== null) {
    context.e = null;
    for (var fn of effects) {
      create_user_effect(fn);
    }
  }
  if (component2 !== void 0) {
    context.x = component2;
  }
  context.i = true;
  component_context = context.p;
  if (dev_fallback_default) {
    dev_current_component_function = component_context?.function ?? null;
  }
  return mark_as_component(component2);
}
function mark_as_component(component2 = {}) {
  define_property(component2, COMPONENT_SYMBOL, {
    value: true
  });
  return component2;
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/task.js
var micro_tasks = [];
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var tasks = micro_tasks;
    queueMicrotask(() => {
      if (tasks === micro_tasks) run_micro_tasks();
    });
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  while (micro_tasks.length > 0) {
    run_micro_tasks();
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/status.js
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived2) {
  if ((derived2.f & CONNECTED) !== 0 || derived2.deps === null) {
    set_signal_status(derived2, CLEAN);
  } else {
    set_signal_status(derived2, MAYBE_DIRTY);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/utils.js
function defer_effect(effect2, dirty_reactions) {
  if ((effect2.f & DIRTY) !== 0) {
    dirty_reactions.set(effect2, DIRTY);
  } else if ((effect2.f & MAYBE_DIRTY) !== 0 && dirty_reactions.get(effect2) !== DIRTY) {
    dirty_reactions.set(effect2, MAYBE_DIRTY);
  }
  set_signal_status(effect2, CLEAN);
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dev/debug.js
function stringify_derived(fn) {
  return `{${fn.toString().replace(/^async \(\) => /, "").replace(/^\(/, "").replace(/\$\.get\((.+?)\)/g, (_, name) => name).replace(/\$\.track_reactivity_loss\((.+?)\)\(\)/g, (_, name) => name).replace(/\)$/, "")}}`;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/async.js
function flatten(blockers, sync, async2, fn) {
  const d = is_runes() ? derived : derived_safe_equal;
  var pending2 = blockers.filter((b) => !b.settled);
  var deriveds = sync.map(d);
  if (dev_fallback_default) {
    deriveds.forEach((d2, i) => {
      d2.label = sync[i].toString().replace("() => ", "").replaceAll("$.eager(() => ", "$state.eager(").replace(/\$\.get\((.+?)\)/g, (_, id) => id);
    });
  }
  if (async2.length === 0 && pending2.length === 0) {
    fn(deriveds);
    return;
  }
  var parent = (
    /** @type {Effect} */
    active_effect
  );
  var restore = capture();
  var blocker_promise = pending2.length === 1 ? pending2[0].promise : pending2.length > 1 ? Promise.all(pending2.map((b) => b.promise)) : null;
  function finish(async3) {
    if ((parent.f & DESTROYED) !== 0) {
      return;
    }
    restore();
    try {
      fn([
        ...deriveds,
        ...async3
      ]);
    } catch (error) {
      invoke_error_boundary(error, parent);
    }
    unset_context();
  }
  var decrement_pending = increment_pending();
  if (async2.length === 0) {
    blocker_promise.then(() => finish([])).finally(decrement_pending);
    return;
  }
  function run3() {
    Promise.all(async2.map((expression) => async_derived(expression))).then(finish).catch((error) => invoke_error_boundary(error, parent)).finally(decrement_pending);
  }
  if (blocker_promise) {
    blocker_promise.then(() => {
      if ((parent.f & DESTROYED) !== 0) {
        decrement_pending();
        return;
      }
      restore();
      run3();
      unset_context();
    });
  } else {
    run3();
  }
}
function capture() {
  var previous_effect = (
    /** @type {Effect} */
    active_effect
  );
  var previous_reaction = active_reaction;
  var previous_component_context = component_context;
  var previous_batch2 = (
    /** @type {Batch} */
    current_batch
  );
  if (dev_fallback_default) {
    var previous_dev_stack = dev_stack;
  }
  return function restore(activate_batch = true) {
    set_active_effect(previous_effect);
    set_active_reaction(previous_reaction);
    set_component_context(previous_component_context);
    if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
      previous_batch2?.activate();
      previous_batch2?.apply();
    }
    if (dev_fallback_default) {
      set_reactivity_loss_tracker(null);
      set_dev_stack(previous_dev_stack);
    }
  };
}
var restored = false;
function unset_context(deactivate_batch = true) {
  restored = false;
  set_active_effect(null);
  set_active_reaction(null);
  set_component_context(null);
  if (deactivate_batch) current_batch?.deactivate();
  if (dev_fallback_default) {
    set_reactivity_loss_tracker(null);
    set_dev_stack(null);
  }
}
function increment_pending() {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  var boundary2 = effect2.b;
  var batch = (
    /** @type {Batch} */
    current_batch
  );
  var blocking = !!boundary2?.is_rendered();
  boundary2?.update_pending_count(1, batch);
  batch.increment(blocking, effect2);
  return () => {
    boundary2?.update_pending_count(-1, batch);
    batch.decrement(blocking, effect2);
  };
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/deriveds.js
var reactivity_loss_tracker = null;
function set_reactivity_loss_tracker(v) {
  reactivity_loss_tracker = v;
}
var recent_async_deriveds = /* @__PURE__ */ new Set();
// @__NO_SIDE_EFFECTS__
function derived(fn) {
  var flags2 = DERIVED | DIRTY;
  if (active_effect !== null) {
    active_effect.f |= EFFECT_PRESERVED;
  }
  const signal = {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: flags2,
    fn,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      UNINITIALIZED
    ),
    wv: 0,
    parent: active_effect,
    ac: null
  };
  if (dev_fallback_default && tracing_mode_flag) {
    signal.created = get_error("created at");
  }
  return signal;
}
var OBSOLETE = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function async_derived(fn, label, location) {
  let parent = (
    /** @type {Effect | null} */
    active_effect
  );
  if (parent === null) {
    async_derived_orphan();
  }
  var promise = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  );
  var signal = source(
    /** @type {V} */
    UNINITIALIZED
  );
  if (dev_fallback_default) signal.label = label ?? stringify_derived(fn);
  var should_suspend = !active_reaction;
  var deferreds = /* @__PURE__ */ new Set();
  async_effect(() => {
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    if (dev_fallback_default) {
      reactivity_loss_tracker = {
        effect: effect2,
        effect_deps: /* @__PURE__ */ new Set(),
        warned: false
      };
    }
    var d = deferred();
    promise = d.promise;
    try {
      Promise.resolve(fn()).then(d.resolve, (e) => {
        if (e !== STALE_REACTION) d.reject(e);
      }).finally(unset_context);
    } catch (error) {
      d.reject(error);
      unset_context();
    }
    if (dev_fallback_default) {
      if (reactivity_loss_tracker) {
        if (effect2.deps !== null) {
          for (let i = 0; i < skipped_deps; i += 1) {
            reactivity_loss_tracker.effect_deps.add(effect2.deps[i]);
          }
        }
        if (new_deps !== null) {
          for (let i = 0; i < new_deps.length; i += 1) {
            reactivity_loss_tracker.effect_deps.add(new_deps[i]);
          }
        }
      }
      reactivity_loss_tracker = null;
    }
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    if (should_suspend) {
      if ((effect2.f & REACTION_RAN) !== 0) {
        var decrement_pending = increment_pending();
      }
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        parent.b?.is_rendered()
      ) {
        batch.async_deriveds.get(effect2)?.reject(OBSOLETE);
      } else {
        for (const d2 of deferreds.values()) {
          d2.reject(OBSOLETE);
        }
      }
      deferreds.add(d);
      batch.async_deriveds.set(effect2, d);
    }
    const handler = (value, error = void 0) => {
      if (dev_fallback_default) {
        reactivity_loss_tracker = null;
      }
      decrement_pending?.();
      deferreds.delete(d);
      if (error === OBSOLETE) return;
      batch.activate();
      if (error) {
        signal.f |= ERROR_VALUE;
        internal_set(signal, error);
      } else {
        if ((signal.f & ERROR_VALUE) !== 0) {
          signal.f ^= ERROR_VALUE;
        }
        if (dev_fallback_default && location !== void 0 && !signal.equals(value)) {
          recent_async_deriveds.add(signal);
          setTimeout(() => {
            if (recent_async_deriveds.has(signal) && (effect2.f & DESTROYED) === 0) {
              await_waterfall(
                /** @type {string} */
                signal.label,
                location
              );
              recent_async_deriveds.delete(signal);
            }
          });
        }
        internal_set(signal, value);
      }
      batch.deactivate();
    };
    d.promise.then(handler, (e) => handler(null, e || "unknown"));
  });
  teardown(() => {
    for (const d of deferreds) {
      d.reject(OBSOLETE);
    }
  });
  if (dev_fallback_default) {
    signal.f |= ASYNC;
  }
  return new Promise((fulfil) => {
    function next2(p) {
      function go() {
        if (p === promise) {
          fulfil(signal);
        } else {
          next2(promise);
        }
      }
      p.then(go, go);
    }
    next2(promise);
  });
}
// @__NO_SIDE_EFFECTS__
function user_derived(fn) {
  const d = /* @__PURE__ */ derived(fn);
  if (!async_mode_flag) push_reaction_value(d);
  return d;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(fn) {
  const signal = /* @__PURE__ */ derived(fn);
  signal.equals = safe_equals;
  return signal;
}
function destroy_derived_effects(derived2) {
  var effects = derived2.effects;
  if (effects !== null) {
    derived2.effects = null;
    for (var i = 0; i < effects.length; i += 1) {
      destroy_effect(
        /** @type {Effect} */
        effects[i]
      );
    }
  }
}
var stack = [];
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  var parent = derived2.parent;
  if (!is_destroying_effect && parent !== null && derived2.v !== UNINITIALIZED && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (parent.f & (DESTROYED | INERT)) !== 0) {
    derived_inert();
    return derived2.v;
  }
  set_active_effect(parent);
  if (dev_fallback_default) {
    let prev_eager_effects = eager_effects;
    set_eager_effects(/* @__PURE__ */ new Set());
    try {
      if (includes.call(stack, derived2)) {
        derived_references_self();
      }
      stack.push(derived2);
      destroy_derived_effects(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
      set_eager_effects(prev_eager_effects);
      stack.pop();
    }
  } else {
    try {
      destroy_derived_effects(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  if (!derived2.equals(value)) {
    derived2.wv = increment_write_version();
    if (!current_batch?.is_fork || derived2.deps === null) {
      if (current_batch !== null) {
        current_batch.capture(derived2, value, true);
        previous_batch?.capture(derived2, value, true);
      } else {
        derived2.v = value;
      }
      if (derived2.deps === null) {
        set_signal_status(derived2, CLEAN);
        return;
      }
    }
  }
  if (is_destroying_effect) {
    return;
  }
  if (batch_values !== null) {
    if (effect_tracking() || current_batch?.is_fork) {
      batch_values.set(derived2, value);
    }
  } else {
    update_derived_status(derived2);
  }
}
function freeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e of derived2.effects) {
    if (e.teardown || e.ac) {
      e.teardown?.();
      if (e.ac !== null) {
        without_reactive_context(() => {
          e.ac.abort(STALE_REACTION);
          e.ac = null;
        });
      }
      if (e.fn !== null) e.teardown = noop;
      remove_reactions(e, 0);
      destroy_effect_children(e);
    }
  }
}
function unfreeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e of derived2.effects) {
    if (e.teardown && e.fn !== null) {
      update_effect(e);
    }
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/batch.js
var first_batch = null;
var last_batch = null;
var current_batch = null;
var previous_batch = null;
var batch_values = null;
var last_scheduled_effect = null;
var is_flushing_sync = false;
var is_processing = false;
var collected_effects = null;
var legacy_updates = null;
var flush_count = 0;
var source_stacks = /* @__PURE__ */ new Set();
var uid = 1;
var Batch = class _Batch {
  id = uid++;
  /** True as soon as `#process` was called */
  started = false;
  linked = true;
  /** @type {Batch | null} */
  prev = null;
  /** @type {Batch | null} */
  next = null;
  /** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
  async_deriveds = /* @__PURE__ */ new Map();
  /**
  * The current values of any signals that are updated in this batch.
  * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
  * The keys of this map are identical to `this.previous`
  * @type {Map<Value, [any, boolean]>}
  */
  current = /* @__PURE__ */ new Map();
  /**
  * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
  * The keys of this map are identical to `this.current`
  * @type {Map<Value, any>}
  */
  previous = /* @__PURE__ */ new Map();
  /**
  * When the batch is committed (and the DOM is updated), we need to remove old branches
  * and append new ones by calling the functions added inside (if/each/key/etc) blocks
  * @type {Set<(batch: Batch) => void>}
  */
  #commit_callbacks = /* @__PURE__ */ new Set();
  /**
  * If a fork is discarded, we need to destroy any effects that are no longer needed
  * @type {Set<(batch: Batch) => void>}
  */
  #discard_callbacks = /* @__PURE__ */ new Set();
  /**
  * The number of async effects that are currently in flight
  */
  #pending = 0;
  /**
  * Async effects that are currently in flight, _not_ inside a pending boundary
  * @type {Map<Effect, number>}
  */
  #blocking_pending = /* @__PURE__ */ new Map();
  /**
  * A deferred that resolves when the batch is committed, used with `settled()`
  * TODO replace with Promise.withResolvers once supported widely enough
  * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
  */
  #deferred = null;
  /**
  * Effects that were scheduled in this batch but not yet 'resolved' into the
  * root effects that need to be flushed. Resolving — the upwards traversal that
  * marks the path to each effect on the shared effect tree (see #resolve) — is
  * deferred until the batch is processed, so that the markers are created and
  * consumed within a single traversal. Scheduling into other batches (which can
  * happen concurrently, e.g. while a batch is committed) can therefore never
  * observe (and be confused by) this batch's markers.
  * May contain duplicates — deduplication happens during resolving
  * @type {Effect[]}
  */
  #scheduled = [];
  /**
  * Effects created while this batch was active.
  * @type {Effect[]}
  */
  #new_effects = [];
  /**
  * Deferred effects (which run after async work has completed) and their status (DIRTY or MAYBE_DIRTY)
  * @type {Map<Effect, number>}
  */
  #dirty_reactions = /* @__PURE__ */ new Map();
  /**
  * A map of branches that still exist, but will be destroyed when this batch
  * is committed — we skip over these during `process`.
  * The value contains child effects that were dirty/maybe_dirty before being reset,
  * so they can be rescheduled if the branch survives.
  * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
  */
  #skipped_branches = /* @__PURE__ */ new Map();
  /**
  * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
  * @type {Set<Effect>}
  */
  #unskipped_branches = /* @__PURE__ */ new Set();
  is_fork = false;
  #decrement_queued = false;
  constructor() {
    if (last_batch === null) {
      first_batch = last_batch = this;
    } else {
      last_batch.next = this;
      this.prev = last_batch;
    }
    last_batch = this;
  }
  #is_deferred() {
    if (this.is_fork) return true;
    for (const effect2 of this.#blocking_pending.keys()) {
      if (!this.#is_skipped(effect2)) {
        return true;
      }
    }
    return false;
  }
  /**
  * Whether `effect` is inside a branch that this batch skips
  * @param {Effect} effect
  */
  #is_skipped(effect2) {
    for (var e = (
      /** @type {Effect | null} */
      effect2
    ); e !== null; e = e.parent) {
      if (this.#skipped_branches.has(e)) return true;
    }
    return false;
  }
  /**
  * Add an effect to the #skipped_branches map and reset its children
  * @param {Effect} effect
  */
  skip_effect(effect2) {
    if (!this.#skipped_branches.has(effect2)) {
      this.#skipped_branches.set(effect2, {
        d: [],
        m: []
      });
    }
    this.#unskipped_branches.delete(effect2);
  }
  /**
  * Remove an effect from the #skipped_branches map and reschedule
  * any tracked dirty/maybe_dirty child effects
  * @param {Effect} effect
  * @param {(e: Effect) => void} callback
  */
  unskip_effect(effect2, callback = (e) => this.schedule(e)) {
    var tracked = this.#skipped_branches.get(effect2);
    if (tracked) {
      this.#skipped_branches.delete(effect2);
      for (var e of tracked.d) {
        set_signal_status(e, DIRTY);
        callback(e);
      }
      for (e of tracked.m) {
        set_signal_status(e, MAYBE_DIRTY);
        callback(e);
      }
    }
    this.#unskipped_branches.add(effect2);
  }
  /**
  * Convert the effects that were scheduled in this batch into the root effects
  * that need to be traversed, marking the path to each effect (by clearing the
  * `CLEAN` flag on ancestor branches) so that the traversal can find them.
  * This happens right before traversal rather than at scheduling time, so that
  * the markers left on the (shared) effect tree are created and consumed within
  * a single traversal — scheduling into other batches can never observe them
  * @returns {Effect[]}
  */
  #resolve() {
    var roots = [];
    for (const effect2 of this.#scheduled) {
      if ((effect2.f & DESTROYED) !== 0 || (effect2.f & (DIRTY | MAYBE_DIRTY)) === 0) continue;
      var e = effect2;
      var covered = false;
      while (e.parent !== null) {
        e = e.parent;
        var flags2 = e.f;
        if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
          if ((flags2 & CLEAN) === 0) {
            covered = true;
            break;
          }
          e.f ^= CLEAN;
        }
      }
      if (!covered) {
        roots.push(e);
      }
    }
    this.#scheduled = [];
    return roots;
  }
  #process() {
    this.started = true;
    if (dev_fallback_default) {
      for (const value of this.current.keys()) {
        source_stacks.add(value);
      }
    }
    for (const [e, status] of this.#dirty_reactions) {
      set_signal_status(e, status);
      this.schedule(e);
    }
    this.apply();
    var effects = collected_effects = [];
    var render_effects = [];
    var updates = legacy_updates = [];
    while (this.#scheduled.length > 0) {
      if (flush_count++ > 1e3) {
        this.#unlink();
        infinite_loop_guard();
      }
      for (const root2 of this.#resolve()) {
        try {
          this.#traverse(root2, effects, render_effects);
        } catch (e) {
          reset_all(root2);
          if (!this.#is_deferred()) this.discard();
          throw e;
        }
      }
    }
    current_batch = null;
    if (updates.length > 0) {
      var batch = _Batch.ensure();
      for (const e of updates) {
        batch.schedule(e);
      }
    }
    collected_effects = null;
    legacy_updates = null;
    if (this.#is_deferred()) {
      this.#defer_effects(render_effects);
      this.#defer_effects(effects);
      for (const [e, t] of this.#skipped_branches) {
        reset_branch(e, t);
      }
      if (updates.length > 0) {
        /** @type {unknown} */
        current_batch.#process();
      }
      return;
    }
    const earlier_batch = this.#find_earlier_batch();
    if (earlier_batch) {
      this.#defer_effects(render_effects);
      this.#defer_effects(effects);
      earlier_batch.#merge(this);
      return;
    }
    this.#dirty_reactions.clear();
    for (const fn of this.#commit_callbacks) fn(this);
    this.#commit_callbacks.clear();
    previous_batch = this;
    flush_queued_effects(render_effects);
    flush_queued_effects(effects);
    previous_batch = null;
    this.#deferred?.resolve();
    var next_batch = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      current_batch
    );
    if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
      this.#unlink();
      if (async_mode_flag) {
        this.#commit();
        current_batch = next_batch;
      }
    }
    if (next_batch !== null) {
      old_values.clear();
      next_batch.#process();
    }
  }
  /**
  * Traverse the effect tree, executing effects or stashing
  * them for later execution as appropriate
  * @param {Effect} root
  * @param {Effect[]} effects
  * @param {Effect[]} render_effects
  */
  #traverse(root2, effects, render_effects) {
    root2.f ^= CLEAN;
    var effect2 = root2.first;
    while (effect2 !== null) {
      var flags2 = effect2.f;
      var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
      var skip = is_skippable_branch || (flags2 & INERT) !== 0 || this.#skipped_branches.has(effect2);
      if (!skip && effect2.fn !== null) {
        if (is_branch) {
          effect2.f ^= CLEAN;
        } else if ((flags2 & EFFECT) !== 0) {
          effects.push(effect2);
        } else if (async_mode_flag && (flags2 & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
          render_effects.push(effect2);
        } else if (is_dirty(effect2)) {
          if ((flags2 & BLOCK_EFFECT) !== 0) this.add_dirty_reaction(effect2, MAYBE_DIRTY);
          update_effect(effect2);
        }
        var child2 = effect2.first;
        if (child2 !== null) {
          effect2 = child2;
          continue;
        }
      }
      while (effect2 !== null) {
        var next2 = effect2.next;
        if (next2 !== null) {
          effect2 = next2;
          break;
        }
        effect2 = effect2.parent;
      }
    }
  }
  #find_earlier_batch() {
    for (var batch = this.prev; batch !== null; batch = batch.prev) {
      if (!batch.is_fork && this.#intersects(batch)) return batch;
    }
    return null;
  }
  /** @param {Batch} batch */
  #intersects(batch) {
    for (const [source2, [, is_derived]] of this.current) {
      if (is_derived) continue;
      if (batch.current.has(source2)) return true;
    }
    return false;
  }
  /**
  * @param {Batch} batch
  */
  #merge(batch) {
    for (const [source2, value] of batch.current) {
      if (!this.previous.has(source2) && batch.previous.has(source2)) {
        this.previous.set(source2, batch.previous.get(source2));
      }
      this.current.set(source2, value);
    }
    for (const [effect2, deferred2] of batch.async_deriveds) {
      const d = this.async_deriveds.get(effect2);
      if (d) deferred2.promise.then(d.resolve).catch(d.reject);
    }
    batch.async_deriveds.clear();
    this.transfer_reactions(batch.#dirty_reactions);
    const mark = (value) => {
      var reactions = value.reactions;
      if (reactions === null) return;
      if ((value.f & DERIVED) !== 0 && (value.f & (DIRTY | MAYBE_DIRTY)) === 0) {
        return;
      }
      for (const reaction of reactions) {
        var flags2 = reaction.f;
        if ((flags2 & DERIVED) !== 0) {
          mark(
            /** @type {Derived} */
            reaction
          );
        } else {
          var effect2 = (
            /** @type {Effect} */
            reaction
          );
          if (flags2 & (ASYNC | BLOCK_EFFECT) && !this.async_deriveds.has(effect2)) {
            this.#dirty_reactions.delete(effect2);
            set_signal_status(effect2, DIRTY);
            this.schedule(effect2);
          }
        }
      }
    };
    for (const source2 of this.current.keys()) {
      mark(source2);
    }
    this.oncommit(() => batch.discard());
    batch.#unlink();
    current_batch = this;
    this.#process();
  }
  /**
  * @param {Effect[]} effects
  */
  #defer_effects(effects) {
    for (var i = 0; i < effects.length; i += 1) {
      defer_effect(effects[i], this.#dirty_reactions);
    }
  }
  /**
  * Associate a change to a given source with the current
  * batch, noting its previous and current values
  * @param {Value} source
  * @param {any} value
  * @param {boolean} [is_derived]
  */
  capture(source2, value, is_derived = false) {
    if (source2.v !== UNINITIALIZED && !this.previous.has(source2)) {
      this.previous.set(source2, source2.v);
    }
    if ((source2.f & ERROR_VALUE) === 0) {
      this.current.set(source2, [
        value,
        is_derived
      ]);
      batch_values?.set(source2, value);
    }
    if (!this.is_fork) {
      source2.v = value;
    }
  }
  activate() {
    current_batch = this;
  }
  deactivate() {
    current_batch = null;
    batch_values = null;
  }
  flush() {
    try {
      if (dev_fallback_default) {
        source_stacks.clear();
      }
      is_processing = true;
      current_batch = this;
      this.#process();
    } finally {
      flush_count = 0;
      last_scheduled_effect = null;
      collected_effects = null;
      legacy_updates = null;
      is_processing = false;
      current_batch = null;
      batch_values = null;
      old_values.clear();
      if (dev_fallback_default) {
        for (const source2 of source_stacks) {
          source2.updated = null;
        }
      }
    }
  }
  discard() {
    for (const fn of this.#discard_callbacks) fn(this);
    this.#discard_callbacks.clear();
    for (const deferred2 of this.async_deriveds.values()) {
      deferred2.reject(OBSOLETE);
    }
    this.#unlink();
    this.#deferred?.resolve();
  }
  /**
  * @param {Effect} effect
  */
  register_created_effect(effect2) {
    this.#new_effects.push(effect2);
  }
  #commit() {
    for (let batch = first_batch; batch !== null; batch = batch.next) {
      var is_earlier = batch.id < this.id;
      var sources = [];
      for (const [source3, [value, is_derived]] of this.current) {
        if (batch.current.has(source3)) {
          var batch_value = (
            /** @type {[any, boolean]} */
            batch.current.get(source3)[0]
          );
          if (is_earlier && value !== batch_value) {
            batch.current.set(source3, [
              value,
              is_derived
            ]);
          } else {
            continue;
          }
        }
        sources.push(source3);
      }
      if (is_earlier) {
        for (const [effect2, deferred2] of this.async_deriveds) {
          const d = batch.async_deriveds.get(effect2);
          if (d) deferred2.promise.then(d.resolve).catch(d.reject);
        }
      }
      var current = [
        ...batch.current.keys()
      ].filter((source3) => !/** @type {[any, boolean]} */
      batch.current.get(source3)[1]);
      if (!batch.started || current.length === 0) continue;
      var others = current.filter((source3) => !this.current.has(source3));
      if (others.length === 0) {
        if (is_earlier) {
          batch.discard();
        }
      } else if (sources.length > 0) {
        if (dev_fallback_default && !batch.#decrement_queued) {
          invariant(batch.#scheduled.length === 0, "Batch has scheduled effects");
        }
        if (is_earlier) {
          for (const unskipped of this.#unskipped_branches) {
            batch.unskip_effect(unskipped, (e) => {
              if ((e.f & (BLOCK_EFFECT | ASYNC)) !== 0) {
                batch.schedule(e);
              } else {
                batch.#defer_effects([
                  e
                ]);
              }
            });
          }
        }
        batch.activate();
        var marked = /* @__PURE__ */ new Set();
        var checked = /* @__PURE__ */ new Map();
        for (var source2 of sources) {
          mark_effects(source2, others, marked, checked);
        }
        checked = /* @__PURE__ */ new Map();
        var current_unequal = [
          ...batch.current
        ].filter(([c, v1]) => {
          const v2 = this.current.get(c);
          if (!v2) return true;
          return v2[0] !== v1[0] || v2[1] !== v1[1];
        }).map(([c]) => c);
        if (current_unequal.length > 0) {
          for (const effect2 of this.#new_effects) {
            if ((effect2.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 && depends_on(effect2, current_unequal, checked)) {
              if ((effect2.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
                set_signal_status(effect2, DIRTY);
                batch.schedule(effect2);
              } else {
                batch.add_dirty_reaction(effect2, DIRTY);
              }
            }
          }
        }
        if (batch.#scheduled.length > 0 && !batch.#decrement_queued) {
          batch.apply();
          for (var root2 of batch.#resolve()) {
            batch.#traverse(root2, [], []);
          }
        }
        batch.deactivate();
      }
    }
  }
  /**
  * @param {boolean} blocking
  * @param {Effect} effect
  */
  increment(blocking, effect2) {
    this.#pending += 1;
    if (blocking) {
      let blocking_pending_count = this.#blocking_pending.get(effect2) ?? 0;
      this.#blocking_pending.set(effect2, blocking_pending_count + 1);
    }
  }
  /**
  * @param {boolean} blocking
  * @param {Effect} effect
  */
  decrement(blocking, effect2) {
    this.#pending -= 1;
    if (blocking) {
      let blocking_pending_count = this.#blocking_pending.get(effect2) ?? 0;
      if (blocking_pending_count === 1) {
        this.#blocking_pending.delete(effect2);
      } else {
        this.#blocking_pending.set(effect2, blocking_pending_count - 1);
      }
    }
    if (this.#decrement_queued) return;
    this.#decrement_queued = true;
    queue_micro_task(() => {
      this.#decrement_queued = false;
      if (this.linked) {
        this.flush();
      }
    });
  }
  /**
  * @param {Map<Effect, number>} dirty_reactions
  */
  transfer_reactions(dirty_reactions) {
    for (const [effect2, status] of dirty_reactions) {
      this.add_dirty_reaction(effect2, status);
    }
    dirty_reactions.clear();
  }
  /**
  * @param {Effect} effect
  * @param {number} status
  */
  add_dirty_reaction(effect2, status) {
    if (status === DIRTY || this.#dirty_reactions.get(effect2) !== DIRTY) {
      this.#dirty_reactions.set(effect2, status);
    }
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(fn) {
    this.#commit_callbacks.add(fn);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(fn) {
    this.#discard_callbacks.add(fn);
  }
  settled() {
    return (this.#deferred ??= deferred()).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const batch = current_batch = new _Batch();
      if (!is_processing && !is_flushing_sync) {
        queue_micro_task(() => {
          if (!batch.started) {
            batch.flush();
          }
        });
      }
    }
    return current_batch;
  }
  apply() {
    if (!async_mode_flag || !this.is_fork && this.prev === null && this.next === null) {
      batch_values = null;
      return;
    }
    batch_values = /* @__PURE__ */ new Map();
    for (const [source2, [value]] of this.current) {
      batch_values.set(source2, value);
    }
    for (let batch = first_batch; batch !== null; batch = batch.next) {
      if (batch === this || batch.is_fork) continue;
      if (batch.id >= this.id || !batch.#intersects(this)) {
        for (const [source2, previous] of batch.previous) {
          if (!batch_values.has(source2)) {
            batch_values.set(source2, previous);
          }
        }
      }
    }
  }
  /**
  *
  * @param {Effect} effect
  */
  schedule(effect2) {
    last_scheduled_effect = effect2;
    if (effect2.b?.is_pending && (effect2.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 && (effect2.f & REACTION_RAN) === 0) {
      effect2.b.defer_effect(effect2);
      return;
    }
    this.#scheduled.push(effect2);
  }
  #unlink() {
    if (!this.linked) return;
    var prev = this.prev;
    var next2 = this.next;
    if (prev === null) {
      first_batch = next2;
    } else {
      prev.next = next2;
    }
    if (next2 === null) {
      last_batch = prev;
    } else {
      next2.prev = prev;
    }
    this.linked = false;
  }
};
function flushSync(fn) {
  var was_flushing_sync = is_flushing_sync;
  var prev_previous_batch = previous_batch;
  previous_batch = null;
  is_flushing_sync = true;
  try {
    var result;
    if (fn) {
      flushSync();
      result = fn();
    }
    while (true) {
      flush_tasks();
      if (current_batch === null) {
        return (
          /** @type {T} */
          result
        );
      }
      current_batch.flush();
    }
  } finally {
    is_flushing_sync = was_flushing_sync;
    previous_batch = prev_previous_batch;
  }
}
function infinite_loop_guard() {
  if (dev_fallback_default) {
    var updates = /* @__PURE__ */ new Map();
    for (const source2 of current_batch.current.keys()) {
      for (const [stack2, update2] of source2.updated ?? []) {
        var entry = updates.get(stack2);
        if (!entry) {
          entry = {
            error: update2.error,
            count: 0
          };
          updates.set(stack2, entry);
        }
        entry.count += update2.count;
      }
    }
    for (const update2 of updates.values()) {
      if (update2.error) {
        console.error(update2.error);
      }
    }
  }
  try {
    effect_update_depth_exceeded();
  } catch (error) {
    if (dev_fallback_default) {
      define_property(error, "stack", {
        value: ""
      });
    }
    invoke_error_boundary(error, last_scheduled_effect);
  }
}
var eager_block_effects = null;
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  var i = 0;
  while (i < length) {
    var effect2 = effects[i++];
    if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
      eager_block_effects = /* @__PURE__ */ new Set();
      update_effect(effect2);
      if (effect2.deps === null && effect2.first === null && effect2.nodes === null && effect2.teardown === null && effect2.ac === null) {
        unlink_effect(effect2);
      }
      if (eager_block_effects?.size > 0) {
        old_values.clear();
        for (const e of eager_block_effects) {
          if ((e.f & (DESTROYED | INERT)) !== 0) continue;
          const ordered_effects = [
            e
          ];
          let ancestor = e.parent;
          while (ancestor !== null) {
            if (eager_block_effects.has(ancestor)) {
              eager_block_effects.delete(ancestor);
              ordered_effects.push(ancestor);
            }
            ancestor = ancestor.parent;
          }
          for (let j = ordered_effects.length - 1; j >= 0; j--) {
            const e2 = ordered_effects[j];
            if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
            update_effect(e2);
          }
        }
        eager_block_effects.clear();
      }
    }
  }
  eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
  if (marked.has(value)) return;
  marked.add(value);
  if (value.reactions !== null) {
    for (const reaction of value.reactions) {
      const flags2 = reaction.f;
      if ((flags2 & DERIVED) !== 0) {
        mark_effects(
          /** @type {Derived} */
          reaction,
          sources,
          marked,
          checked
        );
      } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
        set_signal_status(reaction, DIRTY);
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
function depends_on(reaction, sources, checked) {
  const depends = checked.get(reaction);
  if (depends !== void 0) return depends;
  if (reaction.deps !== null) {
    for (const dep of reaction.deps) {
      if (includes.call(sources, dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        dep,
        sources,
        checked
      )) {
        checked.set(
          /** @type {Derived} */
          dep,
          true
        );
        return true;
      }
    }
  }
  checked.set(reaction, false);
  return false;
}
function schedule_effect(effect2) {
  current_batch.schedule(effect2);
}
function reset_branch(effect2, tracked) {
  if ((effect2.f & BRANCH_EFFECT) !== 0 && (effect2.f & CLEAN) !== 0) {
    return;
  }
  if ((effect2.f & DIRTY) !== 0) {
    tracked.d.push(effect2);
  } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
    tracked.m.push(effect2);
  }
  set_signal_status(effect2, CLEAN);
  var e = effect2.first;
  while (e !== null) {
    reset_branch(e, tracked);
    e = e.next;
  }
}
function reset_all(effect2) {
  set_signal_status(effect2, CLEAN);
  var e = effect2.first;
  while (e !== null) {
    reset_all(e);
    e = e.next;
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/sources.js
var eager_effects = /* @__PURE__ */ new Set();
var old_values = /* @__PURE__ */ new Map();
function set_eager_effects(v) {
  eager_effects = v;
}
var eager_effects_deferred = false;
function set_eager_effects_deferred() {
  eager_effects_deferred = true;
}
function source(v, stack2) {
  var signal = {
    f: 0,
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  if (dev_fallback_default && tracing_mode_flag) {
    signal.created = stack2 ?? get_error("created at");
    signal.updated = null;
    signal.set_during_effect = false;
    signal.trace = null;
  }
  return signal;
}
// @__NO_SIDE_EFFECTS__
function state(v, stack2) {
  const s = source(v, stack2);
  push_reaction_value(s);
  return s;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false, trackable = true) {
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
    (component_context.l.s ??= []).push(s);
  }
  return s;
}
function set(source2, value, should_proxy = false) {
  if (active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !current_sources.has(source2))) {
    state_unsafe_mutation();
  }
  let new_value = should_proxy ? proxy(value) : value;
  if (dev_fallback_default) {
    tag_proxy(
      new_value,
      /** @type {string} */
      source2.label
    );
  }
  return internal_set(source2, new_value, legacy_updates);
}
var seen = null;
var count_deps = 0;
function internal_set(source2, value, updated_during_traversal = null) {
  if (!source2.equals(value)) {
    if (is_destroying_effect) {
      old_values.set(source2, value);
    } else if (!old_values.has(source2)) {
      old_values.set(source2, source2.v);
    }
    var batch = Batch.ensure();
    batch.capture(source2, value);
    if (dev_fallback_default) {
      if (tracing_mode_flag || active_effect !== null) {
        source2.updated ??= /* @__PURE__ */ new Map();
        const count2 = (source2.updated.get("")?.count ?? 0) + 1;
        source2.updated.set("", {
          error: (
            /** @type {any} */
            null
          ),
          count: count2
        });
        if (tracing_mode_flag || count2 > 5) {
          const error = get_error("updated at");
          if (error !== null) {
            let entry = source2.updated.get(error.stack);
            if (!entry) {
              entry = {
                error,
                count: 0
              };
              source2.updated.set(error.stack, entry);
            }
            entry.count++;
          }
        }
      }
      if (active_effect !== null) {
        source2.set_during_effect = true;
      }
    }
    if ((source2.f & DERIVED) !== 0) {
      const derived2 = (
        /** @type {Derived} */
        source2
      );
      if ((source2.f & DIRTY) !== 0) {
        execute_derived(derived2);
      }
      if (batch_values === null) {
        update_derived_status(derived2);
      }
    }
    source2.wv = increment_write_version();
    seen = null;
    count_deps = 0;
    mark_reactions(source2, DIRTY, updated_during_traversal);
    seen = null;
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([
          source2
        ]);
      } else {
        untracked_writes.push(source2);
      }
    }
    if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
      flush_eager_effects();
    }
  }
  return value;
}
function flush_eager_effects() {
  eager_effects_deferred = false;
  for (const effect2 of eager_effects) {
    if ((effect2.f & CLEAN) !== 0) {
      set_signal_status(effect2, MAYBE_DIRTY);
    }
    let dirty;
    try {
      dirty = is_dirty(effect2);
    } catch {
      dirty = true;
    }
    if (dirty) {
      update_effect(effect2);
    }
  }
  eager_effects.clear();
}
function increment(source2) {
  set(source2, source2.v + 1);
}
function mark_reactions(signal, status, updated_during_traversal) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  count_deps += length;
  if (count_deps > 1e5 && seen === null) seen = /* @__PURE__ */ new Set();
  if (seen !== null) {
    if (seen.has(signal)) return;
    seen.add(signal);
  }
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    if (!runes && reaction === active_effect) continue;
    var not_dirty = (flags2 & DIRTY) === 0;
    if (not_dirty) {
      set_signal_status(reaction, status);
    }
    if ((flags2 & EAGER_EFFECT) !== 0) {
      eager_effects.add(
        /** @type {Effect} */
        reaction
      );
    } else if ((flags2 & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        reaction
      );
      batch_values?.delete(derived2);
      mark_reactions(derived2, MAYBE_DIRTY, updated_during_traversal);
    } else if (not_dirty) {
      var effect2 = (
        /** @type {Effect} */
        reaction
      );
      if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
        eager_block_effects.add(effect2);
      }
      if (updated_during_traversal !== null) {
        updated_during_traversal.push(effect2);
      } else {
        schedule_effect(effect2);
      }
    }
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/proxy.js
var regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function proxy(value) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value || COMPONENT_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = state(0);
  var stack2 = dev_fallback_default && tracing_mode_flag ? get_error("created at") : null;
  var parent_version = update_version;
  var with_parent = (fn) => {
    if (update_version === parent_version) {
      return fn();
    }
    var reaction = active_reaction;
    var version2 = update_version;
    set_active_reaction(null);
    set_update_version(parent_version);
    var result = fn();
    set_active_reaction(reaction);
    set_update_version(version2);
    return result;
  };
  if (is_proxied_array) {
    sources.set("length", state(
      /** @type {any[]} */
      value.length,
      stack2
    ));
    if (dev_fallback_default) {
      value = /** @type {any} */
      inspectable_array(
        /** @type {any[]} */
        value
      );
    }
  }
  var path = "";
  let updating = false;
  function update_path(new_path) {
    if (updating) return;
    updating = true;
    path = new_path;
    tag(version, `${path} version`);
    for (const [prop2, source2] of sources) {
      tag(source2, get_label(path, prop2));
    }
    updating = false;
  }
  return new Proxy(
    /** @type {any} */
    value,
    {
      defineProperty(_, prop2, descriptor) {
        if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
          state_descriptors_fixed();
        }
        var s = sources.get(prop2);
        if (s === void 0) {
          with_parent(() => {
            var s2 = state(descriptor.value, stack2);
            sources.set(prop2, s2);
            if (dev_fallback_default && typeof prop2 === "string") {
              tag(s2, get_label(path, prop2));
            }
            return s2;
          });
        } else {
          set(s, descriptor.value, true);
        }
        return true;
      },
      deleteProperty(target, prop2) {
        var s = sources.get(prop2);
        if (s === void 0) {
          if (prop2 in target) {
            const s2 = with_parent(() => state(UNINITIALIZED, stack2));
            sources.set(prop2, s2);
            increment(version);
            if (dev_fallback_default) {
              tag(s2, get_label(path, prop2));
            }
          }
        } else {
          set(s, UNINITIALIZED);
          increment(version);
        }
        return true;
      },
      get(target, prop2, receiver) {
        if (prop2 === STATE_SYMBOL) {
          return value;
        }
        if (dev_fallback_default && prop2 === PROXY_PATH_SYMBOL) {
          return update_path;
        }
        var s = sources.get(prop2);
        var exists = prop2 in target;
        if (s === void 0 && (!exists || get_descriptor(target, prop2)?.writable)) {
          s = with_parent(() => {
            var p = proxy(exists ? target[prop2] : UNINITIALIZED);
            var s2 = state(p, stack2);
            if (dev_fallback_default) {
              tag(s2, get_label(path, prop2));
            }
            return s2;
          });
          sources.set(prop2, s);
        }
        if (s !== void 0) {
          var v = get(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop2, receiver);
      },
      getOwnPropertyDescriptor(target, prop2) {
        this.has?.(target, prop2);
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        var s = sources.get(prop2);
        if (s !== void 0) {
          var value2 = get(s);
          if (value2 === UNINITIALIZED) {
            return void 0;
          }
          if (descriptor && "value" in descriptor) {
            descriptor.value = value2;
          } else {
            return {
              enumerable: true,
              configurable: true,
              value: value2,
              writable: true
            };
          }
        }
        return descriptor;
      },
      has(target, prop2) {
        if (prop2 === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop2);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
        if (s !== void 0 || (active_effect !== null || active_reaction !== null) && (!has || get_descriptor(target, prop2)?.writable)) {
          if (s === void 0) {
            s = with_parent(() => {
              var p = has ? proxy(target[prop2]) : UNINITIALIZED;
              var s2 = state(p, stack2);
              if (dev_fallback_default) {
                tag(s2, get_label(path, prop2));
              }
              return s2;
            });
            sources.set(prop2, s);
          }
          var value2 = get(s);
          if (value2 === UNINITIALIZED) {
            return false;
          }
        }
        return has;
      },
      set(target, prop2, value2, receiver) {
        var s = sources.get(prop2);
        var has = prop2 in target;
        if (is_proxied_array && prop2 === "length") {
          for (var i = value2; i < /** @type {Source<number>} */
          s.v; i += 1) {
            var other_s = sources.get(i + "");
            if (other_s !== void 0) {
              set(other_s, UNINITIALIZED);
            } else if (i in target) {
              other_s = with_parent(() => state(UNINITIALIZED, stack2));
              sources.set(i + "", other_s);
              if (dev_fallback_default) {
                tag(other_s, get_label(path, i));
              }
            }
          }
        }
        if (s === void 0) {
          if (!has || get_descriptor(target, prop2)?.writable) {
            s = with_parent(() => state(void 0, stack2));
            if (dev_fallback_default) {
              tag(s, get_label(path, prop2));
            }
            set(s, proxy(value2));
            sources.set(prop2, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          var p = with_parent(() => proxy(value2));
          set(s, p);
        }
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor?.set) {
          descriptor.set.call(receiver, value2);
        }
        if (!has) {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n >= ls.v) {
              set(ls, n + 1);
            }
          }
          increment(version);
        }
        return true;
      },
      ownKeys(target) {
        get(version);
        var own_keys = Reflect.ownKeys(target).filter((key3) => {
          var source3 = sources.get(key3);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key2, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key2 in target)) {
            own_keys.push(key2);
          }
        }
        return own_keys;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function get_label(path, prop2) {
  if (typeof prop2 === "symbol") return `${path}[Symbol(${prop2.description ?? ""})]`;
  if (regex_is_valid_identifier.test(prop2)) return `${path}.${prop2}`;
  return /^\d+$/.test(prop2) ? `${path}[${prop2}]` : `${path}['${prop2}']`;
}
function get_proxied_value(value) {
  try {
    if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
      return value[STATE_SYMBOL];
    }
  } catch {
  }
  return value;
}
var ARRAY_MUTATING_METHODS = /* @__PURE__ */ new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]);
function inspectable_array(array) {
  return new Proxy(array, {
    get(target, prop2, receiver) {
      var value = Reflect.get(target, prop2, receiver);
      if (!ARRAY_MUTATING_METHODS.has(
        /** @type {string} */
        prop2
      )) {
        return value;
      }
      return function(...args) {
        set_eager_effects_deferred();
        var result = value.apply(this, args);
        flush_eager_effects();
        return result;
      };
    }
  });
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dev/equality.js
function init_array_prototype_warnings() {
  const array_prototype2 = Array.prototype;
  const cleanup = Array.__svelte_cleanup;
  if (cleanup) {
    cleanup();
  }
  const { indexOf, lastIndexOf, includes: includes2 } = array_prototype2;
  array_prototype2.indexOf = function(item, from_index) {
    const index2 = indexOf.call(this, item, from_index);
    if (index2 === -1) {
      for (let i = from_index ?? 0; i < this.length; i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.indexOf(...)");
          break;
        }
      }
    }
    return index2;
  };
  array_prototype2.lastIndexOf = function(item, from_index) {
    const index2 = lastIndexOf.call(this, item, from_index ?? this.length - 1);
    if (index2 === -1) {
      for (let i = 0; i <= (from_index ?? this.length - 1); i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.lastIndexOf(...)");
          break;
        }
      }
    }
    return index2;
  };
  array_prototype2.includes = function(item, from_index) {
    const has = includes2.call(this, item, from_index);
    if (!has) {
      for (let i = 0; i < this.length; i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.includes(...)");
          break;
        }
      }
    }
    return has;
  };
  Array.__svelte_cleanup = () => {
    array_prototype2.indexOf = indexOf;
    array_prototype2.lastIndexOf = lastIndexOf;
    array_prototype2.includes = includes2;
  };
}
function strict_equals(a, b, equal = true) {
  try {
    if (a === b !== (get_proxied_value(a) === get_proxied_value(b))) {
      state_proxy_equality_mismatch(equal ? "===" : "!==");
    }
  } catch {
  }
  return a === b === equal;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/operations.js
var $window;
var $document;
var is_firefox;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  $document = document;
  is_firefox = /Firefox/.test(navigator.userAgent);
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  var text_prototype = Text.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  if (is_extensible(element_prototype)) {
    element_prototype[CLASS_CACHE] = void 0;
    element_prototype[ATTRIBUTES_CACHE] = null;
    element_prototype[STYLE_CACHE] = void 0;
    element_prototype.__e = void 0;
  }
  if (is_extensible(text_prototype)) {
    text_prototype[TEXT_CACHE] = void 0;
  }
  if (dev_fallback_default) {
    element_prototype.__svelte_meta = null;
    init_array_prototype_warnings();
  }
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return (
    /** @type {TemplateNode | null} */
    first_child_getter.call(node)
  );
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return (
    /** @type {TemplateNode | null} */
    next_sibling_getter.call(node)
  );
}
function child(node, is_text) {
  if (!hydrating) {
    return /* @__PURE__ */ get_first_child(node);
  }
  var child2 = /* @__PURE__ */ get_first_child(hydrate_node);
  if (child2 === null) {
    child2 = hydrate_node.appendChild(create_text());
  } else if (is_text && child2.nodeType !== TEXT_NODE) {
    var text2 = create_text();
    child2?.before(text2);
    set_hydrate_node(text2);
    return text2;
  }
  if (is_text) {
    merge_text_nodes(
      /** @type {Text} */
      child2
    );
  }
  set_hydrate_node(child2);
  return child2;
}
function only_child(node, is_text = false) {
  if (!hydrating) {
    return /* @__PURE__ */ get_first_child(node);
  }
  var first = child(node, is_text);
  reset(node);
  return first;
}
function sibling(node, count2 = 1, is_text = false) {
  let next_sibling = hydrating ? hydrate_node : node;
  var last_sibling;
  while (count2--) {
    last_sibling = next_sibling;
    next_sibling = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(next_sibling);
  }
  if (!hydrating) {
    return next_sibling;
  }
  if (is_text) {
    if (next_sibling?.nodeType !== TEXT_NODE) {
      var text2 = create_text();
      if (next_sibling === null) {
        last_sibling?.after(text2);
      } else {
        next_sibling.before(text2);
      }
      set_hydrate_node(text2);
      return text2;
    }
    merge_text_nodes(
      /** @type {Text} */
      next_sibling
    );
  }
  set_hydrate_node(next_sibling);
  return next_sibling;
}
function clear_text_content(node) {
  node.textContent = "";
}
function should_defer_append() {
  if (!async_mode_flag) return false;
  if (eager_block_effects !== null) return false;
  var flags2 = (
    /** @type {Effect} */
    active_effect.f
  );
  return (flags2 & REACTION_RAN) !== 0;
}
function create_element(tag2, namespace, is2) {
  if (namespace == null || namespace === NAMESPACE_HTML) {
    return (
      /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
      is2 ? document.createElement(tag2, {
        is: is2
      }) : document.createElement(tag2)
    );
  }
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    is2 ? document.createElementNS(namespace, tag2, {
      is: is2
    }) : document.createElementNS(namespace, tag2)
  );
}
function merge_text_nodes(text2) {
  if (
    /** @type {string} */
    text2.nodeValue.length < 65536
  ) {
    return;
  }
  let next2 = text2.nextSibling;
  while (next2 !== null && next2.nodeType === TEXT_NODE) {
    next2.remove();
    text2.nodeValue += /** @type {string} */
    next2.nodeValue;
    next2 = text2.nextSibling;
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/error-handling.js
var adjustments = /* @__PURE__ */ new WeakMap();
function handle_error(error) {
  var effect2 = active_effect;
  if (effect2 === null) {
    active_reaction.f |= ERROR_VALUE;
    return error;
  }
  if (dev_fallback_default && error instanceof Error && !adjustments.has(error)) {
    adjustments.set(error, get_adjustments(error, effect2));
  }
  if ((effect2.f & REACTION_RAN) === 0 && (effect2.f & EFFECT) === 0) {
    if (dev_fallback_default && !effect2.parent && error instanceof Error) {
      apply_adjustments(error);
    }
    throw error;
  }
  invoke_error_boundary(error, effect2);
}
function invoke_error_boundary(error, effect2) {
  if (error === HYDRATION_ERROR) {
    throw error;
  }
  if (effect2 !== null && (effect2.f & DESTROYED) !== 0) {
    return;
  }
  while (effect2 !== null) {
    if ((effect2.f & BOUNDARY_EFFECT) !== 0 && (effect2.f & (DESTROYED | DESTROYING)) === 0) {
      if ((effect2.f & REACTION_RAN) === 0) {
        throw error;
      }
      try {
        effect2.b.error(error);
        return;
      } catch (e) {
        error = e;
      }
    }
    effect2 = effect2.parent;
  }
  if (dev_fallback_default && error instanceof Error) {
    apply_adjustments(error);
  }
  throw error;
}
function get_adjustments(error, effect2) {
  const message_descriptor = get_descriptor(error, "message");
  if (message_descriptor && !message_descriptor.configurable) return;
  var indent = is_firefox ? "  " : "	";
  var component_stack = `
${indent}in ${effect2.fn?.name || "<unknown>"}`;
  var context = effect2.ctx;
  while (context !== null) {
    component_stack += `
${indent}in ${context.function?.[FILENAME].split("/").pop()}`;
    context = context.p;
  }
  return {
    message: error.message + `
${component_stack}
`,
    stack: error.stack?.split("\n").filter((line) => !line.includes("svelte/src/internal")).join("\n")
  };
}
function apply_adjustments(error) {
  const adjusted = adjustments.get(error);
  if (adjusted) {
    define_property(error, "message", {
      value: adjusted.message
    });
    define_property(error, "stack", {
      value: adjusted.stack
    });
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/effects.js
function validate_effect(rune) {
  if (active_effect === null) {
    if (active_reaction === null) {
      effect_orphan(rune);
    }
    effect_in_unowned_derived();
  }
  if (is_destroying_effect) {
    effect_in_teardown(rune);
  }
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn) {
  var parent = active_effect;
  if (dev_fallback_default) {
    while (parent !== null && (parent.f & EAGER_EFFECT) !== 0) {
      parent = parent.parent;
    }
  }
  if (parent !== null && (parent.f & INERT) !== 0) {
    type |= INERT;
  }
  var effect2 = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: type | DIRTY | CONNECTED,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    b: parent && parent.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (dev_fallback_default) {
    effect2.component_function = dev_current_component_function;
  }
  current_batch?.register_created_effect(effect2);
  var e = effect2;
  if ((type & EFFECT) !== 0) {
    if (collected_effects !== null) {
      collected_effects.push(effect2);
    } else {
      Batch.ensure().schedule(effect2);
    }
  } else if (fn !== null) {
    try {
      update_effect(effect2);
    } catch (e2) {
      destroy_effect(effect2);
      throw e2;
    }
    if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && // either `null`, or a singular child
    (e.f & EFFECT_PRESERVED) === 0) {
      e = e.first;
      if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
        e.f |= EFFECT_TRANSPARENT;
      }
    }
  }
  if (e !== null) {
    e.parent = parent;
    if (parent !== null) {
      push_effect(e, parent);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.effects ??= []).push(e);
    }
  }
  return effect2;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(fn) {
  const effect2 = create_effect(RENDER_EFFECT, null);
  set_signal_status(effect2, CLEAN);
  effect2.teardown = fn;
  return effect2;
}
function user_effect(fn) {
  validate_effect("$effect");
  if (dev_fallback_default) {
    define_property(fn, "name", {
      value: "$effect"
    });
  }
  var flags2 = (
    /** @type {Effect} */
    active_effect.f
  );
  var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && component_context !== null && !component_context.i;
  if (defer) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    (context.e ??= []).push(fn);
  } else {
    return create_user_effect(fn);
  }
}
function create_user_effect(fn) {
  return create_effect(EFFECT | USER_EFFECT, fn);
}
function effect_root(fn) {
  Batch.ensure();
  const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
  return () => {
    destroy_effect(effect2);
  };
}
function component_root(fn) {
  Batch.ensure();
  const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn);
}
function async_effect(fn) {
  return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
function render_effect(fn, flags2 = 0) {
  return create_effect(RENDER_EFFECT | flags2, fn);
}
function template_effect(fn, sync = [], async2 = [], blockers = []) {
  flatten(blockers, sync, async2, (values) => {
    create_effect(RENDER_EFFECT, () => {
      fn(...values.map(get));
    });
  });
}
function block(fn, flags2 = 0) {
  var effect2 = create_effect(BLOCK_EFFECT | flags2, fn);
  if (dev_fallback_default) {
    effect2.dev_stack = dev_stack;
  }
  return effect2;
}
function branch(fn) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
}
function execute_effect_teardown(effect2) {
  var teardown2 = effect2.teardown;
  if (teardown2 !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown2.call(null);
    } catch (error) {
      invoke_error_boundary(error, effect2.parent);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    const controller = effect2.ac;
    if (controller !== null) {
      without_reactive_context(() => {
        controller.abort(STALE_REACTION);
      });
    }
    var next2 = effect2.next;
    if ((effect2.f & ROOT_EFFECT) !== 0) {
      effect2.parent = null;
    } else {
      destroy_effect(effect2, remove_dom);
    }
    effect2 = next2;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next2 = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next2;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
    remove_effect_dom(
      effect2.nodes.start,
      /** @type {TemplateNode} */
      effect2.nodes.end
    );
    removed = true;
  }
  effect2.f |= DESTROYING;
  destroy_effect_children(effect2, remove_dom && !removed);
  remove_reactions(effect2, 0);
  var transitions = effect2.nodes && effect2.nodes.t;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  effect2.f ^= DESTROYING;
  effect2.f |= DESTROYED;
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  if (dev_fallback_default) {
    effect2.component_function = null;
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = effect2.b = null;
}
function remove_effect_dom(node, end) {
  while (node !== null) {
    var next2 = node === end ? null : get_next_sibling(node);
    node.remove();
    node = next2;
  }
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next2 = effect2.next;
  if (prev !== null) prev.next = next2;
  if (next2 !== null) next2.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next2;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback, destroy = true) {
  var transitions = [];
  effect2.f |= PAUSED;
  pause_children(effect2, transitions, true);
  var fn = () => {
    if (destroy) destroy_effect(effect2);
    if (callback) callback();
  };
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition2 of transitions) {
      transition2.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    if ((child2.f & ROOT_EFFECT) === 0) {
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
    }
    child2 = sibling2;
  }
}
function resume_effect(effect2) {
  effect2.f &= ~PAUSED;
  resume_children(effect2, true);
}
function resume_children(effect2, local) {
  if ((effect2.f & PAUSED) !== 0) return;
  if ((effect2.f & INERT) === 0) return;
  effect2.f ^= INERT;
  if ((effect2.f & CLEAN) === 0) {
    set_signal_status(effect2, DIRTY);
    Batch.ensure().schedule(effect2);
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    resume_children(child2, transparent ? local : false);
    child2 = sibling2;
  }
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transition2.in();
      }
    }
  }
}
function move_effect(effect2, fragment) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  while (node !== null) {
    var next2 = node === end ? null : get_next_sibling(node);
    fragment.append(node);
    node = next2;
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/legacy.js
var captured_signals = null;

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/runtime.js
var is_destroying_effect = false;
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
var active_reaction = null;
var untracking = false;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
var active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
var current_sources = null;
function push_reaction_value(value) {
  if (active_reaction !== null && (!async_mode_flag && (active_reaction.f & REACTION_IS_UPDATING) !== 0 || (active_reaction.f & DERIVED) !== 0)) {
    (current_sources ??= /* @__PURE__ */ new Set()).add(value);
  }
}
var new_deps = null;
var skipped_deps = 0;
var untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
var write_version = 1;
var read_version = 0;
var update_version = read_version;
function set_update_version(value) {
  update_version = value;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(reaction) {
  var flags2 = reaction.f;
  if ((flags2 & DIRTY) !== 0) {
    return true;
  }
  if ((flags2 & MAYBE_DIRTY) !== 0) {
    var dependencies = (
      /** @type {Value[]} */
      reaction.deps
    );
    var length = dependencies.length;
    for (var i = 0; i < length; i++) {
      var dependency = dependencies[i];
      if (is_dirty(
        /** @type {Derived} */
        dependency
      )) {
        update_derived(
          /** @type {Derived} */
          dependency
        );
      }
      if (dependency.wv > reaction.wv) {
        return true;
      }
    }
    if ((flags2 & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    batch_values === null) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function schedule_possible_effect_self_invalidation(signal, effect2, root2 = true) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) {
    return;
  }
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & DERIVED) !== 0) {
      schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        reaction,
        effect2,
        false
      );
    } else if (effect2 === reaction) {
      if (root2) {
        set_signal_status(reaction, DIRTY);
      } else if ((reaction.f & CLEAN) !== 0) {
        set_signal_status(reaction, MAYBE_DIRTY);
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}
function update_reaction(reaction) {
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_sources = current_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var previous_update_version = update_version;
  var flags2 = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  current_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  update_version = ++read_version;
  if (reaction.ac !== null) {
    without_reactive_context(() => {
      reaction.ac.abort(STALE_REACTION);
    });
    reaction.ac = null;
  }
  try {
    reaction.f |= REACTION_IS_UPDATING;
    var fn = (
      /** @type {Function} */
      reaction.fn
    );
    var result = fn();
    reaction.f |= REACTION_RAN;
    var deps = update_dependencies(reaction);
    if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
      for (var i = 0; i < /** @type {Source[]} */
      untracked_writes.length; i++) {
        schedule_possible_effect_self_invalidation(
          untracked_writes[i],
          /** @type {Effect} */
          reaction
        );
      }
    }
    if (previous_reaction !== null && previous_reaction !== reaction) {
      read_version++;
      if (previous_reaction.deps !== null) {
        for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) {
          previous_reaction.deps[i2].rv = read_version;
        }
      }
      if (previous_deps !== null) {
        for (const dep of previous_deps) {
          dep.rv = read_version;
        }
      }
      if (untracked_writes !== null) {
        if (previous_untracked_writes === null) {
          previous_untracked_writes = untracked_writes;
        } else {
          previous_untracked_writes.push(.../** @type {Source[]} */
          untracked_writes);
        }
      }
    }
    if ((reaction.f & ERROR_VALUE) !== 0) {
      reaction.f ^= ERROR_VALUE;
    }
    return result;
  } catch (error) {
    update_dependencies(reaction);
    return handle_error(error);
  } finally {
    reaction.f ^= REACTION_IS_UPDATING;
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    current_sources = previous_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    update_version = previous_update_version;
  }
}
function update_dependencies(reaction) {
  var deps = reaction.deps;
  var is_fork = current_batch?.is_fork;
  if (new_deps !== null) {
    var i;
    if (!is_fork) {
      remove_reactions(reaction, skipped_deps);
    }
    if (deps !== null && skipped_deps > 0) {
      deps.length = skipped_deps + new_deps.length;
      for (i = 0; i < new_deps.length; i++) {
        deps[skipped_deps + i] = new_deps[i];
      }
    } else {
      reaction.deps = deps = new_deps;
    }
    if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
      for (i = skipped_deps; i < deps.length; i++) {
        (deps[i].reactions ??= []).push(reaction);
      }
    }
  } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
    remove_reactions(reaction, skipped_deps);
    deps.length = skipped_deps;
  }
  return deps;
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index2 = index_of.call(reactions, signal);
    if (index2 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index2] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !includes.call(new_deps, dependency))) {
    var derived2 = (
      /** @type {Derived} */
      dependency
    );
    if ((derived2.f & CONNECTED) !== 0) {
      derived2.f ^= CONNECTED;
    }
    if (derived2.v !== UNINITIALIZED) {
      update_derived_status(derived2);
    }
    if (derived2.ac !== null) {
      without_reactive_context(() => {
        derived2.ac.abort(STALE_REACTION);
        derived2.ac = null;
        set_signal_status(derived2, DIRTY);
      });
    }
    freeze_derived_effects(derived2);
    remove_reactions(derived2, 0);
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags2 = effect2.f;
  if ((flags2 & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  active_effect = effect2;
  if (dev_fallback_default) {
    var previous_component_fn = dev_current_component_function;
    set_dev_current_component_function(effect2.component_function);
    var previous_stack = (
      /** @type {any} */
      dev_stack
    );
    set_dev_stack(effect2.dev_stack ?? dev_stack);
  }
  try {
    if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.wv = write_version;
    if (dev_fallback_default && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) {
      for (var dep of effect2.deps) {
        if (dep.set_during_effect) {
          dep.wv = increment_write_version();
          dep.set_during_effect = false;
        }
      }
    }
  } finally {
    active_effect = previous_effect;
    if (dev_fallback_default) {
      set_dev_current_component_function(previous_component_fn);
      set_dev_stack(previous_stack);
    }
  }
}
function get(signal) {
  var flags2 = signal.f;
  var is_derived = (flags2 & DERIVED) !== 0;
  captured_signals?.add(signal);
  if (active_reaction !== null && !untracking) {
    var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!destroyed && (current_sources === null || !current_sources.has(signal))) {
      var deps = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
            skipped_deps++;
          } else if (new_deps === null) {
            new_deps = [
              signal
            ];
          } else {
            new_deps.push(signal);
          }
        }
      } else {
        active_reaction.deps ??= [];
        if (!includes.call(active_reaction.deps, signal)) {
          active_reaction.deps.push(signal);
        }
        var reactions = signal.reactions;
        if (reactions === null) {
          signal.reactions = [
            active_reaction
          ];
        } else if (!includes.call(reactions, active_reaction)) {
          reactions.push(active_reaction);
        }
      }
    }
  }
  if (dev_fallback_default) {
    if (!untracking && reactivity_loss_tracker && // By checking that current/previous batch are null we filter out false positives.
    // reactivity_loss_tracker is only reset after a microtask, so if a flush happens
    // before that, we get warnings for things we shouldn't warn on.
    current_batch === null && previous_batch === null && !reactivity_loss_tracker.warned && (reactivity_loss_tracker.effect.f & REACTION_IS_UPDATING) === 0 && !reactivity_loss_tracker.effect_deps.has(signal)) {
      reactivity_loss_tracker.warned = true;
      await_reactivity_loss(
        /** @type {string} */
        signal.label
      );
      var trace2 = get_error("traced at");
      if (trace2) console.warn(trace2);
    }
    recent_async_deriveds.delete(signal);
    if (tracing_mode_flag && !untracking && tracing_expressions !== null && active_reaction !== null && tracing_expressions.reaction === active_reaction) {
      if (signal.trace) {
        signal.trace();
      } else {
        trace2 = get_error("traced at");
        if (trace2) {
          var entry = tracing_expressions.entries.get(signal);
          if (entry === void 0) {
            entry = {
              traces: []
            };
            tracing_expressions.entries.set(signal, entry);
          }
          var last = entry.traces[entry.traces.length - 1];
          if (trace2.stack !== last?.stack) {
            entry.traces.push(trace2);
          }
        }
      }
    }
  }
  if (is_destroying_effect && old_values.has(signal)) {
    return old_values.get(signal);
  }
  if (is_derived) {
    var derived2 = (
      /** @type {Derived} */
      signal
    );
    if (is_destroying_effect) {
      var value = derived2.v;
      if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) {
        value = execute_derived(derived2);
      }
      old_values.set(derived2, value);
      return value;
    }
    var should_connect = (derived2.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (active_reaction.f & CONNECTED) !== 0;
    var is_new = (derived2.f & REACTION_RAN) === 0;
    if (is_dirty(derived2)) {
      if (should_connect) {
        derived2.f |= CONNECTED;
      }
      update_derived(derived2);
    }
    if (should_connect && !is_new) {
      unfreeze_derived_effects(derived2);
      reconnect(derived2);
    }
  }
  if (batch_values?.has(signal)) {
    return batch_values.get(signal);
  }
  if ((signal.f & ERROR_VALUE) !== 0) {
    throw signal.v;
  }
  return signal.v;
}
function reconnect(derived2) {
  derived2.f |= CONNECTED;
  if (derived2.deps === null) return;
  for (const dep of derived2.deps) {
    var reactions = dep.reactions;
    if (reactions === null) {
      dep.reactions = [
        derived2
      ];
    } else if (!includes.call(reactions, derived2)) {
      reactions.push(derived2);
    }
    if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
      unfreeze_derived_effects(
        /** @type {Derived} */
        dep
      );
      reconnect(
        /** @type {Derived} */
        dep
      );
    }
  }
}
function depends_on_old_values(derived2) {
  if (derived2.v === UNINITIALIZED) return true;
  if (derived2.deps === null) return false;
  for (const dep of derived2.deps) {
    if (old_values.has(dep)) {
      return true;
    }
    if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
      /** @type {Derived} */
      dep
    )) {
      return true;
    }
  }
  return false;
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/utils.js
var DOM_BOOLEAN_ATTRIBUTES = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "indeterminate",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected",
  "webkitdirectory",
  "defer",
  "disablepictureinpicture",
  "disableremoteplayback"
];
var DOM_PROPERTIES = [
  ...DOM_BOOLEAN_ATTRIBUTES,
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  "readOnly",
  "value",
  "volume",
  "defaultValue",
  "defaultChecked",
  "srcObject",
  "noValidate",
  "allowFullscreen",
  "disablePictureInPicture",
  "disableRemotePlayback"
];
var PASSIVE_EVENTS = [
  "touchstart",
  "touchmove"
];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
var STATE_CREATION_RUNES = (
  /** @type {const} */
  [
    "$state",
    "$state.raw",
    "$derived",
    "$derived.by"
  ]
);
var RUNES = (
  /** @type {const} */
  [
    ...STATE_CREATION_RUNES,
    "$state.eager",
    "$state.snapshot",
    "$props",
    "$props.id",
    "$bindable",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$effect.pending",
    "$inspect",
    "$inspect().with",
    "$inspect.trace",
    "$host"
  ]
);

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dev/css.js
var all_styles = /* @__PURE__ */ new Map();
function register_style(hash2, style) {
  var styles = all_styles.get(hash2);
  if (!styles) {
    styles = /* @__PURE__ */ new Set();
    all_styles.set(hash2, styles);
  }
  styles.add(style);
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dev/elements.js
function add_locations(fn, filename, locations) {
  return (...args) => {
    const dom = fn(...args);
    var node = hydrating ? dom : dom.nodeType === DOCUMENT_FRAGMENT_NODE ? dom.firstChild : dom;
    assign_locations(node, filename, locations);
    return dom;
  };
}
function assign_location(element2, filename, location) {
  element2.__svelte_meta = {
    parent: dev_stack,
    loc: {
      file: filename,
      line: location[0],
      column: location[1]
    }
  };
  if (location[2]) {
    assign_locations(element2.firstChild, filename, location[2]);
  }
}
function assign_locations(node, filename, locations) {
  var i = 0;
  var depth = 0;
  while (node && i < locations.length) {
    if (hydrating && node.nodeType === COMMENT_NODE) {
      var comment2 = (
        /** @type {Comment} */
        node
      );
      if (comment2.data[0] === HYDRATION_START) depth += 1;
      else if (comment2.data[0] === HYDRATION_END) depth -= 1;
    }
    if (depth === 0 && node.nodeType === ELEMENT_NODE) {
      assign_location(
        /** @type {Element} */
        node,
        filename,
        locations[i++]
      );
    }
    node = node.nextSibling;
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/events.js
var event_symbol = Symbol("events");
var all_registered_events = /* @__PURE__ */ new Set();
var root_event_handles = /* @__PURE__ */ new Set();
function delegated(event_name, element2, handler) {
  (element2[event_symbol] ??= {})[event_name] = handler;
}
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
var last_propagated_event = null;
var last_propagated_event_clear_scheduled = false;
function handle_event_propagation(event2) {
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = event2.composedPath?.() || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  last_propagated_event = event2;
  if (!last_propagated_event_clear_scheduled) {
    last_propagated_event_clear_scheduled = true;
    setTimeout(() => {
      last_propagated_event_clear_scheduled = false;
      last_propagated_event = null;
    });
  }
  var path_idx = 0;
  var handled_at = last_propagated_event === event2 && event2[event_symbol];
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2[event_symbol] = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  if (current_target === handler_element) return;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      if (current_target === handler_element) break;
      try {
        var delegated2 = current_target[event_symbol]?.[event_name];
        if (delegated2 != null && (!/** @type {any} */
        current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
        // -> the target could not have been disabled because it emits the event in the first place
        event2.target === current_target)) {
          delegated2.call(current_target, event2);
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event2.cancelBubble) break;
      path_idx++;
      current_target = path_idx < path.length ? (
        /** @type {Element} */
        path[path_idx]
      ) : null;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event2[event_symbol] = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/reconciler.js
var policy = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (html2) => {
      return html2;
    }
  })
);
function create_trusted_html(html2) {
  return (
    /** @type {string} */
    policy?.createHTML(html2) ?? html2
  );
}
function create_fragment_from_html(html2) {
  var elem = create_element("template");
  elem.innerHTML = create_trusted_html(html2.replaceAll("<!>", "<!---->"));
  return elem.content;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/template.js
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes === null) {
    effect2.nodes = {
      start,
      end,
      a: null,
      t: null
    };
  }
}
// @__NO_SIDE_EFFECTS__
function from_html(content, flags2) {
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (hydrating) {
      assign_nodes(hydrate_node, null);
      return hydrate_node;
    }
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {TemplateNode} */
      get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function append(anchor, dom) {
  if (hydrating) {
    var effect2 = (
      /** @type {Effect & { nodes: EffectNodes }} */
      active_effect
    );
    if ((effect2.f & REACTION_RAN) === 0 || effect2.nodes.end === null) {
      effect2.nodes.end = hydrate_node;
    }
    hydrate_next();
    return;
  }
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/reactivity/create-subscriber.js
function createSubscriber(start) {
  let subscribers = 0;
  let version = source(0);
  let stop;
  if (dev_fallback_default) {
    tag(version, "createSubscriber version");
  }
  return () => {
    if (effect_tracking()) {
      get(version);
      render_effect(() => {
        if (subscribers === 0) {
          stop = untrack(() => start(() => increment(version)));
        }
        subscribers += 1;
        return () => {
          queue_micro_task(() => {
            subscribers -= 1;
            if (subscribers === 0) {
              stop?.();
              stop = void 0;
              increment(version);
            }
          });
        };
      });
    }
  };
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
function boundary(node, props, children, transform_error) {
  new Boundary(node, props, children, transform_error);
}
var Boundary = class {
  /** @type {Boundary | null} */
  parent;
  is_pending = false;
  /**
  * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
  * Inherited from parent boundary, or defaults to identity.
  * @type {(error: unknown) => unknown}
  */
  transform_error;
  /** @type {TemplateNode} */
  #anchor;
  /** @type {TemplateNode | null} */
  #hydrate_open = hydrating ? hydrate_node : null;
  /** @type {BoundaryProps} */
  #props;
  /** @type {((anchor: Node) => void)} */
  #children;
  /** @type {Effect} */
  #effect;
  /** @type {Effect | null} */
  #main_effect = null;
  /** @type {Effect | null} */
  #pending_effect = null;
  /** @type {Effect | null} */
  #failed_effect = null;
  /** @type {DocumentFragment | null} */
  #offscreen_fragment = null;
  #local_pending_count = 0;
  #pending_count = 0;
  #pending_count_update_queued = false;
  /** @type {Map<Effect, number>} */
  #dirty_reactions = /* @__PURE__ */ new Map();
  /**
  * A source containing the number of pending async deriveds/expressions.
  * Only created if `$effect.pending()` is used inside the boundary,
  * otherwise updating the source results in needless `Batch.ensure()`
  * calls followed by no-op flushes
  * @type {Source<number> | null}
  */
  #effect_pending = null;
  #effect_pending_subscriber = createSubscriber(() => {
    this.#effect_pending = source(this.#local_pending_count);
    if (dev_fallback_default) {
      tag(this.#effect_pending, "$effect.pending()");
    }
    return () => {
      this.#effect_pending = null;
    };
  });
  /**
  * @param {TemplateNode} node
  * @param {BoundaryProps} props
  * @param {((anchor: Node) => void)} children
  * @param {((error: unknown) => unknown) | undefined} [transform_error]
  */
  constructor(node, props, children, transform_error) {
    this.#anchor = node;
    this.#props = props;
    this.#children = (anchor) => {
      var effect2 = (
        /** @type {Effect} */
        active_effect
      );
      effect2.b = this;
      effect2.f |= BOUNDARY_EFFECT;
      children(anchor);
    };
    this.parent = /** @type {Effect} */
    active_effect.b;
    this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
    this.#effect = block(() => {
      if (hydrating) {
        const comment_data = read_hydration_instruction(
          /** @type {TemplateNode} */
          this.#hydrate_open
        );
        hydrate_next();
        const server_rendered_pending = comment_data === HYDRATION_START_ELSE;
        const server_rendered_failed = comment_data.startsWith(HYDRATION_START_FAILED);
        if (server_rendered_failed) {
          const serialized_error = JSON.parse(comment_data.slice(HYDRATION_START_FAILED.length));
          this.#hydrate_failed_content(serialized_error);
        } else if (server_rendered_pending) {
          this.#hydrate_pending_content();
        } else {
          this.#hydrate_resolved_content();
        }
      } else {
        this.#render();
      }
    }, flags);
    if (hydrating) {
      this.#anchor = hydrate_node;
    }
  }
  #hydrate_resolved_content() {
    try {
      this.#main_effect = branch(() => this.#children(this.#anchor));
    } catch (error) {
      this.error(error);
    }
  }
  /**
  * @param {unknown} error The deserialized error from the server's hydration comment
  */
  #hydrate_failed_content(error) {
    const failed = this.#props.failed;
    const { reset: reset2, invoke_onerror } = this.#create_reset(error);
    queue_micro_task(invoke_onerror);
    if (!failed) return;
    this.#failed_effect = branch(() => {
      failed(this.#anchor, () => error, () => reset2);
    });
  }
  /**
  * Creates the `reset` function for a failed boundary, along with a function
  * that invokes `onerror` with it (if provided)
  * @param {unknown} error
  * @returns {{ reset: () => void, invoke_onerror: () => void }}
  */
  #create_reset(error) {
    var did_reset = false;
    var calling_on_error = false;
    const reset2 = () => {
      if (this.#is_destroyed()) return;
      if (did_reset) {
        svelte_boundary_reset_noop();
        return;
      }
      did_reset = true;
      if (calling_on_error) {
        svelte_boundary_reset_onerror();
      }
      if (this.#failed_effect !== null) {
        pause_effect(this.#failed_effect, () => {
          this.#failed_effect = null;
        });
      }
      this.#run(() => {
        this.#render();
      });
    };
    const invoke_onerror = () => {
      if (this.#is_destroyed()) return;
      try {
        calling_on_error = true;
        this.#props.onerror?.(error, reset2);
        calling_on_error = false;
      } catch (err) {
        invoke_error_boundary(err, this.#effect && this.#effect.parent);
      }
    };
    return {
      reset: reset2,
      invoke_onerror
    };
  }
  #is_destroyed() {
    return (this.#effect.f & (DESTROYED | DESTROYING)) !== 0;
  }
  #hydrate_pending_content() {
    const pending2 = this.#props.pending;
    if (!pending2) return;
    this.is_pending = true;
    this.#pending_effect = branch(() => pending2(this.#anchor));
    queue_micro_task(() => {
      if (this.#is_destroyed()) return;
      var fragment = this.#offscreen_fragment = document.createDocumentFragment();
      var anchor = create_text();
      var handled = false;
      fragment.append(anchor);
      this.#main_effect = this.#run(() => {
        try {
          return branch(() => this.#children(anchor));
        } catch (error) {
          try {
            this.error(error);
            handled = true;
          } catch (error2) {
            invoke_error_boundary(error2, this.#effect.parent);
          }
          return null;
        }
      });
      if (this.#main_effect === null) {
        this.#offscreen_fragment = null;
        if (handled) this.#resolve(
          /** @type {Batch} */
          current_batch
        );
        return;
      }
      if (this.#pending_count === 0) {
        this.#anchor.before(fragment);
        this.#offscreen_fragment = null;
        pause_effect(
          /** @type {Effect} */
          this.#pending_effect,
          () => {
            this.#pending_effect = null;
          }
        );
        this.#resolve(
          /** @type {Batch} */
          current_batch
        );
      }
    });
  }
  #render() {
    try {
      this.is_pending = this.has_pending_snippet();
      this.#pending_count = 0;
      this.#local_pending_count = 0;
      this.#main_effect = branch(() => {
        this.#children(this.#anchor);
      });
      if (this.#pending_count > 0) {
        var fragment = this.#offscreen_fragment = document.createDocumentFragment();
        move_effect(this.#main_effect, fragment);
        const pending2 = (
          /** @type {(anchor: Node) => void} */
          this.#props.pending
        );
        this.#pending_effect = branch(() => pending2(this.#anchor));
      } else {
        this.#resolve(
          /** @type {Batch} */
          current_batch
        );
      }
    } catch (error) {
      this.error(error);
    }
  }
  /**
  * @param {Batch} batch
  */
  #resolve(batch) {
    this.is_pending = false;
    batch.transfer_reactions(this.#dirty_reactions);
  }
  /**
  * Defer an effect inside a pending boundary until the boundary resolves
  * @param {Effect} effect
  */
  defer_effect(effect2) {
    defer_effect(effect2, this.#dirty_reactions);
  }
  /**
  * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
  * @returns {boolean}
  */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#props.pending;
  }
  /**
  * @template T
  * @param {() => T} fn
  */
  #run(fn) {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_ctx = component_context;
    set_active_effect(this.#effect);
    set_active_reaction(this.#effect);
    set_component_context(this.#effect.ctx);
    try {
      Batch.ensure();
      return fn();
    } finally {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_ctx);
    }
  }
  /**
  * Updates the pending count associated with the currently visible pending snippet,
  * if any, such that we can replace the snippet with content once work is done
  * @param {1 | -1} d
  * @param {Batch} batch
  */
  #update_pending_count(d, batch) {
    if (!this.has_pending_snippet()) {
      if (this.parent) {
        this.parent.#update_pending_count(d, batch);
      }
      return;
    }
    this.#pending_count += d;
    if (this.#pending_count === 0) {
      this.#resolve(batch);
      if (this.#pending_effect) {
        pause_effect(this.#pending_effect, () => {
          this.#pending_effect = null;
        });
      }
      if (this.#offscreen_fragment) {
        this.#anchor.before(this.#offscreen_fragment);
        this.#offscreen_fragment = null;
      }
    }
  }
  /**
  * Update the source that powers `$effect.pending()` inside this boundary,
  * and controls when the current `pending` snippet (if any) is removed.
  * Do not call from inside the class
  * @param {1 | -1} d
  * @param {Batch} batch
  */
  update_pending_count(d, batch) {
    this.#update_pending_count(d, batch);
    this.#local_pending_count += d;
    if (!this.#effect_pending || this.#pending_count_update_queued) return;
    this.#pending_count_update_queued = true;
    queue_micro_task(() => {
      this.#pending_count_update_queued = false;
      if (this.#effect_pending) {
        internal_set(this.#effect_pending, this.#local_pending_count);
      }
    });
  }
  get_effect_pending() {
    this.#effect_pending_subscriber();
    return get(
      /** @type {Source<number>} */
      this.#effect_pending
    );
  }
  /** @param {unknown} error */
  error(error) {
    if (error === HYDRATION_ERROR) {
      throw error;
    }
    if (!this.#props.onerror && !this.#props.failed) {
      throw error;
    }
    if (current_batch?.is_fork) {
      if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
      if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
      if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
      current_batch.oncommit(() => {
        if (!this.#is_destroyed()) this.#handle_error(error);
      });
    } else {
      this.#handle_error(error);
    }
  }
  /**
  * @param {unknown} error
  */
  #handle_error(error) {
    if (this.#main_effect) {
      destroy_effect(this.#main_effect);
      this.#main_effect = null;
    }
    if (this.#pending_effect) {
      destroy_effect(this.#pending_effect);
      this.#pending_effect = null;
    }
    if (this.#failed_effect) {
      destroy_effect(this.#failed_effect);
      this.#failed_effect = null;
    }
    if (hydrating) {
      set_hydrate_node(
        /** @type {TemplateNode} */
        this.#hydrate_open
      );
      next();
      set_hydrate_node(skip_nodes());
    }
    let failed = this.#props.failed;
    const handle_error_result = (transformed_error) => {
      if (this.#is_destroyed()) return;
      const { reset: reset2, invoke_onerror } = this.#create_reset(transformed_error);
      invoke_onerror();
      if (failed && !this.#is_destroyed()) {
        this.#failed_effect = this.#run(() => {
          try {
            return branch(() => {
              var effect2 = (
                /** @type {Effect} */
                active_effect
              );
              effect2.b = this;
              effect2.f |= BOUNDARY_EFFECT;
              failed(this.#anchor, () => transformed_error, () => reset2);
            });
          } catch (error2) {
            invoke_error_boundary(
              error2,
              /** @type {Effect} */
              this.#effect.parent
            );
            return null;
          }
        });
      }
    };
    queue_micro_task(() => {
      if (this.#is_destroyed()) return;
      var result;
      try {
        result = this.transform_error(error);
      } catch (e) {
        invoke_error_boundary(e, this.#effect && this.#effect.parent);
        return;
      }
      if (result !== null && typeof result === "object" && typeof /** @type {any} */
      result.then === "function") {
        result.then(
          handle_error_result,
          /** @param {unknown} e */
          (e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
        );
      } else {
        handle_error_result(result);
      }
    });
  }
};

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/render.js
var should_intro = true;
function set_text(text2, value) {
  var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
  if (str !== /** @type {any} */
  (text2[TEXT_CACHE] ??= text2.nodeValue)) {
    text2[TEXT_CACHE] = str;
    text2.nodeValue = `${str}`;
  }
}
function mount(component2, options) {
  return _mount(component2, options);
}
function hydrate(component2, options) {
  init_operations();
  options.intro = options.intro ?? false;
  const target = options.target;
  const was_hydrating = hydrating;
  const previous_hydrate_node = hydrate_node;
  try {
    var anchor = get_first_child(target);
    while (anchor && (anchor.nodeType !== COMMENT_NODE || /** @type {Comment} */
    anchor.data !== HYDRATION_START)) {
      anchor = get_next_sibling(anchor);
    }
    if (!anchor) {
      throw HYDRATION_ERROR;
    }
    set_hydrating(true);
    set_hydrate_node(
      /** @type {Comment} */
      anchor
    );
    const instance = _mount(component2, {
      ...options,
      anchor
    });
    set_hydrating(false);
    return (
      /**  @type {Exports} */
      instance
    );
  } catch (error) {
    if (error instanceof Error && error.message.split("\n").some((line) => line.startsWith("https://svelte.dev/e/"))) {
      throw error;
    }
    if (error !== HYDRATION_ERROR) {
      console.warn("Failed to hydrate: ", error);
    }
    if (options.recover === false) {
      hydration_failed();
    }
    init_operations();
    clear_text_content(target);
    set_hydrating(false);
    return mount(component2, options);
  } finally {
    set_hydrating(was_hydrating);
    set_hydrate_node(previous_hydrate_node);
  }
}
var listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
  init_operations();
  var component2 = void 0;
  var unmount2 = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    boundary(
      /** @type {TemplateNode} */
      anchor_node,
      {
        pending: () => {
        }
      },
      (anchor_node2) => {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        if (context) ctx.c = context;
        if (events) {
          props.$$events = events;
        }
        if (hydrating) {
          assign_nodes(
            /** @type {TemplateNode} */
            anchor_node2,
            null
          );
        }
        should_intro = intro;
        component2 = Component(anchor_node2, props) || mark_as_component();
        should_intro = true;
        if (hydrating) {
          active_effect.nodes.end = hydrate_node;
          if (hydrate_node === null || hydrate_node.nodeType !== COMMENT_NODE || /** @type {Comment} */
          hydrate_node.data !== HYDRATION_END) {
            hydration_mismatch();
            throw HYDRATION_ERROR;
          }
        }
        pop();
      },
      transformError
    );
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive2 = is_passive_event(event_name);
        for (const node of [
          target,
          document
        ]) {
          var counts = listeners.get(node);
          if (counts === void 0) {
            counts = /* @__PURE__ */ new Map();
            listeners.set(node, counts);
          }
          var count2 = counts.get(event_name);
          if (count2 === void 0) {
            node.addEventListener(event_name, handle_event_propagation, {
              passive: passive2
            });
            counts.set(event_name, 1);
          } else {
            counts.set(event_name, count2 + 1);
          }
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    return () => {
      for (var event_name of registered_events) {
        for (const node of [
          target,
          document
        ]) {
          var counts = (
            /** @type {Map<string, number>} */
            listeners.get(node)
          );
          var count2 = (
            /** @type {number} */
            counts.get(event_name)
          );
          if (--count2 == 0) {
            node.removeEventListener(event_name, handle_event_propagation);
            counts.delete(event_name);
            if (counts.size === 0) {
              listeners.delete(node);
            }
          } else {
            counts.set(event_name, count2);
          }
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        anchor_node.parentNode?.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component2, unmount2);
  return component2;
}
var mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(component2, options) {
  const fn = mounted_components.get(component2);
  if (fn) {
    mounted_components.delete(component2);
    return fn(options);
  }
  if (dev_fallback_default) {
    lifecycle_double_unmount();
  }
  return Promise.resolve();
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dev/legacy.js
function check_target(target) {
  if (target) {
    component_api_invalid_new(target[FILENAME] ?? "a component", target.name);
  }
}
function legacy_api() {
  const component2 = component_context?.function;
  function error(method) {
    component_api_changed(method, component2[FILENAME]);
  }
  return {
    $destroy: () => error("$destroy()"),
    $on: () => error("$on(...)"),
    $set: () => error("$set(...)")
  };
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var BranchManager = class {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #batches = /* @__PURE__ */ new Map();
  /**
  * Map of keys to effects that are currently rendered in the DOM.
  * These effects are visible and actively part of the document tree.
  * Example:
  * ```
  * {#if condition}
  * 	foo
  * {:else}
  * 	bar
  * {/if}
  * ```
  * Can result in the entries `true->Effect` and `false->Effect`
  * @type {Map<Key, Effect>}
  */
  #onscreen = /* @__PURE__ */ new Map();
  /**
  * Similar to #onscreen with respect to the keys, but contains branches that are not yet
  * in the DOM, because their insertion is deferred.
  * @type {Map<Key, Branch>}
  */
  #offscreen = /* @__PURE__ */ new Map();
  /**
  * Keys of effects that are currently outroing
  * @type {Set<Key>}
  */
  #outroing = /* @__PURE__ */ new Set();
  /**
  * Whether to pause (i.e. outro) on change, or destroy immediately.
  * This is necessary for `<svelte:element>`
  */
  #transition = true;
  /**
  * @param {TemplateNode} anchor
  * @param {boolean} transition
  */
  constructor(anchor, transition2 = true) {
    this.anchor = anchor;
    this.#transition = transition2;
  }
  /**
  * @param {Batch} batch
  */
  #commit = (batch) => {
    if (!this.#batches.has(batch)) return;
    var key2 = (
      /** @type {Key} */
      this.#batches.get(batch)
    );
    var onscreen = this.#onscreen.get(key2);
    if (onscreen) {
      resume_effect(onscreen);
      this.#outroing.delete(key2);
    } else {
      var offscreen = this.#offscreen.get(key2);
      if (offscreen) {
        resume_effect(offscreen.effect);
        this.#onscreen.set(key2, offscreen.effect);
        this.#offscreen.delete(key2);
        if (dev_fallback_default) {
          offscreen.fragment.lastChild[HMR_ANCHOR] = this.anchor;
        }
        offscreen.fragment.lastChild.remove();
        this.anchor.before(offscreen.fragment);
        onscreen = offscreen.effect;
      }
    }
    for (const [b, k] of this.#batches) {
      this.#batches.delete(b);
      if (b === batch) {
        break;
      }
      const offscreen2 = this.#offscreen.get(k);
      if (offscreen2) {
        destroy_effect(offscreen2.effect);
        this.#offscreen.delete(k);
      }
    }
    for (const [k, effect2] of this.#onscreen) {
      if (k === key2 || this.#outroing.has(k)) continue;
      const on_destroy = () => {
        const keys = Array.from(this.#batches.values());
        if (keys.includes(k)) {
          var fragment = document.createDocumentFragment();
          move_effect(effect2, fragment);
          fragment.append(create_text());
          this.#offscreen.set(k, {
            effect: effect2,
            fragment
          });
        } else {
          destroy_effect(effect2);
        }
        this.#outroing.delete(k);
        this.#onscreen.delete(k);
      };
      if (this.#transition || !onscreen) {
        this.#outroing.add(k);
        pause_effect(effect2, on_destroy, false);
      } else {
        on_destroy();
      }
    }
  };
  /**
  * @param {Batch} batch
  */
  #discard = (batch) => {
    this.#batches.delete(batch);
    const keys = Array.from(this.#batches.values());
    for (const [k, branch2] of this.#offscreen) {
      if (!keys.includes(k)) {
        destroy_effect(branch2.effect);
        this.#offscreen.delete(k);
      }
    }
  };
  /**
  *
  * @param {any} key
  * @param {null | ((target: TemplateNode) => void)} fn
  */
  ensure(key2, fn) {
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    if (fn && !this.#onscreen.has(key2) && !this.#offscreen.has(key2)) {
      if (defer) {
        var fragment = document.createDocumentFragment();
        var target = create_text();
        fragment.append(target);
        this.#offscreen.set(key2, {
          effect: branch(() => fn(target)),
          fragment
        });
      } else {
        this.#onscreen.set(key2, branch(() => fn(this.anchor)));
      }
    }
    this.#batches.set(batch, key2);
    if (defer) {
      for (const [k, effect2] of this.#onscreen) {
        if (k === key2) {
          batch.unskip_effect(effect2);
        } else {
          batch.skip_effect(effect2);
        }
      }
      for (const [k, branch2] of this.#offscreen) {
        if (k === key2) {
          batch.unskip_effect(branch2.effect);
        } else {
          batch.skip_effect(branch2.effect);
        }
      }
      batch.oncommit(this.#commit);
      batch.ondiscard(this.#discard);
    } else {
      if (hydrating) {
        this.anchor = hydrate_node;
      }
      this.#commit(batch);
    }
  }
};

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/if.js
function if_block(node, fn, elseif = false) {
  var marker;
  if (hydrating) {
    marker = hydrate_node;
    hydrate_next();
  }
  var branches = new BranchManager(node);
  var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
  function update_branch(key2, fn2) {
    if (hydrating) {
      var data = read_hydration_instruction(
        /** @type {TemplateNode} */
        marker
      );
      if (key2 !== parseInt(data.substring(1))) {
        var anchor = skip_nodes();
        set_hydrate_node(anchor);
        branches.anchor = anchor;
        set_hydrating(false);
        branches.ensure(key2, fn2);
        set_hydrating(true);
        return;
      }
    }
    branches.ensure(key2, fn2);
  }
  block(() => {
    var has_branch = false;
    fn((fn2, key2 = 0) => {
      has_branch = true;
      update_branch(key2, fn2);
    });
    if (!has_branch) {
      update_branch(-1, null);
    }
  }, flags2);
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/key.js
var NAN = Symbol("NaN");

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/each.js
function pause_effects(state2, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  var group;
  var remaining = to_destroy.length;
  for (var i = 0; i < length; i++) {
    let effect2 = to_destroy[i];
    pause_effect(effect2, () => {
      if (group) {
        group.pending.delete(effect2);
        group.done.add(effect2);
        if (group.pending.size === 0) {
          var groups = (
            /** @type {Set<EachOutroGroup>} */
            state2.outrogroups
          );
          destroy_effects(state2, array_from(group.done));
          groups.delete(group);
          if (groups.size === 0) {
            state2.outrogroups = null;
          }
        }
      } else {
        remaining -= 1;
      }
    }, false);
  }
  if (remaining === 0) {
    var fast_path = transitions.length === 0 && controlled_anchor !== null && state2.pending.size === 0;
    if (fast_path) {
      var anchor = (
        /** @type {Element} */
        controlled_anchor
      );
      var parent_node = (
        /** @type {Element} */
        anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(anchor);
      state2.items.clear();
    }
    destroy_effects(state2, to_destroy, !fast_path);
  } else {
    group = {
      pending: new Set(to_destroy),
      done: /* @__PURE__ */ new Set()
    };
    (state2.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
  }
}
function destroy_effects(state2, to_destroy, remove_dom = true) {
  var preserved_effects;
  if (state2.pending.size > 0) {
    preserved_effects = /* @__PURE__ */ new Set();
    for (const keys of state2.pending.values()) {
      for (const key2 of keys) {
        preserved_effects.add(
          /** @type {EachItem} */
          state2.items.get(key2).e
        );
      }
    }
  }
  for (var i = 0; i < to_destroy.length; i++) {
    var e = to_destroy[i];
    if (preserved_effects?.has(e)) {
      e.f |= EFFECT_OFFSCREEN;
      const fragment = document.createDocumentFragment();
      move_effect(e, fragment);
    } else {
      destroy_effect(to_destroy[i], remove_dom);
    }
  }
}
var offscreen_anchor;
function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var items = /* @__PURE__ */ new Map();
  var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = hydrating ? set_hydrate_node(get_first_child(parent_node)) : parent_node.appendChild(create_text());
  }
  if (hydrating) {
    hydrate_next();
  }
  var fallback2 = null;
  var each_array = derived_safe_equal(() => {
    var collection = get_collection();
    return (
      /** @type {V[]} */
      is_array(collection) ? collection : collection == null ? [] : array_from(collection)
    );
  });
  if (dev_fallback_default) {
    tag(each_array, "{#each ...}");
  }
  var pending2 = /* @__PURE__ */ new Map();
  var first_run = true;
  function commit(batch) {
    if ((state2.effect.f & DESTROYED) !== 0) {
      return;
    }
    state2.pending.delete(batch);
    var array = get(each_array);
    state2.fallback = fallback2;
    reconcile(state2, array, anchor, flags2, get_key);
    if (fallback2 !== null) {
      if (array.length === 0) {
        if ((fallback2.f & EFFECT_OFFSCREEN) === 0) {
          resume_effect(fallback2);
        } else {
          fallback2.f ^= EFFECT_OFFSCREEN;
          move(fallback2, null, anchor);
        }
      } else {
        pause_effect(fallback2, () => {
          fallback2 = null;
        });
      }
    }
  }
  function discard(batch) {
    state2.pending.delete(batch);
  }
  var effect2 = block(() => {
    var array = (
      /** @type {V[]} */
      get(each_array)
    );
    var length = array.length;
    let mismatch = false;
    if (hydrating) {
      var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;
      if (is_else !== (length === 0)) {
        anchor = skip_nodes();
        set_hydrate_node(anchor);
        set_hydrating(false);
        mismatch = true;
      }
    }
    var keys = /* @__PURE__ */ new Set();
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    for (var index2 = 0; index2 < length; index2 += 1) {
      if (hydrating && hydrate_node.nodeType === COMMENT_NODE && /** @type {Comment} */
      hydrate_node.data === HYDRATION_END) {
        anchor = /** @type {Comment} */
        hydrate_node;
        mismatch = true;
        set_hydrating(false);
      }
      var value = array[index2];
      var key2 = get_key(value, index2);
      if (dev_fallback_default) {
        var key_again = get_key(value, index2);
        if (key2 !== key_again) {
          each_key_volatile(String(index2), String(key2), String(key_again));
        }
      }
      var item = first_run ? null : items.get(key2);
      if (item) {
        if (item.v) internal_set(item.v, value);
        if (item.i) internal_set(item.i, index2);
        if (defer) {
          batch.unskip_effect(item.e);
        }
      } else {
        item = create_item(items, first_run ? anchor : offscreen_anchor ??= create_text(), value, key2, index2, render_fn, flags2, get_collection);
        if (!first_run) {
          item.e.f |= EFFECT_OFFSCREEN;
        }
        items.set(key2, item);
      }
      keys.add(key2);
    }
    if (length === 0 && fallback_fn && !fallback2) {
      if (first_run) {
        fallback2 = branch(() => fallback_fn(anchor));
      } else {
        fallback2 = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
        fallback2.f |= EFFECT_OFFSCREEN;
      }
    }
    if (length > keys.size) {
      if (dev_fallback_default) {
        validate_each_keys(array, get_key);
      } else {
        each_key_duplicate("", "", "");
      }
    }
    if (hydrating && length > 0) {
      set_hydrate_node(skip_nodes());
    }
    if (!first_run) {
      pending2.set(batch, keys);
      if (defer) {
        for (const [key3, item2] of items) {
          if (!keys.has(key3)) {
            batch.skip_effect(item2.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(discard);
      } else {
        commit(batch);
      }
    }
    if (mismatch) {
      set_hydrating(true);
    }
    get(each_array);
  });
  var state2 = {
    effect: effect2,
    flags: flags2,
    items,
    pending: pending2,
    outrogroups: null,
    fallback: fallback2
  };
  first_run = false;
  if (hydrating) {
    anchor = hydrate_node;
  }
}
function skip_to_branch(effect2) {
  while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
    effect2 = effect2.next;
  }
  return effect2;
}
function reconcile(state2, array, anchor, flags2, get_key) {
  var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
  var length = array.length;
  var items = state2.items;
  var current = skip_to_branch(state2.effect.first);
  var seen2;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key2;
  var effect2;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key2 = get_key(value, i);
      effect2 = /** @type {EachItem} */
      items.get(key2).e;
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        effect2.nodes?.a?.measure();
        (to_animate ??= /* @__PURE__ */ new Set()).add(effect2);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key2 = get_key(value, i);
    effect2 = /** @type {EachItem} */
    items.get(key2).e;
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        group.pending.delete(effect2);
        group.done.delete(effect2);
      }
    }
    if ((effect2.f & INERT) !== 0) {
      resume_effect(effect2);
      if (is_animated) {
        effect2.nodes?.a?.unfix();
        (to_animate ??= /* @__PURE__ */ new Set()).delete(effect2);
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
      effect2.f ^= EFFECT_OFFSCREEN;
      if (effect2 === current) {
        move(effect2, null, anchor);
      } else {
        var next2 = prev ? prev.next : current;
        if (effect2 === state2.effect.last) {
          state2.effect.last = effect2.prev;
        }
        if (effect2.prev) effect2.prev.next = effect2.next;
        if (effect2.next) effect2.next.prev = effect2.prev;
        link(state2, prev, effect2);
        link(state2, effect2, next2);
        move(effect2, next2, anchor);
        prev = effect2;
        matched = [];
        stashed = [];
        current = skip_to_branch(prev.next);
        continue;
      }
    }
    if (effect2 !== current) {
      if (seen2 !== void 0 && seen2.has(effect2)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen2.delete(stashed[j]);
          }
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen2.delete(effect2);
          move(effect2, current, anchor);
          link(state2, effect2.prev, effect2.next);
          link(state2, effect2, prev === null ? state2.effect.first : prev.next);
          link(state2, prev, effect2);
          prev = effect2;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== effect2) {
        (seen2 ??= /* @__PURE__ */ new Set()).add(current);
        stashed.push(current);
        current = skip_to_branch(current.next);
      }
      if (current === null) {
        continue;
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
      matched.push(effect2);
    }
    prev = effect2;
    current = skip_to_branch(effect2.next);
  }
  if (state2.outrogroups !== null) {
    for (const group of state2.outrogroups) {
      if (group.pending.size === 0) {
        destroy_effects(state2, array_from(group.done));
        state2.outrogroups?.delete(group);
      }
    }
    if (state2.outrogroups.size === 0) {
      state2.outrogroups = null;
    }
  }
  if (current !== null || seen2 !== void 0) {
    var to_destroy = [];
    if (seen2 !== void 0) {
      for (effect2 of seen2) {
        if ((effect2.f & INERT) === 0) {
          to_destroy.push(effect2);
        }
      }
    }
    while (current !== null) {
      if ((current.f & INERT) === 0 && current !== state2.fallback) {
        to_destroy.push(current);
      }
      current = skip_to_branch(current.next);
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.fix();
        }
      }
      pause_effects(state2, to_destroy, controlled_anchor);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      if (to_animate === void 0) return;
      for (effect2 of to_animate) {
        effect2.nodes?.a?.apply();
      }
    });
  }
}
function create_item(items, anchor, value, key2, index2, render_fn, flags2, get_collection) {
  var v = (flags2 & EACH_ITEM_REACTIVE) !== 0 ? (flags2 & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
  var i = (flags2 & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
  if (dev_fallback_default && v) {
    v.trace = () => {
      get_collection()[i?.v ?? index2];
    };
  }
  return {
    v,
    i,
    e: branch(() => {
      render_fn(anchor, v ?? value, i ?? index2, get_collection);
      return () => {
        items.delete(key2);
      };
    })
  };
}
function move(effect2, next2, anchor) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  var dest = next2 && (next2.f & EFFECT_OFFSCREEN) === 0 ? (
    /** @type {EffectNodes} */
    next2.nodes.start
  ) : anchor;
  while (node !== null) {
    var next_node = (
      /** @type {TemplateNode} */
      get_next_sibling(node)
    );
    dest.before(node);
    if (node === end) {
      return;
    }
    node = next_node;
  }
}
function link(state2, prev, next2) {
  if (prev === null) {
    state2.effect.first = next2;
  } else {
    prev.next = next2;
  }
  if (next2 === null) {
    state2.effect.last = prev;
  } else {
    next2.prev = prev;
  }
}
function validate_each_keys(array, key_fn) {
  const keys = /* @__PURE__ */ new Map();
  const length = array.length;
  for (let i = 0; i < length; i++) {
    const key2 = key_fn(array[i], i);
    if (keys.has(key2)) {
      const a = String(keys.get(key2));
      const b = String(i);
      let k = String(key2);
      if (k.startsWith("[object ")) k = null;
      each_key_duplicate(a, b, k);
    }
    keys.set(key2, i);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/validate.js
function validate_store(store, name) {
  if (store != null && typeof store.subscribe !== "function") {
    store_invalid_shape(name);
  }
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/css.js
function append_styles(anchor, css) {
  effect(() => {
    anchor = active_effect?.parent?.nodes?.start ?? anchor;
    var root2 = anchor.getRootNode();
    var target = (
      /** @type {ShadowRoot} */
      root2.host ? (
        /** @type {ShadowRoot} */
        root2
      ) : (
        /** @type {Document} */
        root2.head ?? /** @type {Document} */
        root2.ownerDocument.head
      )
    );
    if (!target.querySelector("#" + css.hash)) {
      const style = create_element("style");
      style.id = css.hash;
      style.textContent = css.code;
      target.appendChild(style);
      if (dev_fallback_default) {
        register_style(css.hash, style);
      }
    }
  });
}

// node_modules/.deno/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/attributes.js
function clsx2(value) {
  if (typeof value === "object") {
    return clsx(value);
  } else {
    return value ?? "";
  }
}
var whitespace = [
  ..." 	\n\r\f\xA0\v\uFEFF"
];
function to_class(value, hash2, directives) {
  var classname = value == null ? "" : "" + value;
  if (hash2) {
    classname = classname ? classname + " " + hash2 : hash2;
  }
  if (directives) {
    for (var key2 of Object.keys(directives)) {
      if (directives[key2]) {
        classname = classname ? classname + " " + key2 : key2;
      } else if (classname.length) {
        var len = key2.length;
        var a = 0;
        while ((a = classname.indexOf(key2, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function append_styles2(styles, important = false) {
  var separator = important ? " !important;" : ";";
  var css = "";
  for (var key2 of Object.keys(styles)) {
    var value = styles[key2];
    if (value != null && value !== "") {
      css += " " + key2 + ": " + value + separator;
    }
  }
  return css;
}
function to_css_name(name) {
  if (name[0] !== "-" || name[1] !== "-") {
    return name.toLowerCase();
  }
  return name;
}
function to_style(value, styles) {
  if (styles) {
    var new_style = "";
    var normal_styles;
    var important_styles;
    if (Array.isArray(styles)) {
      normal_styles = styles[0];
      important_styles = styles[1];
    } else {
      normal_styles = styles;
    }
    if (value) {
      value = String(value).replaceAll(/\/\*.*?\*\//g, "").trim();
      var in_str = false;
      var in_apo = 0;
      var in_comment = false;
      var reserved_names = [];
      if (normal_styles) {
        reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
      }
      if (important_styles) {
        reserved_names.push(...Object.keys(important_styles).map(to_css_name));
      }
      var start_index = 0;
      var name_index = -1;
      const len = value.length;
      for (var i = 0; i < len; i++) {
        var c = value[i];
        if (in_comment) {
          if (c === "/" && value[i - 1] === "*") {
            in_comment = false;
          }
        } else if (in_str) {
          if (in_str === c) {
            in_str = false;
          }
        } else if (c === "/" && value[i + 1] === "*") {
          in_comment = true;
        } else if (c === '"' || c === "'") {
          in_str = c;
        } else if (c === "(") {
          in_apo++;
        } else if (c === ")") {
          in_apo--;
        }
        if (!in_comment && in_str === false && in_apo === 0) {
          if (c === ":" && name_index === -1) {
            name_index = i;
          } else if (c === ";" || i === len - 1) {
            if (name_index !== -1) {
              var name = to_css_name(value.substring(start_index, name_index).trim());
              if (!reserved_names.includes(name)) {
                if (c !== ";") {
                  i++;
                }
                var property = value.substring(start_index, i).trim();
                new_style += " " + property + ";";
              }
            }
            start_index = i + 1;
            name_index = -1;
          }
        }
      }
    }
    if (normal_styles) {
      new_style += append_styles2(normal_styles);
    }
    if (important_styles) {
      new_style += append_styles2(important_styles, true);
    }
    new_style = new_style.trim();
    return new_style === "" ? null : new_style;
  }
  return value == null ? null : String(value);
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/class.js
function set_class(dom, is_html, value, hash2, prev_classes, next_classes) {
  var prev = (
    /** @type {any} */
    dom[CLASS_CACHE]
  );
  if (hydrating || prev !== value || prev === void 0) {
    var next_class_name = to_class(value, hash2, next_classes);
    if (!hydrating || next_class_name !== dom.getAttribute("class")) {
      if (next_class_name == null) {
        dom.removeAttribute("class");
      } else if (is_html) {
        dom.className = next_class_name;
      } else {
        dom.setAttribute("class", next_class_name);
      }
    }
    dom[CLASS_CACHE] = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key2 in next_classes) {
      var is_present = !!next_classes[key2];
      if (prev_classes == null || is_present !== !!prev_classes[key2]) {
        dom.classList.toggle(key2, is_present);
      }
    }
  }
  return next_classes;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/style.js
function update_styles(dom, prev = {}, next2, priority) {
  for (var key2 in next2) {
    var value = next2[key2];
    if (prev[key2] !== value) {
      if (next2[key2] == null) {
        dom.style.removeProperty(key2);
      } else {
        dom.style.setProperty(key2, value, priority);
      }
    }
  }
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = (
    /** @type {any} */
    dom[STYLE_CACHE]
  );
  if (hydrating || prev !== value) {
    var next_style_attr = to_style(value, next_styles);
    if (!hydrating || next_style_attr !== dom.getAttribute("style")) {
      if (next_style_attr == null) {
        dom.removeAttribute("style");
      } else {
        dom.style.cssText = next_style_attr;
      }
    }
    dom[STYLE_CACHE] = value;
  } else if (next_styles) {
    if (Array.isArray(next_styles)) {
      update_styles(dom, prev_styles?.[0], next_styles[0]);
      update_styles(dom, prev_styles?.[1], next_styles[1], "important");
    } else {
      update_styles(dom, prev_styles, next_styles);
    }
  }
  return next_styles;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/attributes.js
var CLASS = Symbol("class");
var STYLE = Symbol("style");
var IS_CUSTOM_ELEMENT = Symbol("is custom element");
var IS_HTML = Symbol("is html");
var LINK_TAG = IS_XHTML ? "link" : "LINK";
function set_attribute2(element2, attribute, value, skip_warning) {
  var attributes = get_attributes(element2);
  if (hydrating) {
    attributes[attribute] = element2.getAttribute(attribute);
    if (attribute === "src" || attribute === "srcset" || attribute === "href" && element2.nodeName === LINK_TAG) {
      if (!skip_warning) {
        check_src_in_dev_hydration(element2, attribute, value ?? "");
      }
      return;
    }
  }
  var previous = attributes[attribute];
  if (previous === (attributes[attribute] = value)) return;
  if (attribute === "loading") {
    element2[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    element2.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element2).has(attribute)) {
    element2[attribute] = value;
  } else if (
    // while hydrating, skip a number or boolean whose string the server already rendered
    !(hydrating && (typeof value === "number" || typeof value === "boolean") && previous === String(value))
  ) {
    element2.setAttribute(attribute, value);
  }
}
function get_attributes(element2) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    element2[ATTRIBUTES_CACHE] ??= {
      [IS_CUSTOM_ELEMENT]: element2.nodeName.includes("-"),
      [IS_HTML]: element2.namespaceURI === NAMESPACE_HTML
    }
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element2) {
  var cache_key = element2.getAttribute("is") || element2.nodeName;
  var setters = setters_cache.get(cache_key);
  if (setters) return setters;
  setters_cache.set(cache_key, setters = /* @__PURE__ */ new Set());
  var descriptors;
  var proto = element2;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key2 in descriptors) {
      if (descriptors[key2].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      key2 !== "innerHTML" && key2 !== "textContent" && key2 !== "innerText") {
        setters.add(key2);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
function check_src_in_dev_hydration(element2, attribute, value) {
  if (!dev_fallback_default) return;
  if (attribute === "srcset" && srcset_url_equal(element2, value)) return;
  if (src_url_equal(element2.getAttribute(attribute) ?? "", value)) return;
  hydration_attribute_changed(attribute, element2.outerHTML.replace(element2.innerHTML, element2.innerHTML && "..."), String(value));
}
function src_url_equal(element_src, url) {
  if (element_src === url) return true;
  return new URL(element_src, document.baseURI).href === new URL(url, document.baseURI).href;
}
function split_srcset(srcset) {
  return srcset.split(",").map((src) => src.trim().split(" ").filter(Boolean));
}
function srcset_url_equal(element2, srcset) {
  var element_urls = split_srcset(element2.srcset);
  var urls = split_srcset(srcset);
  return urls.length === element_urls.length && urls.every(([url, width], i) => width === element_urls[i][1] && // We need to test both ways because Vite will create an a full URL with
  // `new URL(asset, import.meta.url).href` for the client when `base: './'`, and the
  // relative URLs inside srcset are not automatically resolved to absolute URLs by
  // browsers (in contrast to img.src). This means both SSR and DOM code could
  // contain relative or absolute URLs.
  (src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0])));
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/store/utils.js
function subscribe_to_store(store, run3, invalidate) {
  if (store == null) {
    run3(void 0);
    if (invalidate) invalidate(void 0);
    return noop;
  }
  const unsub = untrack(() => store.subscribe(
    run3,
    // @ts-expect-error
    invalidate
  ));
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/store/shared/index.js
function get2(store) {
  let value;
  subscribe_to_store(store, (_) => value = _)();
  return value;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/store.js
var IS_UNMOUNTED = Symbol("unmounted");
function store_get(store, store_name, stores) {
  const entry = stores[store_name] ??= {
    store: null,
    source: mutable_source(void 0),
    unsubscribe: noop
  };
  if (dev_fallback_default) {
    entry.source.label = store_name;
  }
  if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
    entry.unsubscribe();
    entry.store = store ?? null;
    if (store == null) {
      entry.source.v = void 0;
      entry.unsubscribe = noop;
    } else {
      var is_synchronous_callback = true;
      entry.unsubscribe = subscribe_to_store(store, (v) => {
        if (is_synchronous_callback) {
          entry.source.v = v;
        } else {
          set(entry.source, v);
        }
      });
      is_synchronous_callback = false;
    }
  }
  if (store && IS_UNMOUNTED in stores) {
    return get2(store);
  }
  return get(entry.source);
}
function setup_stores() {
  const stores = {};
  function cleanup() {
    teardown(() => {
      for (var store_name in stores) {
        const ref = stores[store_name];
        ref.unsubscribe();
      }
      define_property(stores, IS_UNMOUNTED, {
        enumerable: false,
        value: true
      });
    });
  }
  return [
    stores,
    cleanup
  ];
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/legacy/legacy-client.js
function createClassComponent(options) {
  return new Svelte4Component(options);
}
var Svelte4Component = class {
  /** @type {any} */
  #events;
  /** @type {Record<string, any>} */
  #instance;
  /**
  * @param {ComponentConstructorOptions & {
  *  component: any;
  * }} options
  */
  constructor(options) {
    var sources = /* @__PURE__ */ new Map();
    var add_source = (key2, value) => {
      var s = mutable_source(value, false, false);
      sources.set(key2, s);
      return s;
    };
    const props = new Proxy({
      ...options.props || {},
      $$events: {}
    }, {
      get(target, prop2) {
        return get(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
      },
      has(target, prop2) {
        if (prop2 === LEGACY_PROPS) return true;
        get(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
        return Reflect.has(target, prop2);
      },
      set(target, prop2, value) {
        set(sources.get(prop2) ?? add_source(prop2, value), value);
        return Reflect.set(target, prop2, value);
      }
    });
    this.#instance = (options.hydrate ? hydrate : mount)(options.component, {
      target: options.target,
      anchor: options.anchor,
      props,
      context: options.context,
      intro: options.intro ?? false,
      recover: options.recover,
      transformError: options.transformError
    });
    if (!async_mode_flag && (!options?.props?.$$host || options.sync === false)) {
      flushSync();
    }
    this.#events = props.$$events;
    for (const key2 of Object.keys(this.#instance)) {
      if (key2 === "$set" || key2 === "$destroy" || key2 === "$on") continue;
      define_property(this, key2, {
        get() {
          return this.#instance[key2];
        },
        /** @param {any} value */
        set(value) {
          this.#instance[key2] = value;
        },
        enumerable: true
      });
    }
    this.#instance.$set = /** @param {Record<string, any>} next */
    (next2) => {
      Object.assign(props, next2);
    };
    this.#instance.$destroy = () => {
      unmount(this.#instance);
    };
  }
  /** @param {Record<string, any>} props */
  $set(props) {
    this.#instance.$set(props);
  }
  /**
  * @param {string} event
  * @param {(...args: any[]) => any} callback
  * @returns {any}
  */
  $on(event2, callback) {
    this.#events[event2] = this.#events[event2] || [];
    const cb = (...args) => callback.call(this, ...args);
    this.#events[event2].push(cb);
    return () => {
      this.#events[event2] = this.#events[event2].filter(
        /** @param {any} fn */
        (fn) => fn !== cb
      );
    };
  }
  $destroy() {
    this.#instance.$destroy();
  }
};

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/custom-element.js
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    /** The Svelte component constructor */
    $$ctor;
    /** Slots */
    $$s;
    /** @type {any} The Svelte component instance */
    $$c;
    /** Whether or not the custom element is connected */
    $$cn = false;
    /** @type {Record<string, any>} Component props data */
    $$d = {};
    /** `true` if currently in the process of reflecting component props back to attributes */
    $$r = false;
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    $$p_d = {};
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    $$l = {};
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    $$l_u = /* @__PURE__ */ new Map();
    /** @type {any} The managed render effect for reflecting attributes */
    $$me;
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    $$shadowRoot = null;
    /**
    * @param {*} $$componentCtor
    * @param {*} $$slots
    * @param {ShadowRootInit | undefined} shadow_root_init
    */
    constructor($$componentCtor, $$slots, shadow_root_init) {
      super();
      this.$$ctor = $$componentCtor;
      this.$$s = $$slots;
      if (shadow_root_init) {
        this.$$shadowRoot = this.attachShadow(shadow_root_init);
      }
    }
    /**
    * @param {string} type
    * @param {EventListenerOrEventListenerObject} listener
    * @param {boolean | AddEventListenerOptions} [options]
    */
    addEventListener(type, listener, options) {
      this.$$l[type] = this.$$l[type] || [];
      this.$$l[type].push(listener);
      if (this.$$c) {
        const unsub = this.$$c.$on(type, listener);
        this.$$l_u.set(listener, unsub);
      }
      super.addEventListener(type, listener, options);
    }
    /**
    * @param {string} type
    * @param {EventListenerOrEventListenerObject} listener
    * @param {boolean | AddEventListenerOptions} [options]
    */
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
      if (this.$$c) {
        const unsub = this.$$l_u.get(listener);
        if (unsub) {
          unsub();
          this.$$l_u.delete(listener);
        }
      }
    }
    async connectedCallback() {
      this.$$cn = true;
      if (!this.$$c) {
        let create_slot = function(name) {
          return (anchor) => {
            const slot2 = create_element("slot");
            if (name !== "default") slot2.name = name;
            append(anchor, slot2);
          };
        };
        await Promise.resolve();
        if (!this.$$cn || this.$$c) {
          return;
        }
        const $$slots = {};
        const existing_slots = get_custom_elements_slots(this);
        for (const name of this.$$s) {
          if (name in existing_slots) {
            if (name === "default" && !this.$$d.children) {
              this.$$d.children = create_slot(name);
              $$slots.default = true;
            } else {
              $$slots[name] = create_slot(name);
            }
          }
        }
        for (const attribute of this.attributes) {
          const name = this.$$g_p(attribute.name);
          if (!(name in this.$$d)) {
            this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
          }
        }
        for (const key2 in this.$$p_d) {
          if (!(key2 in this.$$d) && this[key2] !== void 0) {
            this.$$d[key2] = this[key2];
            delete this[key2];
          }
        }
        this.$$c = createClassComponent({
          component: this.$$ctor,
          target: this.$$shadowRoot || this,
          props: {
            ...this.$$d,
            $$slots,
            $$host: this
          }
        });
        this.$$me = effect_root(() => {
          render_effect(() => {
            this.$$r = true;
            for (const key2 of object_keys(this.$$c)) {
              if (!this.$$p_d[key2]?.reflect) continue;
              this.$$d[key2] = this.$$c[key2];
              const attribute_value = get_custom_element_value(key2, this.$$d[key2], this.$$p_d, "toAttribute");
              if (attribute_value == null) {
                this.removeAttribute(this.$$p_d[key2].attribute || key2);
              } else {
                this.setAttribute(this.$$p_d[key2].attribute || key2, attribute_value);
              }
            }
            this.$$r = false;
          });
        });
        for (const type in this.$$l) {
          for (const listener of this.$$l[type]) {
            const unsub = this.$$c.$on(type, listener);
            this.$$l_u.set(listener, unsub);
          }
        }
        this.$$l = {};
      }
    }
    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    /**
    * @param {string} attr
    * @param {string} _oldValue
    * @param {string} newValue
    */
    attributeChangedCallback(attr2, _oldValue, newValue) {
      if (this.$$r) return;
      attr2 = this.$$g_p(attr2);
      this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
      this.$$c?.$set({
        [attr2]: this.$$d[attr2]
      });
    }
    disconnectedCallback() {
      this.$$cn = false;
      Promise.resolve().then(() => {
        if (!this.$$cn && this.$$c) {
          this.$$c.$destroy();
          this.$$me();
          this.$$c = void 0;
        }
      });
    }
    /**
    * @param {string} attribute_name
    */
    $$g_p(attribute_name) {
      return object_keys(this.$$p_d).find((key2) => this.$$p_d[key2].attribute === attribute_name || !this.$$p_d[key2].attribute && key2.toLowerCase() === attribute_name) || attribute_name;
    }
  };
}
function get_custom_element_value(prop2, value, props_definition, transform) {
  const type = props_definition[prop2]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop2]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      // conversion already handled above
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}
function get_custom_elements_slots(element2) {
  const result = {};
  element2.childNodes.forEach((node) => {
    result[
      /** @type {Element} node */
      node.slot || "default"
    ] = true;
  });
  return result;
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/index-client.js
if (dev_fallback_default) {
  let throw_rune_error = function(rune) {
    if (!(rune in globalThis)) {
      let value;
      Object.defineProperty(globalThis, rune, {
        configurable: true,
        // eslint-disable-next-line getter-return
        get: () => {
          if (value !== void 0) {
            return value;
          }
          rune_outside_svelte(rune);
        },
        set: (v) => {
          value = v;
        }
      });
    }
  };
  throw_rune_error("$state");
  throw_rune_error("$effect");
  throw_rune_error("$derived");
  throw_rune_error("$inspect");
  throw_rune_error("$props");
  throw_rune_error("$bindable");
}

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/version.js
var PUBLIC_VERSION = "5";

// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") {
  ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(PUBLIC_VERSION);
}

// .ikiro/reference/whatsapp-agent/step10/harness/desk.mjs
Desk[FILENAME] = "../../../../../../../../Users/finn/vivalence/code/vivalence/.ikiro/reference/whatsapp-agent/step10/personal/desk/Desk.svelte";
var root = add_locations(from_html(`<span class="chip svelte-1mqr3oq"> </span>`), Desk[FILENAME], [
  [
    109,
    14
  ]
]);
var root_1 = add_locations(from_html(`<dl class="settings svelte-1mqr3oq"><div><dt class="svelte-1mqr3oq">owner</dt><dd class="svelte-1mqr3oq"> </dd></div> <div><dt class="svelte-1mqr3oq">platforms</dt> <dd class="svelte-1mqr3oq"></dd></div> <div><dt class="svelte-1mqr3oq">new thread after</dt><dd class="svelte-1mqr3oq"> </dd></div></dl>`), Desk[FILENAME], [
  [
    103,
    6,
    [
      [
        104,
        8,
        [
          [
            104,
            13
          ],
          [
            104,
            27
          ]
        ]
      ],
      [
        105,
        8,
        [
          [
            106,
            10
          ],
          [
            107,
            10
          ]
        ]
      ],
      [
        113,
        8,
        [
          [
            113,
            13
          ],
          [
            113,
            38
          ]
        ]
      ]
    ]
  ]
]);
var root_2 = add_locations(from_html(`<p class="fault svelte-1mqr3oq"> </p>`), Desk[FILENAME], [
  [
    116,
    6
  ]
]);
var root_3 = add_locations(from_html(`<div class="day svelte-1mqr3oq"><i class="heard svelte-1mqr3oq"></i> <i class="replies svelte-1mqr3oq"></i></div>`), Desk[FILENAME], [
  [
    131,
    6,
    [
      [
        132,
        8
      ],
      [
        133,
        8
      ]
    ]
  ]
]);
var root_4 = add_locations(from_html(`<p class="empty svelte-1mqr3oq">Nothing heard yet. Message the number and the first thread appears here.</p>`), Desk[FILENAME], [
  [
    143,
    8
  ]
]);
var root_5 = add_locations(from_html(`<span class="chip svelte-1mqr3oq"> </span>`), Desk[FILENAME], [
  [
    157,
    18
  ]
]);
var root_6 = add_locations(from_html(`<li><button><span class="row svelte-1mqr3oq"><b class="svelte-1mqr3oq"> </b> <!> <time class="svelte-1mqr3oq"> </time></span> <span class="preview svelte-1mqr3oq"> </span> <span class="count svelte-1mqr3oq"> </span></button></li>`), Desk[FILENAME], [
  [
    149,
    10,
    [
      [
        150,
        12,
        [
          [
            154,
            14,
            [
              [
                155,
                16
              ],
              [
                159,
                16
              ]
            ]
          ],
          [
            161,
            14
          ],
          [
            162,
            14
          ]
        ]
      ]
    ]
  ]
]);
var root_7 = add_locations(from_html(`<span class="reference svelte-1mqr3oq"> </span>`), Desk[FILENAME], [
  [
    170,
    26
  ]
]);
var root_8 = add_locations(from_html(`<p class="empty svelte-1mqr3oq">Seat a thread to read what each turn arrived with.</p>`), Desk[FILENAME], [
  [
    172,
    8
  ]
]);
var root_9 = add_locations(from_html(`<span class="chip svelte-1mqr3oq"> </span>`), Desk[FILENAME], [
  [
    179,
    39
  ]
]);
var root_10 = add_locations(from_html(`<span class="carried svelte-1mqr3oq"> </span>`), Desk[FILENAME], [
  [
    182,
    46
  ]
]);
var root_11 = add_locations(from_html(`<details><summary class="svelte-1mqr3oq"> </summary> <pre class="svelte-1mqr3oq"> </pre></details>`), Desk[FILENAME], [
  [
    184,
    14,
    [
      [
        185,
        16
      ],
      [
        186,
        16
      ]
    ]
  ]
]);
var root_12 = add_locations(from_html(`<li><div class="row svelte-1mqr3oq"><b class="svelte-1mqr3oq"> </b> <!> <time class="svelte-1mqr3oq"> </time></div> <p class="svelte-1mqr3oq"> <!></p> <!></li>`), Desk[FILENAME], [
  [
    176,
    10,
    [
      [
        177,
        12,
        [
          [
            178,
            14
          ],
          [
            180,
            14
          ]
        ]
      ],
      [
        182,
        12
      ]
    ]
  ]
]);
var root_13 = add_locations(from_html(`<div class="desk svelte-1mqr3oq"><header class="svelte-1mqr3oq"><div class="title svelte-1mqr3oq"><h1 class="svelte-1mqr3oq"> </h1> <span class="reference svelte-1mqr3oq"> </span></div> <!></header> <section class="tiles svelte-1mqr3oq"><div class="tile svelte-1mqr3oq"><b class="svelte-1mqr3oq"> </b><span class="svelte-1mqr3oq">threads</span></div> <div class="tile svelte-1mqr3oq"><b class="svelte-1mqr3oq"> </b><span class="svelte-1mqr3oq">heard</span></div> <div class="tile svelte-1mqr3oq"><b class="svelte-1mqr3oq"> </b><span class="svelte-1mqr3oq">replies</span></div> <div class="tile svelte-1mqr3oq"><b class="svelte-1mqr3oq"> </b><span class="svelte-1mqr3oq">since last heard</span></div></section> <section class="days svelte-1mqr3oq"></section> <p class="legend svelte-1mqr3oq"><i class="heard svelte-1mqr3oq"></i> heard <i class="replies svelte-1mqr3oq"></i> </p> <div class="columns svelte-1mqr3oq"><section><h2 class="svelte-1mqr3oq">threads</h2> <!> <ul class="threads svelte-1mqr3oq"></ul></section> <section><h2 class="svelte-1mqr3oq">wire <!></h2> <!> <ol class="wire svelte-1mqr3oq"></ol></section></div></div>`), Desk[FILENAME], [
  [
    96,
    0,
    [
      [
        97,
        2,
        [
          [
            98,
            4,
            [
              [
                99,
                6
              ],
              [
                100,
                6
              ]
            ]
          ]
        ]
      ],
      [
        120,
        2,
        [
          [
            121,
            4,
            [
              [
                121,
                22
              ],
              [
                121,
                44
              ]
            ]
          ],
          [
            122,
            4,
            [
              [
                122,
                22
              ],
              [
                122,
                43
              ]
            ]
          ],
          [
            123,
            4,
            [
              [
                123,
                22
              ],
              [
                123,
                45
              ]
            ]
          ],
          [
            124,
            4,
            [
              [
                125,
                6
              ],
              [
                125,
                57
              ]
            ]
          ]
        ]
      ],
      [
        129,
        2
      ],
      [
        137,
        2,
        [
          [
            137,
            20
          ],
          [
            137,
            48
          ]
        ]
      ],
      [
        139,
        2,
        [
          [
            140,
            4,
            [
              [
                141,
                6
              ],
              [
                147,
                6
              ]
            ]
          ],
          [
            169,
            4,
            [
              [
                170,
                6
              ],
              [
                174,
                6
              ]
            ]
          ]
        ]
      ]
    ]
  ]
]);
var $$css = {
  hash: "svelte-1mqr3oq",
  code: "\n  .desk.svelte-1mqr3oq {\n    min-height: 100%;\n    box-sizing: border-box;\n    padding: var(--size-space-lg);\n    display: flex;\n    flex-direction: column;\n    gap: var(--size-space-md);\n    background: var(--plane);\n    color: var(--text-ink);\n    font-family: var(--font-family-sans-text);\n    font-size: var(--size-type-sm);\n    container-type: inline-size;\n  }\n  header.svelte-1mqr3oq {\n    display: flex;\n    flex-wrap: wrap;\n    gap: var(--size-space-md);\n    justify-content: space-between;\n  }\n  .title.svelte-1mqr3oq { display: flex; align-items: baseline; gap: var(--size-space-sm); }\n  h1.svelte-1mqr3oq { margin: 0; font-family: var(--font-family-sans-heading); font-size: var(--size-type-xl); }\n  h1.svelte-1mqr3oq, h2.svelte-1mqr3oq, b.svelte-1mqr3oq { color: var(--text-strong); }\n  h2.svelte-1mqr3oq {\n    margin: 0 0 var(--size-space-sm);\n    font-size: var(--size-type-xs);\n    text-transform: var(--shape-label-case);\n    letter-spacing: var(--shape-label-track);\n  }\n  .reference.svelte-1mqr3oq, time.svelte-1mqr3oq, .count.svelte-1mqr3oq, dt.svelte-1mqr3oq, .legend.svelte-1mqr3oq, .carried.svelte-1mqr3oq {\n    color: var(--text-muted);\n    font-family: var(--font-family-code);\n    font-size: var(--size-type-2xs);\n  }\n  .carried.svelte-1mqr3oq { margin-left: var(--size-space-xs); }\n  .settings.svelte-1mqr3oq { display: flex; flex-wrap: wrap; gap: var(--size-space-md); margin: 0; }\n  dd.svelte-1mqr3oq { margin: 0; }\n  .chip.svelte-1mqr3oq {\n    padding: 0 var(--size-space-xs);\n    border-radius: var(--shape-radius-pill);\n    background: var(--signal-primary-tint);\n    color: var(--signal-primary-ink);\n    font-family: var(--font-family-code);\n    font-size: var(--size-type-2xs);\n  }\n  .fault.svelte-1mqr3oq { margin: 0; color: var(--signal-negative-ink); }\n  .tiles.svelte-1mqr3oq { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--size-space-sm); }\n  .tile.svelte-1mqr3oq {\n    display: flex;\n    flex-direction: column;\n    padding: var(--size-space-sm) var(--size-space-md);\n    border: 1px solid var(--boundary-soft);\n    border-radius: var(--shape-radius-card);\n    background: var(--plane-lift);\n  }\n  .tile.svelte-1mqr3oq b:where(.svelte-1mqr3oq) { font-size: var(--size-type-xl); font-variant-numeric: tabular-nums; }\n  .tile.svelte-1mqr3oq span:where(.svelte-1mqr3oq) { color: var(--text-muted); font-size: var(--size-type-xs); }\n  .days.svelte-1mqr3oq { display: flex; align-items: flex-end; gap: var(--size-space-2xs); height: 56px; }\n  .day.svelte-1mqr3oq { flex: 1; height: 100%; display: flex; align-items: flex-end; gap: 1px; }\n  .day.svelte-1mqr3oq i:where(.svelte-1mqr3oq) { flex: 1; min-height: 1px; border-radius: var(--shape-radius-2xs); }\n  i.heard.svelte-1mqr3oq { background: var(--signal-primary); }\n  i.replies.svelte-1mqr3oq { background: var(--signal-positive); }\n  .legend.svelte-1mqr3oq { margin: 0; }\n  .legend.svelte-1mqr3oq i:where(.svelte-1mqr3oq) {\n    display: inline-block;\n    width: 8px;\n    height: 8px;\n    border-radius: var(--shape-radius-2xs);\n  }\n  .columns.svelte-1mqr3oq { display: grid; grid-template-columns: 1fr 1fr; gap: var(--size-space-lg); }\n  ul.svelte-1mqr3oq, ol.svelte-1mqr3oq { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }\n  ul.svelte-1mqr3oq, ol.svelte-1mqr3oq { gap: var(--size-space-xs); }\n  button.svelte-1mqr3oq {\n    width: 100%;\n    display: flex;\n    flex-direction: column;\n    gap: var(--size-space-2xs);\n    padding: var(--size-space-sm);\n    border: 1px solid var(--boundary-soft);\n    border-radius: var(--shape-radius-card);\n    background: var(--plane-lift);\n    color: inherit;\n    font: inherit;\n    text-align: left;\n    cursor: pointer;\n  }\n  button.svelte-1mqr3oq:hover { border-color: var(--boundary-strong); }\n  button.svelte-1mqr3oq:focus-visible { outline: var(--size-ring) solid var(--control-focus); }\n  button.on.svelte-1mqr3oq { border-color: var(--signal-primary); background: var(--control-selected); }\n  .row.svelte-1mqr3oq { display: flex; align-items: center; gap: var(--size-space-xs); }\n  .row.svelte-1mqr3oq time:where(.svelte-1mqr3oq) { margin-left: auto; }\n  .preview.svelte-1mqr3oq, .wire.svelte-1mqr3oq p:where(.svelte-1mqr3oq) { margin: 0; overflow-wrap: anywhere; }\n  .preview.svelte-1mqr3oq {\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n  }\n  .wire.svelte-1mqr3oq li:where(.svelte-1mqr3oq) { padding: var(--size-space-sm); border-left: 2px solid var(--boundary); }\n  .wire.svelte-1mqr3oq li.user:where(.svelte-1mqr3oq) { border-left-color: var(--signal-primary); }\n  .wire.svelte-1mqr3oq li.assistant:where(.svelte-1mqr3oq) { border-left-color: var(--signal-positive); }\n  summary.svelte-1mqr3oq { cursor: pointer; color: var(--text-muted); font-size: var(--size-type-xs); }\n  pre.svelte-1mqr3oq {\n    margin: var(--size-space-xs) 0 0;\n    padding: var(--size-space-sm);\n    overflow-x: auto;\n    border-radius: var(--shape-radius-xs);\n    background: var(--plane-sunk);\n    color: var(--text-code);\n    font-family: var(--font-family-code);\n    font-size: var(--size-type-2xs);\n  }\n  .empty.svelte-1mqr3oq { margin: 0; color: var(--text-muted); }\n  @container (max-width: 640px) {\n    .columns.svelte-1mqr3oq { grid-template-columns: 1fr; }\n    .tiles.svelte-1mqr3oq { grid-template-columns: repeat(2, 1fr); }\n  }\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVzay5zdmVsdGUiLCJzb3VyY2VzIjpbIkRlc2suc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGNvbnN0IHsgdGVybWluYWwsIGJ1ZmZlciB9ID0gJHByb3BzKCk7XG4gIGNvbnN0IG1vZGUgPSBidWZmZXIubW9kZTtcbiAgY29uc3QgdGhyZWFkcyA9IHRlcm1pbmFsLmNsaWVudC5ydW50aW1lLmVudGl0aWVzLnRocmVhZC4kZW50aXRpZXM7XG4gIGNvbnN0IHR1cm5zID0gdGVybWluYWwuY2xpZW50LnJ1bnRpbWUuZW50aXRpZXMudHVybi4kZW50aXRpZXM7XG4gIGNvbnN0IHNlYXQgPSB0ZXJtaW5hbC4kdGhyZWFkO1xuXG4gIGNvbnN0IERBWSA9IDg2NDAwMDAwO1xuICBjb25zdCBEQVlTID0gMTQ7XG5cbiAgbGV0IHNldHRpbmdzID0gJHN0YXRlKG51bGwpO1xuICBsZXQgZmF1bHQgPSAkc3RhdGUobnVsbCk7XG4gIGxldCBub3cgPSAkc3RhdGUoRGF0ZS5ub3coKSk7XG5cbiAgJGVmZmVjdCgoKSA9PiB7XG4gICAgbW9kZS5jYWxsLnNldHRpbmdzKHt9KS50aGVuKFxuICAgICAgKGhlbGQpID0+IChzZXR0aW5ncyA9IGhlbGQpLFxuICAgICAgKGVycm9yKSA9PiAoZmF1bHQgPSBlcnJvci5tZXNzYWdlKSxcbiAgICApO1xuICAgIG1vZGUuZW50aXRpZXMudGhyZWFkLmZpbmQoe30pO1xuICAgIG1vZGUuZW50aXRpZXMudHVybi5maW5kKHt9KTtcbiAgICBjb25zdCB1bnN1YnNjcmliZSA9IG1vZGUuZW50aXRpZXMudHVybi5zdWJzY3JpYmUoe30pO1xuICAgIGNvbnN0IGNsb2NrID0gc2V0SW50ZXJ2YWwoKCkgPT4gKG5vdyA9IERhdGUubm93KCkpLCAzMDAwMCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICBjbGVhckludGVydmFsKGNsb2NrKTtcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBhdCA9IChlbnRpdHkpID0+IG5ldyBEYXRlKGVudGl0eS5jcmVhdGVkQXQpLmdldFRpbWUoKTtcblxuICBjb25zdCBzYWlkID0gKHR1cm4pID0+XG4gICAgdHVybi5wYXJ0c1xuICAgICAgLmZpbHRlcigocGFydCkgPT4gcGFydC50eXBlID09PSBcInRleHRcIilcbiAgICAgIC5tYXAoKHBhcnQpID0+IHBhcnQudGV4dClcbiAgICAgIC5qb2luKFwiIFwiKTtcblxuICBjb25zdCBjYXJyaWVkID0gKHR1cm4pID0+XG4gICAgdHVybi5wYXJ0c1xuICAgICAgLmZpbHRlcigocGFydCkgPT4gcGFydC50eXBlICE9PSBcInRleHRcIilcbiAgICAgIC5tYXAoKHBhcnQpID0+IHBhcnQudHlwZSlcbiAgICAgIC5qb2luKFwiIMK3IFwiKTtcblxuICBjb25zdCBhZ28gPSAodGltZSkgPT4ge1xuICAgIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLnJvdW5kKChub3cgLSB0aW1lKSAvIDYwMDAwKTtcbiAgICBpZiAobWludXRlcyA8IDEpIHJldHVybiBcIm5vd1wiO1xuICAgIGlmIChtaW51dGVzIDwgNjApIHJldHVybiBgJHttaW51dGVzfSBtYDtcbiAgICBpZiAobWludXRlcyA8IDE0NDApIHJldHVybiBgJHtNYXRoLnJvdW5kKG1pbnV0ZXMgLyA2MCl9IGhgO1xuICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1pbnV0ZXMgLyAxNDQwKX0gZGA7XG4gIH07XG5cbiAgY29uc3QgY2xvY2sgPSAodGltZSkgPT5cbiAgICBuZXcgRGF0ZSh0aW1lKS50b0xvY2FsZVN0cmluZyhbXSwge1xuICAgICAgbW9udGg6IFwic2hvcnRcIixcbiAgICAgIGRheTogXCJudW1lcmljXCIsXG4gICAgICBob3VyOiBcIjItZGlnaXRcIixcbiAgICAgIG1pbnV0ZTogXCIyLWRpZ2l0XCIsXG4gICAgfSk7XG5cbiAgY29uc3Qgc3BhbiA9IChzZWNvbmRzKSA9PiAoc2Vjb25kcyAlIDM2MDAgPyBgJHtzZWNvbmRzIC8gNjB9IG1pbmAgOiBgJHtzZWNvbmRzIC8gMzYwMH0gaGApO1xuXG4gIGNvbnN0IHNwb2tlbiA9ICRkZXJpdmVkKFxuICAgICR0dXJuc1xuICAgICAgLmZpbHRlcigodHVybikgPT4gdHVybi50aHJlYWQubW9kZSA9PT0gbW9kZSlcbiAgICAgIC50b1NvcnRlZCgoZmlyc3QsIHNlY29uZCkgPT4gYXQoZmlyc3QpIC0gYXQoc2Vjb25kKSksXG4gICk7XG4gIGNvbnN0IGhlYXJkID0gJGRlcml2ZWQoc3Bva2VuLmZpbHRlcigodHVybikgPT4gdHVybi5yb2xlID09PSBcInVzZXJcIiAmJiB0dXJuLm1ldGE/LnByb3ZpZGVyKSk7XG4gIGNvbnN0IHJlcGxpZXMgPSAkZGVyaXZlZChzcG9rZW4uZmlsdGVyKCh0dXJuKSA9PiB0dXJuLnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiYgc2FpZCh0dXJuKSkpO1xuICBjb25zdCBsaXN0ZWQgPSAkZGVyaXZlZChcbiAgICAkdGhyZWFkc1xuICAgICAgLmZpbHRlcigodGhyZWFkKSA9PiB0aHJlYWQubW9kZSA9PT0gbW9kZSlcbiAgICAgIC5tYXAoKHRocmVhZCkgPT4ge1xuICAgICAgICBjb25zdCBvd24gPSBzcG9rZW4uZmlsdGVyKCh0dXJuKSA9PiB0dXJuLnRocmVhZCA9PT0gdGhyZWFkKTtcbiAgICAgICAgY29uc3QgbGFzdCA9IG93bi5maW5kTGFzdCgodHVybikgPT4gc2FpZCh0dXJuKSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdGhyZWFkLFxuICAgICAgICAgIHR1cm5zOiBvd24ubGVuZ3RoLFxuICAgICAgICAgIGxhc3QsXG4gICAgICAgICAgdG91Y2hlZDogb3duLmxlbmd0aCA/IGF0KG93bi5hdCgtMSkpIDogYXQodGhyZWFkKSxcbiAgICAgICAgICBwbGF0Zm9ybXM6IFsuLi5uZXcgU2V0KG93bi5mbGF0TWFwKCh0dXJuKSA9PiB0dXJuLm1ldGE/LnByb3ZpZGVyPy5wbGF0Zm9ybSA/PyBbXSkpXSxcbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgICAudG9Tb3J0ZWQoKGZpcnN0LCBzZWNvbmQpID0+IHNlY29uZC50b3VjaGVkIC0gZmlyc3QudG91Y2hlZCksXG4gICk7XG4gIGNvbnN0IHdpcmUgPSAkZGVyaXZlZChzcG9rZW4uZmlsdGVyKCh0dXJuKSA9PiB0dXJuLnRocmVhZCA9PT0gJHNlYXQpLnRvUmV2ZXJzZWQoKSk7XG4gIGNvbnN0IGRheXMgPSAkZGVyaXZlZChcbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBEQVlTIH0sICh1bnVzZWQsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBmcm9tID0gbmV3IERhdGUobm93KS5zZXRIb3VycygwLCAwLCAwLCAwKSAtIChEQVlTIC0gMSAtIGluZGV4KSAqIERBWTtcbiAgICAgIGNvbnN0IHdpdGhpbiA9ICh0dXJuKSA9PiBhdCh0dXJuKSA+PSBmcm9tICYmIGF0KHR1cm4pIDwgZnJvbSArIERBWTtcbiAgICAgIHJldHVybiB7IGZyb20sIGhlYXJkOiBoZWFyZC5maWx0ZXIod2l0aGluKS5sZW5ndGgsIHJlcGxpZXM6IHJlcGxpZXMuZmlsdGVyKHdpdGhpbikubGVuZ3RoIH07XG4gICAgfSksXG4gICk7XG4gIGNvbnN0IHBlYWsgPSAkZGVyaXZlZChNYXRoLm1heCgxLCAuLi5kYXlzLm1hcCgoZGF5KSA9PiBNYXRoLm1heChkYXkuaGVhcmQsIGRheS5yZXBsaWVzKSkpKTtcbjwvc2NyaXB0PlxuXG48ZGl2IGNsYXNzPVwiZGVza1wiPlxuICA8aGVhZGVyPlxuICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPlxuICAgICAgPGgxPnttb2RlLm5hbWV9PC9oMT5cbiAgICAgIDxzcGFuIGNsYXNzPVwicmVmZXJlbmNlXCI+e21vZGUudHlwZX0ve21vZGUuc2x1Z308L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgeyNpZiBzZXR0aW5nc31cbiAgICAgIDxkbCBjbGFzcz1cInNldHRpbmdzXCI+XG4gICAgICAgIDxkaXY+PGR0Pm93bmVyPC9kdD48ZGQ+e3NldHRpbmdzLnVzZXJ9PC9kZD48L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZHQ+cGxhdGZvcm1zPC9kdD5cbiAgICAgICAgICA8ZGQ+XG4gICAgICAgICAgICB7I2VhY2ggc2V0dGluZ3MucGxhdGZvcm1zIGFzIHBsYXRmb3JtIChwbGF0Zm9ybSl9XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2hpcFwiPntwbGF0Zm9ybX08L3NwYW4+XG4gICAgICAgICAgICB7L2VhY2h9XG4gICAgICAgICAgPC9kZD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+PGR0Pm5ldyB0aHJlYWQgYWZ0ZXI8L2R0PjxkZD57c3BhbihzZXR0aW5ncy5pZGxlKX0gb2Ygc2lsZW5jZSwgb3IgL25ldzwvZGQ+PC9kaXY+XG4gICAgICA8L2RsPlxuICAgIHs6ZWxzZSBpZiBmYXVsdH1cbiAgICAgIDxwIGNsYXNzPVwiZmF1bHRcIj5zZXR0aW5ncyB1bnJlYWQ6IHtmYXVsdH08L3A+XG4gICAgey9pZn1cbiAgPC9oZWFkZXI+XG5cbiAgPHNlY3Rpb24gY2xhc3M9XCJ0aWxlc1wiPlxuICAgIDxkaXYgY2xhc3M9XCJ0aWxlXCI+PGI+e2xpc3RlZC5sZW5ndGh9PC9iPjxzcGFuPnRocmVhZHM8L3NwYW4+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInRpbGVcIj48Yj57aGVhcmQubGVuZ3RofTwvYj48c3Bhbj5oZWFyZDwvc3Bhbj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidGlsZVwiPjxiPntyZXBsaWVzLmxlbmd0aH08L2I+PHNwYW4+cmVwbGllczwvc3Bhbj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwidGlsZVwiPlxuICAgICAgPGI+e2hlYXJkLmxlbmd0aCA/IGFnbyhhdChoZWFyZC5hdCgtMSkpKSA6IFwi4oCUXCJ9PC9iPjxzcGFuPnNpbmNlIGxhc3QgaGVhcmQ8L3NwYW4+XG4gICAgPC9kaXY+XG4gIDwvc2VjdGlvbj5cblxuICA8c2VjdGlvbiBjbGFzcz1cImRheXNcIiBhcmlhLWxhYmVsPVwibWVzc2FnZXMgcGVyIGRheSwgbGFzdCB7REFZU30gZGF5c1wiPlxuICAgIHsjZWFjaCBkYXlzIGFzIGRheSAoZGF5LmZyb20pfVxuICAgICAgPGRpdiBjbGFzcz1cImRheVwiIHRpdGxlPVwie2Nsb2NrKGRheS5mcm9tKX0gwrcge2RheS5oZWFyZH0gaGVhcmQgwrcge2RheS5yZXBsaWVzfSByZXBsaWVzXCI+XG4gICAgICAgIDxpIGNsYXNzPVwiaGVhcmRcIiBzdHlsZTpoZWlnaHQ9XCJ7KGRheS5oZWFyZCAvIHBlYWspICogMTAwfSVcIj48L2k+XG4gICAgICAgIDxpIGNsYXNzPVwicmVwbGllc1wiIHN0eWxlOmhlaWdodD1cInsoZGF5LnJlcGxpZXMgLyBwZWFrKSAqIDEwMH0lXCI+PC9pPlxuICAgICAgPC9kaXY+XG4gICAgey9lYWNofVxuICA8L3NlY3Rpb24+XG4gIDxwIGNsYXNzPVwibGVnZW5kXCI+PGkgY2xhc3M9XCJoZWFyZFwiPjwvaT4gaGVhcmQgPGkgY2xhc3M9XCJyZXBsaWVzXCI+PC9pPiByZXBsaWVzIMK3IHtEQVlTfSBkYXlzPC9wPlxuXG4gIDxkaXYgY2xhc3M9XCJjb2x1bW5zXCI+XG4gICAgPHNlY3Rpb24+XG4gICAgICA8aDI+dGhyZWFkczwvaDI+XG4gICAgICB7I2lmIGxpc3RlZC5sZW5ndGggPT09IDB9XG4gICAgICAgIDxwIGNsYXNzPVwiZW1wdHlcIj5cbiAgICAgICAgICBOb3RoaW5nIGhlYXJkIHlldC4gTWVzc2FnZSB0aGUgbnVtYmVyIGFuZCB0aGUgZmlyc3QgdGhyZWFkIGFwcGVhcnMgaGVyZS5cbiAgICAgICAgPC9wPlxuICAgICAgey9pZn1cbiAgICAgIDx1bCBjbGFzcz1cInRocmVhZHNcIj5cbiAgICAgICAgeyNlYWNoIGxpc3RlZCBhcyBoZWxkIChoZWxkLnRocmVhZC5pZCl9XG4gICAgICAgICAgPGxpPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzczpvbj17aGVsZC50aHJlYWQgPT09ICRzZWF0fVxuICAgICAgICAgICAgICBvbmNsaWNrPXsoKSA9PiB0ZXJtaW5hbC5zZXRUaHJlYWQoaGVsZC50aHJlYWQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgICAgIDxiPntoZWxkLnRocmVhZC53b3JkfTwvYj5cbiAgICAgICAgICAgICAgICB7I2VhY2ggaGVsZC5wbGF0Zm9ybXMgYXMgcGxhdGZvcm0gKHBsYXRmb3JtKX1cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2hpcFwiPntwbGF0Zm9ybX08L3NwYW4+XG4gICAgICAgICAgICAgICAgey9lYWNofVxuICAgICAgICAgICAgICAgIDx0aW1lPnthZ28oaGVsZC50b3VjaGVkKX08L3RpbWU+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcmV2aWV3XCI+e2hlbGQubGFzdCA/IHNhaWQoaGVsZC5sYXN0KSA6IFwibm8gdHVybnMgeWV0XCJ9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNvdW50XCI+e2hlbGQudHVybnN9IHR1cm5zIMK3ICN7aGVsZC50aHJlYWQuaWQuc2xpY2UoLTYpfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIHsvZWFjaH1cbiAgICAgIDwvdWw+XG4gICAgPC9zZWN0aW9uPlxuXG4gICAgPHNlY3Rpb24+XG4gICAgICA8aDI+d2lyZSB7I2lmICRzZWF0fTxzcGFuIGNsYXNzPVwicmVmZXJlbmNlXCI+I3skc2VhdC5pZC5zbGljZSgtNil9PC9zcGFuPnsvaWZ9PC9oMj5cbiAgICAgIHsjaWYgd2lyZS5sZW5ndGggPT09IDB9XG4gICAgICAgIDxwIGNsYXNzPVwiZW1wdHlcIj5TZWF0IGEgdGhyZWFkIHRvIHJlYWQgd2hhdCBlYWNoIHR1cm4gYXJyaXZlZCB3aXRoLjwvcD5cbiAgICAgIHsvaWZ9XG4gICAgICA8b2wgY2xhc3M9XCJ3aXJlXCI+XG4gICAgICAgIHsjZWFjaCB3aXJlIGFzIHR1cm4gKHR1cm4uaWQpfVxuICAgICAgICAgIDxsaSBjbGFzcz17dHVybi5yb2xlfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICAgICAgICAgPGI+e3R1cm4ucm9sZSA9PT0gXCJ1c2VyXCIgPyBcImhlYXJkXCIgOiB0dXJuLnJvbGV9PC9iPlxuICAgICAgICAgICAgICB7I2lmIHR1cm4ubWV0YT8ucHJvdmlkZXJ9PHNwYW4gY2xhc3M9XCJjaGlwXCI+e3R1cm4ubWV0YS5wcm92aWRlci5wbGF0Zm9ybX08L3NwYW4+ey9pZn1cbiAgICAgICAgICAgICAgPHRpbWU+e2Nsb2NrKGF0KHR1cm4pKX08L3RpbWU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwPntzYWlkKHR1cm4pfXsjaWYgY2FycmllZCh0dXJuKX08c3BhbiBjbGFzcz1cImNhcnJpZWRcIj57Y2FycmllZCh0dXJuKX08L3NwYW4+ey9pZn08L3A+XG4gICAgICAgICAgICB7I2lmIHR1cm4ubWV0YT8ucHJvdmlkZXJ9XG4gICAgICAgICAgICAgIDxkZXRhaWxzPlxuICAgICAgICAgICAgICAgIDxzdW1tYXJ5Pnt0dXJuLm1ldGEucHJvdmlkZXIubmFtZX0gwrcge3R1cm4ubWV0YS5wcm92aWRlci5mcm9tfTwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgICA8cHJlPntKU09OLnN0cmluZ2lmeSh0dXJuLm1ldGEucHJvdmlkZXIsIG51bGwsIDIpfTwvcHJlPlxuICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICB7L2lmfVxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIHsvZWFjaH1cbiAgICAgIDwvb2w+XG4gICAgPC9zZWN0aW9uPlxuICA8L2Rpdj5cbjwvZGl2PlxuXG48c3R5bGU+XG4gIC5kZXNrIHtcbiAgICBtaW4taGVpZ2h0OiAxMDAlO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgcGFkZGluZzogdmFyKC0tc2l6ZS1zcGFjZS1sZyk7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGdhcDogdmFyKC0tc2l6ZS1zcGFjZS1tZCk7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tcGxhbmUpO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWluayk7XG4gICAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5LXNhbnMtdGV4dCk7XG4gICAgZm9udC1zaXplOiB2YXIoLS1zaXplLXR5cGUtc20pO1xuICAgIGNvbnRhaW5lci10eXBlOiBpbmxpbmUtc2l6ZTtcbiAgfVxuICBoZWFkZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogdmFyKC0tc2l6ZS1zcGFjZS1tZCk7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICB9XG4gIC50aXRsZSB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBiYXNlbGluZTsgZ2FwOiB2YXIoLS1zaXplLXNwYWNlLXNtKTsgfVxuICBoMSB7IG1hcmdpbjogMDsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5LXNhbnMtaGVhZGluZyk7IGZvbnQtc2l6ZTogdmFyKC0tc2l6ZS10eXBlLXhsKTsgfVxuICBoMSwgaDIsIGIgeyBjb2xvcjogdmFyKC0tdGV4dC1zdHJvbmcpOyB9XG4gIGgyIHtcbiAgICBtYXJnaW46IDAgMCB2YXIoLS1zaXplLXNwYWNlLXNtKTtcbiAgICBmb250LXNpemU6IHZhcigtLXNpemUtdHlwZS14cyk7XG4gICAgdGV4dC10cmFuc2Zvcm06IHZhcigtLXNoYXBlLWxhYmVsLWNhc2UpO1xuICAgIGxldHRlci1zcGFjaW5nOiB2YXIoLS1zaGFwZS1sYWJlbC10cmFjayk7XG4gIH1cbiAgLnJlZmVyZW5jZSwgdGltZSwgLmNvdW50LCBkdCwgLmxlZ2VuZCwgLmNhcnJpZWQge1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcbiAgICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHktY29kZSk7XG4gICAgZm9udC1zaXplOiB2YXIoLS1zaXplLXR5cGUtMnhzKTtcbiAgfVxuICAuY2FycmllZCB7IG1hcmdpbi1sZWZ0OiB2YXIoLS1zaXplLXNwYWNlLXhzKTsgfVxuICAuc2V0dGluZ3MgeyBkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogdmFyKC0tc2l6ZS1zcGFjZS1tZCk7IG1hcmdpbjogMDsgfVxuICBkZCB7IG1hcmdpbjogMDsgfVxuICAuY2hpcCB7XG4gICAgcGFkZGluZzogMCB2YXIoLS1zaXplLXNwYWNlLXhzKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1zaGFwZS1yYWRpdXMtcGlsbCk7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2lnbmFsLXByaW1hcnktdGludCk7XG4gICAgY29sb3I6IHZhcigtLXNpZ25hbC1wcmltYXJ5LWluayk7XG4gICAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5LWNvZGUpO1xuICAgIGZvbnQtc2l6ZTogdmFyKC0tc2l6ZS10eXBlLTJ4cyk7XG4gIH1cbiAgLmZhdWx0IHsgbWFyZ2luOiAwOyBjb2xvcjogdmFyKC0tc2lnbmFsLW5lZ2F0aXZlLWluayk7IH1cbiAgLnRpbGVzIHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNCwgMWZyKTsgZ2FwOiB2YXIoLS1zaXplLXNwYWNlLXNtKTsgfVxuICAudGlsZSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIHBhZGRpbmc6IHZhcigtLXNpemUtc3BhY2Utc20pIHZhcigtLXNpemUtc3BhY2UtbWQpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvdW5kYXJ5LXNvZnQpO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXNoYXBlLXJhZGl1cy1jYXJkKTtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wbGFuZS1saWZ0KTtcbiAgfVxuICAudGlsZSBiIHsgZm9udC1zaXplOiB2YXIoLS1zaXplLXR5cGUteGwpOyBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zOyB9XG4gIC50aWxlIHNwYW4geyBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IGZvbnQtc2l6ZTogdmFyKC0tc2l6ZS10eXBlLXhzKTsgfVxuICAuZGF5cyB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsgZ2FwOiB2YXIoLS1zaXplLXNwYWNlLTJ4cyk7IGhlaWdodDogNTZweDsgfVxuICAuZGF5IHsgZmxleDogMTsgaGVpZ2h0OiAxMDAlOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGdhcDogMXB4OyB9XG4gIC5kYXkgaSB7IGZsZXg6IDE7IG1pbi1oZWlnaHQ6IDFweDsgYm9yZGVyLXJhZGl1czogdmFyKC0tc2hhcGUtcmFkaXVzLTJ4cyk7IH1cbiAgaS5oZWFyZCB7IGJhY2tncm91bmQ6IHZhcigtLXNpZ25hbC1wcmltYXJ5KTsgfVxuICBpLnJlcGxpZXMgeyBiYWNrZ3JvdW5kOiB2YXIoLS1zaWduYWwtcG9zaXRpdmUpOyB9XG4gIC5sZWdlbmQgeyBtYXJnaW46IDA7IH1cbiAgLmxlZ2VuZCBpIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgd2lkdGg6IDhweDtcbiAgICBoZWlnaHQ6IDhweDtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1zaGFwZS1yYWRpdXMtMnhzKTtcbiAgfVxuICAuY29sdW1ucyB7IGRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDFmcjsgZ2FwOiB2YXIoLS1zaXplLXNwYWNlLWxnKTsgfVxuICB1bCwgb2wgeyBsaXN0LXN0eWxlOiBub25lOyBtYXJnaW46IDA7IHBhZGRpbmc6IDA7IGRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cbiAgdWwsIG9sIHsgZ2FwOiB2YXIoLS1zaXplLXNwYWNlLXhzKTsgfVxuICBidXR0b24ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBnYXA6IHZhcigtLXNpemUtc3BhY2UtMnhzKTtcbiAgICBwYWRkaW5nOiB2YXIoLS1zaXplLXNwYWNlLXNtKTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3VuZGFyeS1zb2Z0KTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1zaGFwZS1yYWRpdXMtY2FyZCk7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tcGxhbmUtbGlmdCk7XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgfVxuICBidXR0b246aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWJvdW5kYXJ5LXN0cm9uZyk7IH1cbiAgYnV0dG9uOmZvY3VzLXZpc2libGUgeyBvdXRsaW5lOiB2YXIoLS1zaXplLXJpbmcpIHNvbGlkIHZhcigtLWNvbnRyb2wtZm9jdXMpOyB9XG4gIGJ1dHRvbi5vbiB7IGJvcmRlci1jb2xvcjogdmFyKC0tc2lnbmFsLXByaW1hcnkpOyBiYWNrZ3JvdW5kOiB2YXIoLS1jb250cm9sLXNlbGVjdGVkKTsgfVxuICAucm93IHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiB2YXIoLS1zaXplLXNwYWNlLXhzKTsgfVxuICAucm93IHRpbWUgeyBtYXJnaW4tbGVmdDogYXV0bzsgfVxuICAucHJldmlldywgLndpcmUgcCB7IG1hcmdpbjogMDsgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7IH1cbiAgLnByZXZpZXcge1xuICAgIGRpc3BsYXk6IC13ZWJraXQtYm94O1xuICAgIC13ZWJraXQtbGluZS1jbGFtcDogMjtcbiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gIH1cbiAgLndpcmUgbGkgeyBwYWRkaW5nOiB2YXIoLS1zaXplLXNwYWNlLXNtKTsgYm9yZGVyLWxlZnQ6IDJweCBzb2xpZCB2YXIoLS1ib3VuZGFyeSk7IH1cbiAgLndpcmUgbGkudXNlciB7IGJvcmRlci1sZWZ0LWNvbG9yOiB2YXIoLS1zaWduYWwtcHJpbWFyeSk7IH1cbiAgLndpcmUgbGkuYXNzaXN0YW50IHsgYm9yZGVyLWxlZnQtY29sb3I6IHZhcigtLXNpZ25hbC1wb3NpdGl2ZSk7IH1cbiAgc3VtbWFyeSB7IGN1cnNvcjogcG9pbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOyBmb250LXNpemU6IHZhcigtLXNpemUtdHlwZS14cyk7IH1cbiAgcHJlIHtcbiAgICBtYXJnaW46IHZhcigtLXNpemUtc3BhY2UteHMpIDAgMDtcbiAgICBwYWRkaW5nOiB2YXIoLS1zaXplLXNwYWNlLXNtKTtcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXNoYXBlLXJhZGl1cy14cyk7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tcGxhbmUtc3Vuayk7XG4gICAgY29sb3I6IHZhcigtLXRleHQtY29kZSk7XG4gICAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5LWNvZGUpO1xuICAgIGZvbnQtc2l6ZTogdmFyKC0tc2l6ZS10eXBlLTJ4cyk7XG4gIH1cbiAgLmVtcHR5IHsgbWFyZ2luOiAwOyBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IH1cbiAgQGNvbnRhaW5lciAobWF4LXdpZHRoOiA2NDBweCkge1xuICAgIC5jb2x1bW5zIHsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7IH1cbiAgICAudGlsZXMgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpOyB9XG4gIH1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQW9NQSxFQUFFLG9CQUFLLENBQUM7QUFDUixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLHNCQUFzQjtBQUMxQixJQUFJLDZCQUE2QjtBQUNqQyxJQUFJLGFBQWE7QUFDakIsSUFBSSxzQkFBc0I7QUFDMUIsSUFBSSx5QkFBeUI7QUFDN0IsSUFBSSx3QkFBd0I7QUFDNUIsSUFBSSxzQkFBc0I7QUFDMUIsSUFBSSx5Q0FBeUM7QUFDN0MsSUFBSSw4QkFBOEI7QUFDbEMsSUFBSSwyQkFBMkI7QUFDL0I7QUFDQSxFQUFFLHFCQUFNLENBQUM7QUFDVCxJQUFJLGFBQWE7QUFDakIsSUFBSSxlQUFlO0FBQ25CLElBQUkseUJBQXlCO0FBQzdCLElBQUksOEJBQThCO0FBQ2xDO0FBQ0EsRUFBRSxxQkFBTSxDQUFDLEVBQUUsYUFBYSxFQUFFLHFCQUFxQixFQUFFLHlCQUF5QjtBQUMxRSxFQUFFLGlCQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsNENBQTRDLEVBQUUsOEJBQThCO0FBQzlGLEVBQUUsaUJBQUUsRUFBRSxpQkFBRSxFQUFFLGdCQUFDLENBQUMsRUFBRSx5QkFBeUI7QUFDdkMsRUFBRSxpQkFBRSxDQUFDO0FBQ0wsSUFBSSxnQ0FBZ0M7QUFDcEMsSUFBSSw4QkFBOEI7QUFDbEMsSUFBSSx1Q0FBdUM7QUFDM0MsSUFBSSx3Q0FBd0M7QUFDNUM7QUFDQSxFQUFFLHlCQUFVLEVBQUUsbUJBQUksRUFBRSxxQkFBTSxFQUFFLGlCQUFFLEVBQUUsc0JBQU8sRUFBRSx1QkFBUSxDQUFDO0FBQ2xELElBQUksd0JBQXdCO0FBQzVCLElBQUksb0NBQW9DO0FBQ3hDLElBQUksK0JBQStCO0FBQ25DO0FBQ0EsRUFBRSx1QkFBUSxDQUFDLEVBQUUsaUNBQWlDO0FBQzlDLEVBQUUsd0JBQVMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUseUJBQXlCLEVBQUUsU0FBUztBQUNsRixFQUFFLGlCQUFFLENBQUMsRUFBRSxTQUFTO0FBQ2hCLEVBQUUsb0JBQUssQ0FBQztBQUNSLElBQUksK0JBQStCO0FBQ25DLElBQUksdUNBQXVDO0FBQzNDLElBQUksc0NBQXNDO0FBQzFDLElBQUksZ0NBQWdDO0FBQ3BDLElBQUksb0NBQW9DO0FBQ3hDLElBQUksK0JBQStCO0FBQ25DO0FBQ0EsRUFBRSxxQkFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLGlDQUFpQztBQUN2RCxFQUFFLHFCQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUscUNBQXFDLEVBQUUseUJBQXlCO0FBQzFGLEVBQUUsb0JBQUssQ0FBQztBQUNSLElBQUksYUFBYTtBQUNqQixJQUFJLHNCQUFzQjtBQUMxQixJQUFJLGtEQUFrRDtBQUN0RCxJQUFJLHNDQUFzQztBQUMxQyxJQUFJLHVDQUF1QztBQUMzQyxJQUFJLDZCQUE2QjtBQUNqQztBQUNBLEVBQUUsb0JBQUssQ0FBQyx3QkFBQyxDQUFDLEVBQUUsOEJBQThCLEVBQUUsa0NBQWtDO0FBQzlFLEVBQUUsb0JBQUssQ0FBQywyQkFBSSxDQUFDLEVBQUUsd0JBQXdCLEVBQUUsOEJBQThCO0FBQ3ZFLEVBQUUsb0JBQUssQ0FBQyxFQUFFLGFBQWEsRUFBRSxxQkFBcUIsRUFBRSwwQkFBMEIsRUFBRSxZQUFZO0FBQ3hGLEVBQUUsbUJBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLHFCQUFxQixFQUFFLFFBQVE7QUFDOUUsRUFBRSxtQkFBSSxDQUFDLHdCQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLHNDQUFzQztBQUMzRSxFQUFFLENBQUMscUJBQU0sQ0FBQyxFQUFFLGlDQUFpQztBQUM3QyxFQUFFLENBQUMsdUJBQVEsQ0FBQyxFQUFFLGtDQUFrQztBQUNoRCxFQUFFLHNCQUFPLENBQUMsRUFBRSxTQUFTO0FBQ3JCLEVBQUUsc0JBQU8sQ0FBQyx3QkFBQyxDQUFDO0FBQ1osSUFBSSxxQkFBcUI7QUFDekIsSUFBSSxVQUFVO0FBQ2QsSUFBSSxXQUFXO0FBQ2YsSUFBSSxzQ0FBc0M7QUFDMUM7QUFDQSxFQUFFLHVCQUFRLENBQUMsRUFBRSxhQUFhLEVBQUUsOEJBQThCLEVBQUUseUJBQXlCO0FBQ3JGLEVBQUUsaUJBQUUsRUFBRSxpQkFBRSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsc0JBQXNCO0FBQ3pGLEVBQUUsaUJBQUUsRUFBRSxpQkFBRSxDQUFDLEVBQUUseUJBQXlCO0FBQ3BDLEVBQUUscUJBQU0sQ0FBQztBQUNULElBQUksV0FBVztBQUNmLElBQUksYUFBYTtBQUNqQixJQUFJLHNCQUFzQjtBQUMxQixJQUFJLDBCQUEwQjtBQUM5QixJQUFJLDZCQUE2QjtBQUNqQyxJQUFJLHNDQUFzQztBQUMxQyxJQUFJLHVDQUF1QztBQUMzQyxJQUFJLDZCQUE2QjtBQUNqQyxJQUFJLGNBQWM7QUFDbEIsSUFBSSxhQUFhO0FBQ2pCLElBQUksZ0JBQWdCO0FBQ3BCLElBQUksZUFBZTtBQUNuQjtBQUNBLEVBQUUscUJBQU0sTUFBTSxDQUFDLEVBQUUsb0NBQW9DO0FBQ3JELEVBQUUscUJBQU0sY0FBYyxDQUFDLEVBQUUsb0RBQW9EO0FBQzdFLEVBQUUsTUFBTSxrQkFBRyxDQUFDLEVBQUUsbUNBQW1DLEVBQUUsbUNBQW1DO0FBQ3RGLEVBQUUsbUJBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSx5QkFBeUI7QUFDdEUsRUFBRSxtQkFBSSxDQUFDLDJCQUFJLENBQUMsRUFBRSxpQkFBaUI7QUFDL0IsRUFBRSx1QkFBUSxFQUFFLG9CQUFLLENBQUMsd0JBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSx1QkFBdUI7QUFDeEQsRUFBRSx1QkFBUSxDQUFDO0FBQ1gsSUFBSSxvQkFBb0I7QUFDeEIsSUFBSSxxQkFBcUI7QUFDekIsSUFBSSw0QkFBNEI7QUFDaEMsSUFBSSxnQkFBZ0I7QUFDcEI7QUFDQSxFQUFFLG9CQUFLLENBQUMseUJBQUUsQ0FBQyxFQUFFLDZCQUE2QixFQUFFLHNDQUFzQztBQUNsRixFQUFFLG9CQUFLLENBQUMsRUFBRSw0QkFBSyxDQUFDLEVBQUUsd0NBQXdDO0FBQzFELEVBQUUsb0JBQUssQ0FBQyxFQUFFLGlDQUFVLENBQUMsRUFBRSx5Q0FBeUM7QUFDaEUsRUFBRSxzQkFBTyxDQUFDLEVBQUUsZUFBZSxFQUFFLHdCQUF3QixFQUFFLDhCQUE4QjtBQUNyRixFQUFFLGtCQUFHLENBQUM7QUFDTixJQUFJLGdDQUFnQztBQUNwQyxJQUFJLDZCQUE2QjtBQUNqQyxJQUFJLGdCQUFnQjtBQUNwQixJQUFJLHFDQUFxQztBQUN6QyxJQUFJLDZCQUE2QjtBQUNqQyxJQUFJLHVCQUF1QjtBQUMzQixJQUFJLG9DQUFvQztBQUN4QyxJQUFJLCtCQUErQjtBQUNuQztBQUNBLEVBQUUscUJBQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSx3QkFBd0I7QUFDOUMsRUFBRSw4QkFBOEI7QUFDaEMsSUFBSSx1QkFBUSxDQUFDLEVBQUUsMEJBQTBCO0FBQ3pDLElBQUkscUJBQU0sQ0FBQyxFQUFFLHFDQUFxQztBQUNsRCIsImlnbm9yZUxpc3QiOltdfQ== */"
};
function Desk($$anchor, $$props) {
  check_target(new.target);
  push($$props, true, Desk);
  append_styles($$anchor, $$css);
  const $turns = () => (validate_store(turns2, "turns"), store_get(turns2, "$turns", $$stores));
  const $threads = () => (validate_store(threads, "threads"), store_get(threads, "$threads", $$stores));
  const $seat = () => (validate_store(seat, "seat"), store_get(seat, "$seat", $$stores));
  const [$$stores, $$cleanup] = setup_stores();
  const mode2 = $$props.buffer.mode;
  const threads = $$props.terminal.client.runtime.entities.thread.$entities;
  const turns2 = $$props.terminal.client.runtime.entities.turn.$entities;
  const seat = $$props.terminal.$thread;
  const DAY = 864e5;
  const DAYS = 14;
  let settings = tag(state(null), "settings");
  let fault = tag(state(null), "fault");
  let now2 = tag(state(proxy(Date.now())), "now");
  user_effect(() => {
    mode2.call.settings({}).then((held) => set(settings, held, true), (error) => set(fault, error.message, true));
    mode2.entities.thread.find({});
    mode2.entities.turn.find({});
    const unsubscribe = mode2.entities.turn.subscribe({});
    const clock2 = setInterval(() => set(now2, Date.now(), true), 3e4);
    return () => {
      unsubscribe();
      clearInterval(clock2);
    };
  });
  const at = (entity) => new Date(entity.createdAt).getTime();
  const said = (turn) => turn.parts.filter((part) => strict_equals(part.type, "text")).map((part) => part.text).join(" ");
  const carried = (turn) => turn.parts.filter((part) => strict_equals(part.type, "text", false)).map((part) => part.type).join(" \xB7 ");
  const ago = (time) => {
    const minutes = Math.round((get(now2) - time) / 6e4);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes} m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
    return `${Math.round(minutes / 1440)} d`;
  };
  const clock = (time) => new Date(time).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const span = (seconds) => seconds % 3600 ? `${seconds / 60} min` : `${seconds / 3600} h`;
  const spoken = tag(user_derived(() => $turns().filter((turn) => strict_equals(turn.thread.mode, mode2)).toSorted((first, second) => at(first) - at(second))), "spoken");
  const heard2 = tag(user_derived(() => get(spoken).filter((turn) => strict_equals(turn.role, "user") && turn.meta?.provider)), "heard");
  const replies = tag(user_derived(() => get(spoken).filter((turn) => strict_equals(turn.role, "assistant") && said(turn))), "replies");
  const listed = tag(user_derived(() => $threads().filter((thread2) => strict_equals(thread2.mode, mode2)).map((thread2) => {
    const own = get(spoken).filter((turn) => strict_equals(turn.thread, thread2));
    const last = own.findLast((turn) => said(turn));
    return {
      thread: thread2,
      turns: own.length,
      last,
      touched: own.length ? at(own.at(-1)) : at(thread2),
      platforms: [
        ...new Set(own.flatMap((turn) => turn.meta?.provider?.platform ?? []))
      ]
    };
  }).toSorted((first, second) => second.touched - first.touched)), "listed");
  const wire = tag(user_derived(() => get(spoken).filter((turn) => strict_equals(turn.thread, $seat())).toReversed()), "wire");
  const days = tag(user_derived(() => Array.from({
    length: DAYS
  }, (unused, index2) => {
    const from = new Date(get(now2)).setHours(0, 0, 0, 0) - (DAYS - 1 - index2) * DAY;
    const within = (turn) => at(turn) >= from && at(turn) < from + DAY;
    return {
      from,
      heard: get(heard2).filter(within).length,
      replies: get(replies).filter(within).length
    };
  })), "days");
  const peak = tag(user_derived(() => Math.max(1, ...get(days).map((day) => Math.max(day.heard, day.replies)))), "peak");
  var $$exports = {
    ...legacy_api()
  };
  var div = root_13();
  var header = child(div);
  var div_1 = child(header);
  var h1 = child(div_1);
  var text2 = only_child(h1, true);
  var span_1 = sibling(h1, 2);
  var text_1 = only_child(span_1);
  reset(div_1);
  var node = sibling(div_1, 2);
  {
    var consequent = ($$anchor2) => {
      var dl = root_1();
      var div_2 = child(dl);
      var dd = sibling(child(div_2));
      var text_2 = only_child(dd, true);
      reset(div_2);
      var div_3 = sibling(div_2, 2);
      var dd_1 = sibling(child(div_3), 2);
      add_svelte_meta(() => each(dd_1, 20, () => get(settings).platforms, (platform) => platform, ($$anchor3, platform) => {
        var span_2 = root();
        var text_3 = only_child(span_2, true);
        template_effect(() => set_text(text_3, platform));
        append($$anchor3, span_2);
      }), "each", Desk, 108, 12);
      reset(dd_1);
      reset(div_3);
      var div_4 = sibling(div_3, 2);
      var dd_2 = sibling(child(div_4));
      var text_4 = only_child(dd_2);
      reset(div_4);
      reset(dl);
      template_effect(($0) => {
        set_text(text_2, get(settings).user);
        set_text(text_4, `${$0 ?? ""} of silence, or /new`);
      }, [
        () => span(get(settings).idle)
      ]);
      append($$anchor2, dl);
    };
    var consequent_1 = ($$anchor2) => {
      var p = root_2();
      var text_5 = only_child(p);
      template_effect(() => set_text(text_5, `settings unread: ${get(fault) ?? ""}`));
      append($$anchor2, p);
    };
    add_svelte_meta(() => if_block(node, ($$render) => {
      if (get(settings)) $$render(consequent);
      else if (get(fault)) $$render(consequent_1, 1);
    }), "if", Desk, 102, 4);
  }
  reset(header);
  var section = sibling(header, 2);
  var div_5 = child(section);
  var b = child(div_5);
  var text_6 = only_child(b, true);
  next();
  reset(div_5);
  var div_6 = sibling(div_5, 2);
  var b_1 = child(div_6);
  var text_7 = only_child(b_1, true);
  next();
  reset(div_6);
  var div_7 = sibling(div_6, 2);
  var b_2 = child(div_7);
  var text_8 = only_child(b_2, true);
  next();
  reset(div_7);
  var div_8 = sibling(div_7, 2);
  var b_3 = child(div_8);
  var text_9 = only_child(b_3, true);
  next();
  reset(div_8);
  reset(section);
  var section_1 = sibling(section, 2);
  set_attribute2(section_1, "aria-label", "messages per day, last 14 days");
  add_svelte_meta(() => each(section_1, 21, () => get(days), (day) => day.from, ($$anchor2, day) => {
    var div_9 = root_3();
    var i = child(div_9);
    let styles;
    var i_1 = sibling(i, 2);
    let styles_1;
    reset(div_9);
    template_effect(($0) => {
      set_attribute2(div_9, "title", `${$0 ?? ""} \xB7 ${get(day).heard ?? ""} heard \xB7 ${get(day).replies ?? ""} replies`);
      styles = set_style(i, "", styles, {
        height: `${get(day).heard / get(peak) * 100}%`
      });
      styles_1 = set_style(i_1, "", styles_1, {
        height: `${get(day).replies / get(peak) * 100}%`
      });
    }, [
      () => clock(get(day).from)
    ]);
    append($$anchor2, div_9);
  }), "each", Desk, 130, 4);
  reset(section_1);
  var p_1 = sibling(section_1, 2);
  var text_10 = sibling(child(p_1), 3);
  text_10.nodeValue = " replies \xB7 14 days";
  reset(p_1);
  var div_10 = sibling(p_1, 2);
  var section_2 = child(div_10);
  var node_1 = sibling(child(section_2), 2);
  {
    var consequent_2 = ($$anchor2) => {
      var p_2 = root_4();
      append($$anchor2, p_2);
    };
    add_svelte_meta(() => if_block(node_1, ($$render) => {
      if (strict_equals(get(listed).length, 0)) $$render(consequent_2);
    }), "if", Desk, 142, 6);
  }
  var ul = sibling(node_1, 2);
  add_svelte_meta(() => each(ul, 21, () => get(listed), (held) => held.thread.id, ($$anchor2, held) => {
    var li = root_6();
    var button = child(li);
    let classes;
    var span_3 = child(button);
    var b_4 = child(span_3);
    var text_11 = only_child(b_4, true);
    var node_2 = sibling(b_4, 2);
    add_svelte_meta(() => each(node_2, 16, () => get(held).platforms, (platform) => platform, ($$anchor3, platform) => {
      var span_4 = root_5();
      var text_12 = only_child(span_4, true);
      template_effect(() => set_text(text_12, platform));
      append($$anchor3, span_4);
    }), "each", Desk, 156, 16);
    var time_1 = sibling(node_2, 2);
    var text_13 = only_child(time_1, true);
    reset(span_3);
    var span_5 = sibling(span_3, 2);
    var text_14 = only_child(span_5, true);
    var span_6 = sibling(span_5, 2);
    var text_15 = only_child(span_6);
    reset(button);
    reset(li);
    template_effect(($0, $1, $2) => {
      classes = set_class(button, 1, "svelte-1mqr3oq", null, classes, {
        on: strict_equals(get(held).thread, $seat())
      });
      set_text(text_11, get(held).thread.word);
      set_text(text_13, $0);
      set_text(text_14, $1);
      set_text(text_15, `${get(held).turns ?? ""} turns \xB7 #${$2 ?? ""}`);
    }, [
      () => ago(get(held).touched),
      () => get(held).last ? said(get(held).last) : "no turns yet",
      () => get(held).thread.id.slice(-6)
    ]);
    delegated("click", button, function click() {
      return $$props.terminal.setThread(get(held).thread);
    });
    append($$anchor2, li);
  }), "each", Desk, 148, 8);
  reset(ul);
  reset(section_2);
  var section_3 = sibling(section_2, 2);
  var h2 = child(section_3);
  var node_3 = sibling(child(h2));
  {
    var consequent_3 = ($$anchor2) => {
      var span_7 = root_7();
      var text_16 = only_child(span_7);
      template_effect(($0) => set_text(text_16, `#${$0 ?? ""}`), [
        () => $seat().id.slice(-6)
      ]);
      append($$anchor2, span_7);
    };
    add_svelte_meta(() => if_block(node_3, ($$render) => {
      if ($seat()) $$render(consequent_3);
    }), "if", Desk, 170, 15);
  }
  reset(h2);
  var node_4 = sibling(h2, 2);
  {
    var consequent_4 = ($$anchor2) => {
      var p_3 = root_8();
      append($$anchor2, p_3);
    };
    add_svelte_meta(() => if_block(node_4, ($$render) => {
      if (strict_equals(get(wire).length, 0)) $$render(consequent_4);
    }), "if", Desk, 171, 6);
  }
  var ol = sibling(node_4, 2);
  add_svelte_meta(() => each(ol, 21, () => get(wire), (turn) => turn.id, ($$anchor2, turn) => {
    var li_1 = root_12();
    var div_11 = child(li_1);
    var b_5 = child(div_11);
    var text_17 = only_child(b_5, true);
    var node_5 = sibling(b_5, 2);
    {
      var consequent_5 = ($$anchor3) => {
        var span_8 = root_9();
        var text_18 = only_child(span_8, true);
        template_effect(() => set_text(text_18, get(turn).meta.provider.platform));
        append($$anchor3, span_8);
      };
      add_svelte_meta(() => if_block(node_5, ($$render) => {
        if (get(turn).meta?.provider) $$render(consequent_5);
      }), "if", Desk, 179, 14);
    }
    var time_2 = sibling(node_5, 2);
    var text_19 = only_child(time_2, true);
    reset(div_11);
    var p_4 = sibling(div_11, 2);
    var text_20 = child(p_4, true);
    var node_6 = sibling(text_20);
    {
      var consequent_6 = ($$anchor3) => {
        var span_9 = root_10();
        var text_21 = only_child(span_9, true);
        template_effect(($0) => set_text(text_21, $0), [
          () => carried(get(turn))
        ]);
        append($$anchor3, span_9);
      };
      var d = user_derived(() => carried(get(turn)));
      add_svelte_meta(() => if_block(node_6, ($$render) => {
        if (get(d)) $$render(consequent_6);
      }), "if", Desk, 182, 27);
    }
    reset(p_4);
    var node_7 = sibling(p_4, 2);
    {
      var consequent_7 = ($$anchor3) => {
        var details = root_11();
        var summary = child(details);
        var text_22 = only_child(summary);
        var pre = sibling(summary, 2);
        var text_23 = only_child(pre, true);
        reset(details);
        template_effect(($0) => {
          set_text(text_22, `${get(turn).meta.provider.name ?? ""} \xB7 ${get(turn).meta.provider.from ?? ""}`);
          set_text(text_23, $0);
        }, [
          () => JSON.stringify(get(turn).meta.provider, null, 2)
        ]);
        append($$anchor3, details);
      };
      add_svelte_meta(() => if_block(node_7, ($$render) => {
        if (get(turn).meta?.provider) $$render(consequent_7);
      }), "if", Desk, 183, 12);
    }
    reset(li_1);
    template_effect(($0, $1) => {
      set_class(li_1, 1, clsx2(get(turn).role), "svelte-1mqr3oq");
      set_text(text_17, strict_equals(get(turn).role, "user") ? "heard" : get(turn).role);
      set_text(text_19, $0);
      set_text(text_20, $1);
    }, [
      () => clock(at(get(turn))),
      () => said(get(turn))
    ]);
    append($$anchor2, li_1);
  }), "each", Desk, 175, 8);
  reset(ol);
  reset(section_3);
  reset(div_10);
  reset(div);
  template_effect(($0) => {
    set_text(text2, mode2.name);
    set_text(text_1, `${mode2.type ?? ""}/${mode2.slug ?? ""}`);
    set_text(text_6, get(listed).length);
    set_text(text_7, get(heard2).length);
    set_text(text_8, get(replies).length);
    set_text(text_9, $0);
  }, [
    () => get(heard2).length ? ago(at(get(heard2).at(-1))) : "\u2014"
  ]);
  append($$anchor, div);
  var $$pop = pop($$exports);
  $$cleanup();
  return $$pop;
}
delegate([
  "click"
]);
var stdin_default = (target, props) => {
  const instance = mount(Desk, {
    target,
    props
  });
  return {
    instance,
    destroy: () => unmount(instance)
  };
};

// .ikiro/reference/whatsapp-agent/step10/harness/main.js
var atom = (value) => {
  const listeners2 = /* @__PURE__ */ new Set();
  return {
    get: () => value,
    set: (next2) => {
      value = next2;
      for (const listener of listeners2) listener(value);
    },
    subscribe: (listener) => {
      listener(value);
      listeners2.add(listener);
      return () => listeners2.delete(listener);
    }
  };
};
var HOUR = 36e5;
var now = Date.now();
var mode = {
  name: "Personal",
  type: "bot",
  slug: "personal",
  call: { settings: async () => ({ user: "localhost", idle: 21600, platforms: ["whatsapp"] }) },
  entities: {
    thread: { find: async () => [] },
    turn: { find: async () => [], subscribe: () => () => {
    } }
  }
};
var thread = (id, hours) => ({ id, mode, word: "personal", createdAt: new Date(now - hours * HOUR) });
var threadA = thread("01a2178a-e4fe-774b-be32-79f4332a11c0", 30);
var threadB = thread("01a2178a-e4fe-774b-be32-79f4332b22d1", 80);
var threadC = thread("01a2178a-e4fe-774b-be32-79f4332c33e2", 200);
var count = 0;
var heard = (held, hours, text2, extra = []) => ({
  id: `turn-${count++}`,
  role: "user",
  thread: held,
  mode,
  createdAt: new Date(now - hours * HOUR),
  parts: [{ type: "text", text: text2 }, ...extra],
  meta: { provider: { platform: "whatsapp", id: `wamid.HBgM${count}`, from: "4915100000000", name: "Finn", at: Math.round((now - hours * HOUR) / 1e3) } }
});
var reply = (held, hours, text2) => ({
  id: `turn-${count++}`,
  role: "assistant",
  thread: held,
  mode,
  createdAt: new Date(now - hours * HOUR),
  parts: [{ type: "text", text: text2 }],
  meta: null
});
var turns = [
  heard(threadC, 200, "what was the name of that ramen place in Kreuzberg?"),
  reply(threadC, 199.99, "Cocolo, on Paul-Lincke-Ufer. It opens at noon."),
  heard(threadB, 80, "remind me what the runtime port is"),
  reply(threadB, 79.99, "The runtime listens on :2501, anima on :1794."),
  heard(threadB, 79, "and summarise this", [{ type: "document", mime: "application/pdf", data: "" }]),
  reply(threadB, 78.99, "It is a two-page lease addendum: the rent rises 3 % from January, and the notice period stays at three months."),
  heard(threadA, 30, "oi"),
  reply(threadA, 29.99, "Oi! Como posso te ajudar?"),
  heard(threadA, 2, "list the modes that are running right now and tell me which one has the most threads"),
  reply(threadA, 1.99, "Five modes are up: runtime, reader, blog, dojo and personal. *dojo* holds the most threads, 23."),
  heard(threadA, 0.1, "thanks")
];
var terminal = {
  $thread: atom(threadA),
  setThread: async (held) => terminal.$thread.set(held),
  client: { runtime: { entities: { thread: { $entities: atom([threadA, threadB, threadC]) }, turn: { $entities: atom(turns) } } } }
};
stdin_default(document.getElementById("mount"), { terminal, buffer: { mode } });
