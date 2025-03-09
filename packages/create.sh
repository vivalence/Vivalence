#!/bin/bash

# viva-install.sh - Create a JavaScript Viva application

set -e

echo "Creating Viva JavaScript application..."

# Root directory
VIVA_ROOT="$(pwd)/viva"
mkdir -p "$VIVA_ROOT"

# Create directory structure
mkdir -p "$VIVA_ROOT/shared/trajectory"
mkdir -p "$VIVA_ROOT/commands"
mkdir -p "$VIVA_ROOT/lib"
mkdir -p "$VIVA_ROOT/locals/docker"
mkdir -p "$VIVA_ROOT/locals/envmanager"
mkdir -p "$VIVA_ROOT/renderer"

# Create README.org
cat > "$VIVA_ROOT/README.org" << 'EOL'
#+TITLE: Viva CLI
#+AUTHOR: Vivalence
#+DATE: 2025

* Viva CLI Tool
  
Viva is a powerful command-line tool for managing daemons, services, and runtimes. It provides a flexible and extensible architecture based on trajectories and signals.

** Core Concepts

*** Trajectory
Trajectory is the core routing system in Viva. It handles different signal types (URL paths, keyboard shortcuts, UI interactions) and directs them to appropriate handlers. Trajectories can be branched to create hierarchical command structures.

*** Signals
Signals are the input events that Viva processes. These can be:
- URL paths (e.g., ~/schema/reset~)
- Keyboard shortcuts (e.g., ~Ctrl+S~)
- UI interactions

*** Handlers
Handlers are functions that process signals and return results. They can:
- Return data
- Create UI components
- Populate sub-trajectories for further navigation
- Store data in file buffers

*** Context
Each signal execution happens within a context. The context contains:
- Signal information
- Parameters extracted from the path
- UI components
- Response data
- File buffers
- Sub-trajectories for navigation

** Project Structure

- ~shared/~ - Core libraries and utilities
  - ~trajectory/~ - Signal routing and handling system
- ~commands/~ - Command implementations
- ~lib/~ - Core utilities
- ~locals/~ - Local environment tools
- ~renderer/~ - UI rendering components

** Getting Started

To run Viva:

#+begin_src sh
cd viva
deno task start
#+end_src

Without arguments, Viva presents an interactive menu. You can also run specific commands:

#+begin_src sh
deno task viva schema reset
deno task viva schema print
deno task viva schema deploy
#+end_src

Alternatively, you can use URL-style paths:

#+begin_src sh
deno task viva /schema/reset
#+end_src

** Creating Commands

Commands are created by attaching handlers to trajectories:

#+begin_src javascript
// Create a branch for related commands
const myTrajectory = viva.trajectory.branch('/my-command');

// Add middleware for shared functionality
myTrajectory.use(async (ctx, next) => {
  ctx.myTools = {
    // Add shared tools here
  };
  await next();
});

// Register a handler
myTrajectory.url('/action', async (ctx) => {
  // Implement your command
  return {
    status: "success",
    message: "Command executed successfully"
  };
});
#+end_src

** Advanced Features

*** File Buffers
Handlers can write to buffer for file-based output:

#+begin_src javascript
ctx.buffer = new TextEncoder().encode("Output content");
#+end_src

*** UI Components
Create interactive UI components:

#+begin_src javascript
ctx.ui.add({
  type: "menu",
  title: "My Menu",
  items: [
    { id: "item1", label: "First Item", path: "/my-path" }
  ]
});
#+end_src

*** Keyboard Shortcuts
Register keyboard shortcuts:

#+begin_src javascript
trajectory.key('Ctrl+M', async (ctx) => {
  // Handle keyboard shortcut
});
#+end_src

** License

Copyright (c) 2025 Vivalence
EOL

# Create deno.jsonc
cat > "$VIVA_ROOT/deno.jsonc" << 'EOL'
{
  "tasks": {
    "start": "deno run --allow-env --allow-read --allow-write --allow-net --allow-run mod.js",
    "viva": "deno run --allow-env --allow-read --allow-write --allow-net --allow-run mod.js",
    "dev": "deno run --watch --allow-env --allow-read --allow-write --allow-net --allow-run mod.js"
  },
  "imports": {
    "@std/": "https://deno.land/std@0.208.0/",
    "@cliffy/command": "jsr:@cliffy/command@1.0.0-rc.7",
    "@cliffy/ansi": "jsr:@cliffy/ansi@1.0.0-rc.7",
    "@cliffy/table": "jsr:@cliffy/table@1.0.0-rc.7",
    "@cliffy/prompt": "jsr:@cliffy/prompt@1.0.0-rc.7"
  }
}
EOL

