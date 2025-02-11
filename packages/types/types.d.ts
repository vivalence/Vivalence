import type { SupabaseClient } from "@supabase/supabase-js";
import type { Application, Context, Middleware, Router } from "oak";
import type { SecureCookieMap } from "@oak/commons/cookie_map";
export type { DeepWritable, Writable } from "ts-essentials";

// This is a manifest file for runtimes, simple object / blueprint
// export type Runtime = {
//   modules: Record<string, unknown>;
//   services: Record<string, unknown>;
//   manifest: Record<string, unknown>;
//   statics: Record<string, unknown>;
// };

export type Services = Record<string, Service> & {
  supabase?: SupabaseClient;
  identity?: any;
};

export interface Service<C = any, S = any> {
  manifest: ServiceManifest;
  client: (runtime: Runtime) => C;
  service: () => S;
}

export type RuntimeDescription = Partial<Runtime> & {
  modules?: {
    Domain?: Runtime;
    Ontology?: Runtime;
    Curricula?: Runtime[];
    Games?: Runtime[];
    Tactics?: Runtime[];
    Strategies?: Runtime[];
  };

  Services?: Services;
};

export type Runtime = {
  "#symbol": symbol;

  statics: Record<string, any>;
  manifest: Manifest;

  entities?: Record<string, any>;
  locals?: RuntimeLocals;
  router?: RouterWithExtensions;
  bus?: EventBus;
  call?: CallFunction;

  Modules: Modules;
  Runtime: Module;

  // Services?: Services;
  // services?: Record<string, string | string[]>;
  // schema?: Record<string, unknown>;
};

export interface Modules {
  domain?: RuntimeModule;
  ontology?: RuntimeModule;
  curricula?: RuntimeModule[];
  games?: RuntimeModule[];
  tactics?: RuntimeModule[];
  strategies?: RuntimeModule[];
}
//
//
//

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type ModuleInstaller = Writable<Module>;

/**
 * Type definitions for Daemon server
 * @package @vivalence/daemon
 */

// User Types

export interface User {
  id: string;
  roles: UserRole[];
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "ADMIN" | "USER" | "GUEST";

// Core Types
// DAEMON
export interface Daemon {
  aperture: Aperture | null;
  runtimes: Map<symbol, any>;
  router: RouterWithExtensions | null;
  registry: Registry | null;
  server: any; // Oak server instance
  services: Services;
  abort?: AbortController;
  app?: Application;
  process?: any;
}

export interface ServiceManifest {
  type: "service";
  slug: string;
  name: string;
}

/**
 * Runtime local dependencies and utilities
 */
export interface RuntimeLocals {
  validate?: () => unknown;
  _isLegacy?: boolean;
  getUser?: () => Promise<User>;
}

export type UnknownObject = Record<string, unknown>;

export interface Entity {
  // [string]: Record<string, any>;
}

export interface ModuleBootRuntime {}
export interface Module {
  manifest: Manifest;
  Module: Module;
  Entity: any;
  entity: any;

  router: RouterWithExtensions;
  bus: EventBus;
  statics: UnknownObject;
  bundle: string;
  curriculum: Curriculum | ((runtime: Runtime, module: Module) => Promise<Curriculum>);
  evaluate: RouteHandler;
  install: InstallFunction;
  provision: RouteHandler;
  boot: BootFunction;
  schema: UnknownObject;
  default?: Module;
  data?: UnknownObject;