# Create cli-entry.js
cat > "$VIVA_ROOT/cli-entry.js" << 'EOL'
#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

try {
  const process = Deno.run({
    cmd: [
      "deno",
      "task",
      "-q",
      "--config",
      Deno.args.shift() + "/deno.jsonc",
      `viva`,
      ...Deno.args,
    ],
  });
  await process.status();
} catch (error) {
  console.error("[ERROR] in viva execution:");
  console.error(error);
}
EOL

# Create mod.js (Main entry point)
cat > "$VIVA_ROOT/mod.js" << 'EOL'
// mod.js - Main module with boot sequence

import { colors } from "@cliffy/ansi/colors";

// Core components
import { createTrajectory } from "./shared/trajectory/index.js";
import { createContext } from "./shared/trajectory/context.js";
import { detectSignalType } from "./shared/trajectory/signal.js";

// System utilities
import boot from "./lib/boot.js";
import captureProcess from "./lib/process.js";
import locals from "./locals/index.js";
import commands from "./commands/index.js";
import { renderMenu } from "./renderer/cli.js";

// Simple config implementation
const config = {
  services: {
    database: {
      name: "Database Service",
      connectionString: "postgres://postgres:postgres@localhost:5432/viva"
    }
  },
  env: {
    get: (key) => Deno.env.get(key) || '',
    set: (key, value) => {}
  }
};

const start = performance.now();

const ticker = (name) => (viva) => {
  console.log(colors.blue(`[PERF] init to [${name}] in [${performance.now() - start}ms]`));
  return viva;
};

// Initialize viva object
const viva = {
  process: null,
  input: Deno.args,
  services: config.services,
  registry: {
    load: async (id) => ({ manifest: { slug: id.split('/').pop() } }),
    loadMany: async (ids) => ids.map(id => ({ manifest: { slug: id.split('/').pop() } }))
  },
  locals: {},
  trajectory: createTrajectory(),
  _activeContexts: new Map(),
};

// Create call function for executing signals
viva.call = async (signal, params = {}) => {
  // Convert string signals to objects
  const signalObj = typeof signal === 'string' 
    ? { type: detectSignalType(signal), value: signal }
    : signal;
  
  // Create or use existing context
  const context = params.context || createContext(signalObj, { ...params, viva });
  
  // Execute signal
  return await viva.trajectory.execute(signalObj, context);
};

// Process input from command line
async function processInput(viva) {
  // Skip if no input and render interactive menu
  if (viva.input.length === 0) {
    await renderMenu(viva);
    return viva;
  }
  
  // Convert args to signal
  let signal;
  const input = viva.input.join(' ');
  
  // Determine signal type
  if (input.startsWith('/')) {
    signal = { type: 'url', value: input };
  } else if (input.startsWith('key:')) {
    signal = { type: 'key', value: input.substring(4) };
  } else {
    // Convert command format to URL path
    signal = { type: 'url', value: `/${viva.input.join('/')}` };
  }
  
  try {
    // Execute signal
    const result = await viva.call(signal);
    
    // Handle result
    if (result.status === 'error') {
      console.error(colors.red(`Error: ${result.message}`));
    } else {
      // Print buffer if available
      if (result.buffer && result.buffer.length > 0) {
        const text = new TextDecoder().decode(result.buffer);
        console.log(text);
      } else if (result.data) {
        if (typeof result.data === 'string') {
          console.log(result.data);
        } else {
          console.log(JSON.stringify(result.data, null, 2));
        }
      }
    }
  } catch (error) {
    console.error(colors.red("Unhandled error:"), error);
  }
  
  return viva;
}

// Mount registry function for compatibility
async function mountRegistry(viva) {
  // Registry is already defined in viva object
  return viva;
}

// Functional composition boot sequence
(async (viva) =>
  await [
    ticker("init"),
    captureProcess,
    mountRegistry,
    locals,
    boot,
    commands,
    processInput,
    ticker("complete"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))(viva);
EOL

# Create shared/trajectory/index.js
cat > "$VIVA_ROOT/shared/trajectory/index.js" << 'EOL'
// shared/trajectory/index.js - Trajectory implementation

import { detectSignalType } from "./signal.js";
import { matchUrlPattern, createContext } from "./context.js";

export class Trajectory {
  constructor(path = "/") {
    this.path = path;
    this.handlers = new Map();
    this.branches = new Map();
    this.middlewares = {
      pre: [],
      main: [],
      post: []
    };
  }
  
  // URL signal handler registration
  url(path, handler) {
    const signalKey = `url:${path}`;
    this.handlers.set(signalKey, handler);
    return this;
  }
  
  // Keyboard signal handler registration
  key(sequence, handler) {
    const signalKey = `key:${sequence}`;
    this.handlers.set(signalKey, handler);
    return this;
  }
  
  // UI signal handler registration
  ui(elementId, handler) {
    const signalKey = `ui:${elementId}`;
    this.handlers.set(signalKey, handler);
    return this;
  }
  
  // Generic open method for any signal type
  open(signal, handler) {
    const signalObj = typeof signal === 'string' 
      ? { type: detectSignalType(signal), value: signal }
      : signal;
    
    const signalKey = `${signalObj.type}:${signalObj.value}`;
    this.handlers.set(signalKey, handler);
    return this;
  }
  
  // Create a new branch in the trajectory tree
  branch(path = "") {
    // For empty path, return this instance
    if (!path) return this;
    
    if (!this.branches.has(path)) {
      const branch = new Trajectory(path);
      this.branches.set(path, branch);
    }
    return this.branches.get(path);
  }
  
  // Middleware registration methods
  pre(middleware) {
    this.middlewares.pre.push(middleware);
    return this;
  }
  
  use(middleware) {
    this.middlewares.main.push(middleware);
    return this;
  }
  
  post(middleware) {
    this.middlewares.post.push(middleware);
    return this;
  }
  
  // Find a handler for the given signal
  match(signal) {
    const { type, value } = signal;
    const signalKey = `${type}:${value}`;
    
    // Direct match
    if (this.handlers.has(signalKey)) {
      return {
        handler: this.handlers.get(signalKey),
        params: {}
      };
    }
    
    // URL path parameter matching
    if (type === 'url') {
      for (const [key, handler] of this.handlers.entries()) {
        if (!key.startsWith(`url:`)) continue;
        
        const pattern = key.substring(4); // Remove 'url:' prefix
        const params = matchUrlPattern(value, pattern);
        
        if (params) {
          return { handler, params };
        }
      }
    }
    
    // Check branches for URL paths
    if (type === 'url') {
      for (const [branchPath, branch] of this.branches) {
        if (value.startsWith(branchPath)) {
          // For URL paths, adjust the value to be relative to the branch
          const relativePath = value.substring(branchPath.length) || '/';
          const branchSignal = { type, value: relativePath };
          
          const match = branch.match(branchSignal);
          if (match) return match;
        }
      }
    }
    
    // Check branches for other signal types
    for (const branch of this.branches.values()) {
      const match = branch.match(signal);
      if (match) return match;
    }
    
    return null;
  }
  
  // Get all available paths at this level and from branches
  getAvailablePaths() {
    const paths = [];
    
    // Add direct URL handlers
    for (const [key, _] of this.handlers.entries()) {
      if (key.startsWith(`url:`)) {
        const path = key.substring(4); // Remove 'url:' prefix
        paths.push(path);
      }
    }
    
    // Add branch paths
    for (const [branchPath, _] of this.branches) {
      paths.push(branchPath);
    }
    
    return paths;
  }
  
  // Create an initial context for this trajectory
  createInitialContext() {
    return createContext({ type: 'url', value: '/' }, { trajectory: this });
  }
  
  // Execute a signal
  async execute(signal, context) {
    const signalObj = typeof signal === 'string' 
      ? { type: detectSignalType(signal), value: signal }
      : signal;
    
    const match = this.match(signalObj);
    
    if (!match) {
      return {
        status: 'error',
        message: `No handler found for signal: ${signalObj.type}:${signalObj.value}`
      };
    }
    
    const { handler, params } = match;
    
    // Update context with match parameters
    if (context) {
      context.params = { ...(context.params || {}), ...params };
    }
    
    try {
      // Make sure context has trajectory
      if (context && !context.trajectory) {
        context.trajectory = new Trajectory();
      }
      
      // Apply middlewares and execute handler
      const ctx = context;
      const result = await this._applyMiddlewares(handler, ctx);
      
      // Format the response based on signal type
      if (signalObj.type === 'url' && ctx.response) {
        return {
          status: 'success',
          data: ctx.response.body || result,
          context: ctx,
          contextId: ctx.id,
          release: ctx.release,
          buffer: ctx.buffer
        };
      }
      
      return {
        status: 'success',
        data: result,
        ui: ctx.ui?.elements,
        context: ctx,
        contextId: ctx.id,
        release: ctx.release,
        buffer: ctx.buffer
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        error
      };
    }
  }
  
  // Apply middleware chain
  async _applyMiddlewares(handler, context) {
    const middlewares = [
      ...this.middlewares.pre,
      ...this.middlewares.main,
      ...this.middlewares.post
    ];
    
    let index = 0;
    
    const next = async () => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return await middleware(context, next);
      } else {
        return await handler(context);
      }
    };
    
    return next();
  }
  
  // Create a callable function for this trajectory
  createCall() {
    return (signal, context = {}) => this.execute(signal, context);
  }
  
  // Compile this trajectory and its branches
  compile() {
    // This would be more complex in a real implementation
    return async (context) => {
      return await this.execute(context.signal, context);
    };
  }
}