  modules: Modules;
  services?: Record<string, string | string[]>;
  Services?: Services;
  locals?: RuntimeLocals;
}

export type RuntimeModule = Pick<Runtime, "router" | "bus" | "manifest" | "Module">;

export interface Manifest {
  id?: string;
  type: ModuleType;
  slug: string;
  name: string;
  version: string;
  url?: string;
  description?: string;
  installed?: boolean;
  icon?: string;
}
export type ModuleType =
  | "runtime"
  | "game"
  | "tactic"
  | "strategy"
  | "curriculum"
  | "domain"
  | "ontology";

// Curriculum
export interface Curriculum {
  units?: CurriculumResource[];
  tags?: CurriculumResource[];
  dependencies?: CurriculumResource[];
}

export interface CurriculumResource {
  curriculumId?: string;
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  data?: Record<string, any>;
}

export type ModuleReference = {
  owner: string;
  type: string;
  slug: string;
  version: string;
};
export interface Registry {
  init: () => Promise<void>;
  load: <T>(slug: string | ModuleReference) => Promise<T>;
  loadMany: <T>(slugs: (string | ModuleReference)[]) => Promise<T[]>;
}

export interface Aperture {
  router: RouterWithExtensions | null;
}

// export interface Config {
//   env: EnvironmentConfig;
// }

// export interface EnvironmentConfig {
//   get: (key: string) => string | undefined;
//   [key: string]: unknown;
// }

/**
 * Extended Router interface with custom methods
 */
export interface RouterWithExtensions extends Router {
  create: () => RouterWithExtensions;
  route: (path: string, ...handlers: RouteHandler[]) => void;
  call: {
    create: (ctx: Partial<RouteContext>) => CallFunction;
  };
  middleware: Middleware[];
  mw: MiddlewareCollection;
}

export type CallFunction = (
  path: string,
  body?: any,
  params?: CallParams,
) => Promise<{ status: string }>;
export interface CallParams {
  method?: string;
}

// Memory Types

// export interface Memory {
//   id: string;
//   type: string;
//   flavor: MemoryFlavor;
//   status: MemoryStatus;
//   state: Record<string, any>;
//   history: any[];
//   signal: Record<string, any>;
//   nextIn: number;
//   nextAt: Date;
//   lastAt: Date;
// }

// export type MemoryFlavor = "INDIVIDUAL" | "RELATIONAL";
// export type MemoryStatus = "UNTOUCHED" | "UNKNOWN" | "LEARNING" | "KNOWN" | "GRADUATED";

// Strategy Types

// export interface Strategy {
//   id: string;
//   slug: string;
//   version: string;
//   installed: boolean;
//   name: string;
//   description?: string;
//   traits: StrategyTrait[];
//   data: Record<string, any>;
// }

// export type StrategyTrait = "DUMMY";

// Event System

export interface EventBus {
  on: (event: string, listener: EventListener, listenerScope?: string) => void;
  emit: (event: string, body: any) => Promise<void>;
  use: (middleware: EventMiddleware) => void;
  scope: () => EventBus;
}

export type EventListener = (body: any, ctx: EventContext) => Promise<void> | void;
export type EventMiddleware = (ctx: EventContext, next: () => Promise<void>) => Promise<void>;

export type EventContext = {
  event?: {
    name: string;
    body: any;
  };
  runtime?: Runtime;
  services?: Services;
} & Context<Record<string, any>, Record<string, any>>;

// Routing

export type RouteHandler = (body: any, ctx: RouteContext) => Promise<any> | any;

export interface RouteContext extends Context {
  runtime: Runtime;
  locals?: Record<string, any>;
  event?: any;
  cookies: SecureCookieMap;
}

/**
 * Middleware collection with pre/post hooks
 */
// export interface MiddlewareCollection extends Array<Middleware> {
//   pre: MiddlewareExecutor;
//   post: MiddlewareExecutor;
//   compose: {
//     pre: MiddlewareComposer;
//     post: MiddlewareComposer;
//   };
// }
export type MiddlewareCollection = Array<Middleware>;
export type MiddlewareExecutor = (handler: RouteHandler) => void;
export type MiddlewareComposer = (...args: any[]) => RouteHandler;

// Function Types
export type BootFunction = (
  runtime: Runtime,
  module: Module,
  parentModule?: RuntimeModule,
) => Promise<Module | Runtime>;
export type InstallFunction = (runtime: Runtime, module: Module) => Promise<boolean>;