// Factory function for creating trajectories
export function createTrajectory(options) {
  return new Trajectory(options?.path);
}
EOL

# Create shared/trajectory/signal.js
cat > "$VIVA_ROOT/shared/trajectory/signal.js" << 'EOL'
// shared/trajectory/signal.js - Signal types and utilities

/**
 * Creates a signal object
 */
export function createSignal(type, value, payload = {}) {
  return { type, value, payload };
}

/**
 * URL signal factory
 */
export function createUrlSignal(path, payload = {}) {
  return createSignal('url', path, payload);
}

/**
 * Key signal factory
 */
export function createKeySignal(sequence, payload = {}) {
  return createSignal('key', sequence, payload);
}

/**
 * UI signal factory
 */
export function createUiSignal(elementId, payload = {}) {
  return createSignal('ui', elementId, payload);
}

/**
 * Detects signal type from string
 */
export function detectSignalType(signal) {
  if (typeof signal !== 'string') return 'ui';
  if (signal.startsWith('/')) return 'url';
  if (signal.includes('+') || signal.match(/Ctrl-|Alt-|Shift-/)) return 'key';
  return 'ui';
}

/**
 * Normalizes key sequence (Ctrl-X to Ctrl+X)
 */
export function normalizeKeySequence(sequence) {
  return sequence.replace(/-/g, '+');
}
EOL

# Create shared/trajectory/context.js
cat > "$VIVA_ROOT/shared/trajectory/context.js" << 'EOL'
// shared/trajectory/context.js - Context creation and management

import { detectSignalType } from "./signal.js";
import { Trajectory } from "./index.js";

/**
 * Create execution context for a signal
 */
export function createContext(signal, initialData = {}) {
  const signalObj = typeof signal === 'string' 
    ? { type: detectSignalType(signal), value: signal }
    : signal;
  
  const uiManager = {
    elements: [],
    add: (element) => {
      uiManager.elements.push(element);
      return uiManager.elements.length - 1;
    },
    update: (index, element) => {
      uiManager.elements[index] = element;
    },
    clear: () => {
      uiManager.elements = [];
    }
  };
  
  const ctx = {
    ...initialData,
    signal: signalObj,
    params: {},
    id: generateContextId(),
    release: false,
    ui: uiManager,
    // Create a sub-trajectory for this context if not provided
    trajectory: initialData.trajectory || new Trajectory(),
    // Add buffer for file-based responses
    buffer: new Uint8Array(),
    // Store previous response for request chaining
    prevResponse: initialData.prevResponse || null
  };
  
  // Add response object for URL signals
  if (signalObj.type === 'url') {
    ctx.response = {
      body: {},
      status: 200,
      headers: new Map()
    };
    
    // Add request object if we have previous response
    if (initialData.prevResponse) {
      ctx.request = {
        body: initialData.prevResponse,
        method: "POST",
        headers: new Map()
      };
    }
  }
  
  return ctx;
}

/**
 * Match URL pattern with parameters
 * Examples:
 *   /user/:id matches /user/123 with params {id: '123'}
 *   /files/* matches /files/docs/report.pdf with params {'*': 'docs/report.pdf'}
 */
export function matchUrlPattern(url, pattern) {
  const urlSegments = url.split('/').filter(Boolean);
  const patternSegments = pattern.split('/').filter(Boolean);
  
  // Handle root path
  if (pattern === '/' && url === '/') return {};
  
  // Check if pattern has a wildcard at the end
  const hasWildcard = patternSegments.length > 0 && 
                       patternSegments[patternSegments.length - 1] === '*';
  
  // For non-wildcard patterns, segment count must match
  if (!hasWildcard && urlSegments.length !== patternSegments.length) return null;
  
  // For wildcard patterns, url must have at least as many segments as pattern (minus the wildcard)
  if (hasWildcard && urlSegments.length < patternSegments.length - 1) return null;
  
  const params = {};
  
  for (let i = 0; i < patternSegments.length; i++) {
    // Stop processing at wildcard
    if (patternSegments[i] === '*') {
      params['*'] = urlSegments.slice(i).join('/');
      break;
    }
    
    // If we've run out of URL segments, pattern doesn't match
    if (i >= urlSegments.length) return null;
    
    const segment = patternSegments[i];
    
    if (segment.startsWith(':')) {
      // Parameter segment
      const paramName = segment.substring(1);
      params[paramName] = urlSegments[i];
    } else if (segment !== urlSegments[i]) {
      // Literal segments don't match
      return null;
    }
  }
  
  return params;
}

/**
 * Generate a unique context ID
 */
function generateContextId() {
  return `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
EOL

# Create shared/trajectory/handler.js
cat > "$VIVA_ROOT/shared/trajectory/handler.js" << 'EOL'
// shared/trajectory/handler.js - Handler implementation

/**
 * Create a handler with metadata for self-documentation
 */
export function createHandler(options) {
  const {
    execute,
    description = "",
    examples = [],
    params = {},
    returns = {},
    type = "generic",
    autoRelease = true
  } = options;
  
  const handler = async (context) => {
    const result = await execute(context);
    
    // Auto-release by default
    if (autoRelease && context.release === undefined) {
      context.release = true;
    }
    
    // For URL signals, set response body
    if (context.signal?.type === 'url' && context.response) {
      context.response.body = result;
    }
    
    return result;
  };
  
  // Attach metadata for self-documentation
  handler.meta = {
    description,
    examples,
    params,
    returns,
    type
  };
  
  return handler;
}

/**
 * Helper for URL handlers
 */
export function createUrlHandler(options) {
  return createHandler({
    ...options,
    type: "url"
  });
}

/**
 * Helper for keyboard handlers
 */
export function createKeyHandler(options) {
  return createHandler({
    ...options,
    type: "key",
    // Keyboard handlers often need to remain active for interaction
    autoRelease: options.autoRelease ?? false
  });
}

/**
 * Helper for UI handlers
 */
export function createUiHandler(options) {
  return createHandler({
    ...options,
    type: "ui"
  });
}
EOL

# Create lib/process.js
cat > "$VIVA_ROOT/lib/process.js" << 'EOL'
// lib/process.js - Process management

import { colors } from "@cliffy/ansi/colors";

export default async function captureProcess(viva) {
  function doShutdown(signal, opts = {}) {
    if (signal) {
      console.log(colors.rgb24(`Viva el fin. ${signal.toString()}`, 0x00fffb));
    }
    Deno.exit(0);
  }

  viva.process = { doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, viva.process.doShutdown);
  }

  return viva;
}
EOL

# Create lib/boot.js
cat > "$VIVA_ROOT/lib/boot.js" << 'EOL'
// lib/boot.js - Boot process

import { colors } from "@cliffy/ansi/colors";

export default async function boot(viva) {
  console.log(colors.blue("Booting Viva..."));
  
  try {
    // Simulate database initialization
    console.log(colors.blue("Starting database services..."));
    
    // Mock successful service start
    console.log(colors.green("✓ Services started successfully"));
    
    // Set environment variables
    viva.config = {
      isDev: true,
      services: viva.services
    };
    
    console.log(colors.green("✓ Viva boot complete!"));
  } catch (error) {
    console.error(colors.red("Boot error:"), error);
  }
  
  return viva;
}
EOL

# Create locals/index.js
cat > "$VIVA_ROOT/locals/index.js" << 'EOL'
// locals/index.js - Local tools loader

// Mock implementations for local tools
const docker = {
  ps: async (all = true) => {
    return { ok: true, containers: [] };
  }
};

const compose = {
  up: async (options = {}) => {
    return { ok: true };
  },
  down: async (options = {}) => {
    return { ok: true };
  }
};

const env = {
  fromEnv: async (path, env = {}) => {
    return path.replace(".env.source", ".env");
  },
  fromExampleEnv: async (path) => {
    return path.replace(".env.example", ".env");
  }
};

export default function loadLocals(viva) {
  viva.locals = {
    env,
    docker,
    compose
  };
  
  return viva;
}
EOL

# Create commands/index.js (Updated)
cat > "$VIVA_ROOT/commands/index.js" << 'EOL'
// commands/index.js - Command loader

import { colors } from "@cliffy/ansi/colors";
import { createHandler } from "../shared/trajectory/handler.js";

// Import command modules
import loadSchemaCommands from "./schema.js";

// Middleware for base commands
const baseMiddleware = async (ctx, next) => {
  ctx.base = {
    version: "0.1.0",
    timestamp: new Date().toISOString()
  };
  await next();
};

// Root handler
const rootHandler = createHandler({
  description: "Root command handler",
  execute: async (ctx) => {
    // First, populate sub-trajectory with navigation options
    ctx.trajectory.url('/schema', async (subCtx) => {
      // Add UI for schema options
      subCtx.ui.add({
        type: "menu",
        title: "Schema Management",
        items: [
          { id: "reset", label: "Reset Schema", path: "/schema/reset" },
          { id: "print", label: "Print Schema", path: "/schema/print" },
          { id: "deploy", label: "Deploy Schema", path: "/schema/deploy" }
        ]
      });
      
      return {
        commands: ["reset", "print", "deploy"]
      };
    });
    
    // Add placeholder paths for future commands
    ctx.trajectory.url('/services', async () => ({ status: "Not implemented yet" }));
    ctx.trajectory.url('/runtimes', async () => ({ status: "Not implemented yet" }));
    ctx.trajectory.url('/help', async () => ({ status: "Help system" }));
    
    // Add UI for current view
    ctx.ui.add({
      type: "menu",
      title: "Viva CLI",
      items: [
        { id: "schema", label: "Schema Management", path: "/schema" },
        { id: "services", label: "Service Management", path: "/services" },
        { id: "runtimes", label: "Runtime Management", path: "/runtimes" },
        { id: "help", label: "Help", path: "/help" }
      ]
    });
    
    // Return data for this invocation
    return {
      name: "Viva CLI",
      version: ctx.base?.version || "0.1.0"
    };
  }
});

// Add keyboard shortcuts
const keyHandlers = {
  'Ctrl+S': createHandler({
    description: "Schema management shortcut",
    execute: async (ctx) => {
      // Create a signal to redirect to schema path
      return {
        redirect: {
          type: 'url',
          value: '/schema'
        }
      };
    }
  }),
  
  'Ctrl+H': createHandler({
    description: "Help shortcut",
    execute: async (ctx) => {
      return {
        message: "Help system accessed via keyboard shortcut",
        commands: ["schema", "services", "runtimes", "help"]
      };
    }
  })
};

export default async function loadCommands(viva) {
  console.log(colors.blue("Loading commands..."));
  
  // Apply base middleware to main trajectory
  viva.trajectory.use(baseMiddleware);
  
  // Register URL handlers
  viva.trajectory.url('/', rootHandler);
  
  // Register keyboard shortcuts
  for (const [key, handler] of Object.entries(keyHandlers)) {
    viva.trajectory.key(key, handler);
  }
  
  // Load domain-specific command modules using branching
  await loadSchemaCommands(viva);
  
  return viva;
}
EOL

# Create commands/schema.js
cat > "$VIVA_ROOT/commands/schema.js" << 'EOL'
// commands/schema.js - Schema commands

import { colors } from "@cliffy/ansi/colors";
import { createHandler } from "../shared/trajectory/handler.js";

// Schema tools middleware
const schemaToolsMiddleware = async (ctx, next) => {
  // Add schema tools to context
  ctx.schemaTools = {
    // Mock schema validation function
    validateSchema: (schema) => {
      console.log(colors.blue("Validating schema..."));
      return true;
    },
    // Mock schema migration executor
    runMigration: async () => {
      console.log(colors.blue("Running migration..."));
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }
  };
  
  await next();
};

// Schema reset handler
const schemaResetHandler = createHandler({
  description: "Reset database schema",
  execute: async (ctx) => {
    console.log(colors.yellow("Resetting schema..."));
    
    // Create a file buffer for output
    const logOutput = [];
    
    // Simulate schema reset steps
    logOutput.push("1. Deleting migration table...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logOutput.push("2. Deleting migration folder...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logOutput.push("✅ Schema reset complete");
    
    // Set buffer in context
    ctx.buffer = new TextEncoder().encode(logOutput.join("\n"));
    
    return {
      status: "success",
      message: "Schema has been reset successfully",
      steps: logOutput
    };
  }
});

// Schema print handler
const schemaPrintHandler = createHandler({
  description: "Print database schema",
  execute: async (ctx) => {
    console.log(colors.blue("Fetching schema..."));
    
    // Simulate schema loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock schema
    const schema = {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "uuid", primary: true },
            { name: "name", type: "varchar" },
            { name: "email", type: "varchar" },
            { name: "created_at", type: "timestamp" }
          ]
        },
        {
          name: "posts",
          columns: [
            { name: "id", type: "uuid", primary: true },
            { name: "user_id", type: "uuid", foreign: "users.id" },
            { name: "title", type: "varchar" },
            { name: "content", type: "text" },
            { name: "created_at", type: "timestamp" }
          ]
        }
      ]
    };
    
    // Set buffer in context
    ctx.buffer = new TextEncoder().encode(JSON.stringify(schema, null, 2));
    
    return schema;
  }
});

// Schema deploy handler
const schemaDeployHandler = createHandler({
  description: "Deploy schema to database",
  execute: async (ctx) => {
    console.log(colors.yellow("Deploying schema..."));
    
    // Use schema tools from middleware
    const validationResult = ctx.schemaTools?.validateSchema({}) || false;
    if (!validationResult) {
      return {
        status: "error",
        message: "Schema validation failed"
      };
    }
    
    // Simulate deployment steps
    console.log(colors.blue("1. Running migrations..."));
    await ctx.schemaTools?.runMigration();
    
    console.log(colors.green("✅ Schema deployed successfully"));
    
    return {
      status: "success",
      message: "Schema has been deployed successfully",
      migrationsRun: 2
    };
  }
});

// Main schema handler
const schemaHandler = createHandler({
  description: "Schema management commands",
  execute: async (ctx) => {
    // Add UI for schema options
    ctx.ui.add({
      type: "menu",
      title: "Schema Management",
      items: [
        { id: "reset", label: "Reset Schema", path: "/schema/reset" },
        { id: "print", label: "Print Schema", path: "/schema/print" },
        { id: "deploy", label: "Deploy Schema", path: "/schema/deploy" }
      ]
    });
    
    return {
      commands: ["reset", "print", "deploy"]
    };
  }
});

export default async function loadSchemaCommands(viva) {
  console.log(colors.blue("  Loading schema commands..."));
  
  // Create schema branch with middleware
  const schemaTrajectory = viva.trajectory.branch('/schema');
  schemaTrajectory.use(schemaToolsMiddleware);
  
  // Register schema handlers
  schemaTrajectory.url('/', schemaHandler);
  schemaTrajectory.url('/reset', schemaResetHandler);
  schemaTrajectory.url('/print', schemaPrintHandler);
  schemaTrajectory.url('/deploy', schemaDeployHandler);
  
  // Add keyboard shortcuts for schema commands
  viva.trajectory.key('Ctrl+S R', createHandler({
    description: "Quick schema reset",
    execute: async (ctx) => {
      return schemaResetHandler.execute(ctx);
    }
  }));
  
  return viva;
}
EOL

# Create renderer/renderer.js
cat > "$VIVA_ROOT/renderer/renderer.js" << 'EOL'
// renderer/renderer.js - Abstract renderer

export class BaseRenderer {
  renderComponent(component) {
    console.log("Render component not implemented");
  }
  
  async renderMenu(menu) {
    console.log("Render menu not implemented");
    return null;
  }
  
  async renderTrajectory(context) {
    console.log("Render trajectory not implemented");
    return null;
  }
  
  renderError(message) {
    console.error(message);
  }
  
  renderSuccess(message) {
    console.log(message);
  }
  
  renderData(data) {
    if (typeof data === 'string') {
      console.log(data);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}
EOL

# Create renderer/components.js
cat > "$VIVA_ROOT/renderer/components.js" << 'EOL'
// renderer/components.js - Universal UI components

export const ComponentType = {
  ROW: 'row',
  COLUMN: 'column',
  LIST: 'list',
  GRID: 'grid',
  TABLE: 'table',
  FLOW: 'flow',
  BUTTON: 'button',
  INPUT: 'input',
  TEXT: 'text',
  FLAG: 'flag',
  MENU: 'menu',
  DIVIDER: 'divider'
};

export function createMenu(title, items) {
  return {
    type: ComponentType.MENU,
    title,
    items: items.map(item => ({
      id: item.id,
      label: item.label,
      path: item.path || `/${item.id}`
    }))
  };
}

export function createRow(children) {
  return {
    type: ComponentType.ROW,
    children
  };
}

export function createColumn(children) {
  return {
    type: ComponentType.COLUMN,
    children
  };
}

export function createButton(label, action) {
  return {
    type: ComponentType.BUTTON,
    label,
    value: action
  };
}

export function createText(text) {
  return {
    type: ComponentType.TEXT,
    value: text
  };
}
EOL

# Create renderer/cli.js
cat > "$VIVA_ROOT/renderer/cli.js" << 'EOL'
// renderer/cli.js - CLI-specific rendering with Cliffy

import { colors } from "@cliffy/ansi/colors";
import { Select } from "@cliffy/prompt";
import { BaseRenderer } from "./renderer.js";
import { ComponentType } from "./components.js";

class CliRenderer extends BaseRenderer {
  renderComponent(component) {
    switch (component.type) {
      case ComponentType.MENU:
        this.renderCliMenu(component);
        break;
      case ComponentType.TEXT:
        console.log(component.value);
        break;
      case ComponentType.BUTTON:
        console.log(`[${component.label}]`);
        break;
      default:
        console.log(`Unsupported component type: ${component.type}`);
    }
  }
  
  renderCliMenu(menu) {
    if (menu.title) {
      console.log(colors.bold(colors.blue(`\n=== ${menu.title} ===\n`)));
    }
    
    for (let i = 0; i < menu.items.length; i++) {
      const item = menu.items[i];
      if (item.type === 'divider') {
        console.log('----------------');
      } else {
        console.log(`${colors.green(`${i + 1}.`)} ${item.label}`);
      }
    }
    
    console.log('');
  }
  
  async renderMenu(menu) {
    try {
      const options = menu.items
        .filter(item => item.type !== 'divider')
        .map(item => ({
          name: item.label,
          value: item.path || item.id
        }));
      
      if (menu.title) {
        console.log(colors.bold(colors.blue(`\n=== ${menu.title} ===\n`)));
      }
      
      const selected = await Select.prompt({
        message: "Select an option:",
        options
      });
      
      // If the selection is a path, return a URL signal
      if (selected.startsWith('/')) {
        return {
          type: 'url',
          value: selected
        };
      }
      
      // Otherwise return a UI signal
      return {
        type: 'ui',
        value: selected
      };
    } catch (error) {
      console.error(colors.red("Error rendering menu:"), error);
      
      // Return a signal to go to the root
      return {
        type: 'url',
        value: '/'
      };
    }
  }
  
  async renderTrajectory(context) {
    // Get available paths from the context trajectory
    const availablePaths = context.trajectory.getAvailablePaths();
    
    // Create menu items from available paths
    const menuItems = availablePaths.map(path => {
      // Create readable label from path
      const label = path === '/' 
        ? 'Home' 
        : path.split('/').filter(Boolean).pop() || '';
      
      return {
        id: path,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        path: path
      };
    });
    
    // If no paths found but we have UI elements, render the first menu
    if (menuItems.length === 0 && context.ui.elements.length > 0) {
      const menuComponent = context.ui.elements.find(
        c => c.type === ComponentType.MENU
      );
      
      if (menuComponent) {
        return this.renderMenu(menuComponent);
      }
    }
    
    // Create and render menu
    const menu = {
      type: ComponentType.MENU,
      title: "Available Commands",
      items: menuItems
    };
    
    return this.renderMenu(menu);
  }
  
  renderData(data) {
    if (typeof data === 'string') {
      console.log(data);
    } else if (Array.isArray(data)) {
      for (const item of data) {
        console.log(`- ${item}`);
      }
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
  
  renderError(message) {
    console.error(colors.red(`Error: ${message}`));
  }
  
  renderSuccess(message) {
    console.log(colors.green(`✅ ${message}`));
  }
}

// Create singleton renderer
const renderer = new CliRenderer();

// Render menu and process selection
export async function renderMenu(viva) {
  try {
    // Create initial context
    let context = viva.trajectory.createInitialContext();
    
    // Root path execution to get initial options
    const result = await viva.call({ type: 'url', value: '/' }, { context });
    
    // Store context for further calls
    context = result.context;
    
    // Process the result
    await processResult(viva, result, context);
  } catch (error) {
    console.error(colors.red("Error rendering menu:"), error);
  }
}

// Process a handler result, potentially continuing navigation
async function processResult(viva, result, context) {
  if (result.status === 'error') {
    renderer.renderError(result.message || 'An error occurred');
    return;
  }
  
  // Render UI elements if available
  if (result.ui && result.ui.length > 0) {
    for (const component of result.ui) {
      renderer.renderComponent(component);
    }
  }
  
  // Render data if available
  if (result.data) {
    renderer.renderData(result.data);
  }
  
  // Render buffer if available
  if (result.buffer && result.buffer.length > 0) {
    const text = new TextDecoder().decode(result.buffer);
    console.log(text);
  }
  
  // If redirected, follow the redirect
  if (result.redirect) {
    const redirectResult = await viva.call(result.redirect, { 
      context,
      prevResponse: result.data 
    });
    await processResult(viva, redirectResult, redirectResult.context);
    return;
  }
  
  // Check if we need to render trajectory (context maintained navigation)
  if (!result.release) {
    // Allow user to select next action from context trajectory
    const signal = await renderer.renderTrajectory(context);
    
    // Execute the selected signal
    const nextResult = await viva.call(signal, { 
      context,
      prevResponse: result.data 
    });
    
    // Process the new result
    await processResult(viva, nextResult, nextResult.context);
  }
}

export { renderer };
EOL

# Make cli-entry.js executable
chmod +x "$VIVA_ROOT/cli-entry.js"

echo "Viva JavaScript app created successfully at: $VIVA_ROOT"
echo "To run the app, navigate to the viva directory and run:"
echo "  cd $VIVA_ROOT"
echo "  deno task start"
echo ""
echo "Available commands:"
echo "  viva schema reset    - Reset the database schema"
echo "  viva schema print    - Print the database schema as JSON"
echo "  viva schema deploy   - Deploy the schema to the database"
echo "  viva                 - Show interactive menu"
