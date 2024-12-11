/**
 * Type definitions for Daemon server
 * @package @vivalence/daemon
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Application, Context, Router } from "oak";

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

export interface Daemon {
  runtimes: Map<symbol, Runtime>;
  abort?: AbortController;
  app?: Application;
  router: RouterWithExtensions | null;
  registry: Registry | null;
  server: any; // Oak server instance
  services: Record<string, ServiceClient>;
  process?: any;
  aperture?: Aperture | null;
}

export interface Aperture {
  router: RouterWithExtensions | null;
}

export interface Config {
  env: EnvironmentConfig;
}

export interface EnvironmentConfig {
  get: (key: string) => string | undefined;
  [key: string]: unknown;
}

/**
 * Extended Router interface with custom methods
 */
export interface RouterWithExtensions extends Router {
  create: () => RouterWithExtensions;
  route: (path: string, ...handlers: RouteHandler[]) => void;
  call: {
    create: (ctx: RouteContext) => CallFunction;
  };
  middleware: MiddlewareCollection;
  mw: MiddlewareCollection;
}

export type CallFunction = (path: string, body?: any, params?: CallParams) => Promise<any>;

/**
 * Runtime module configuration and state
 */
export interface Runtime {
  locals?: RuntimeLocals;
  default?: Runtime;
  "#symbol": symbol;
  manifest: Manifest;
  Module: RuntimeModule;
  statics: Record<string, any>;
  schema: Record<string, any>;

  call?: CallFunction;
  router: Router<Record<string, any>>;
  bus: EventBus;

  Services: Record<string, Module>;
  Domain: Module;
  Ontology: Module;
  Corpora: Module[];
  Games: Module[];
  Tactics: Module[];
  Strategies: Module[];

  domain: Module | string;
  ontology: Module | string;
  corpora: (Module | string)[];
  games: (Module | string)[];
  tactics: (Module | string)[];
  strategies: (Module | string)[];

  services: Record<string, Module>;
  modules: Runtime;
}
export interface RuntimeModule extends Runtime {
  boot?: BootFunction;
  install?: InstallFunction;
  curriculum?: Curriculum | ((runtime: Runtime, module: Module) => Promise<Curriculum>);
}

/**
 * Runtime local dependencies and utilities
 */
export interface RuntimeLocals {
  validate: ValidatorSchema;
  supabase: SupabaseClient;
  getUser?: () => Promise<User>;
}

// Module Types

// export interface Module {
//   router: RouterWithExtensions;
//   bus: EventBus;
//   manifest: Manifest;
//   Module: Module;
// }

export interface Module {
  manifest: Manifest;
  boot?: BootFunction;
  install?: InstallFunction;
  provision?: RouteHandler;
  evaluate?: RouteHandler;
  bundle?: string;
  schema?: (schema: any) => any;
  data?: Record<string, any>;
  modules?: Runtime;
  client?: (runtime: Runtime) => any;
}

export interface Manifest {
  id?: string;
  type: ModuleType;
  slug: string;
  name: string;
  version?: string;
  description?: string;
  url?: string;
  installed?: boolean;
  runtimeId?: string;
}

export type ModuleType =
  | "runtime"
  | "game"
  | "tactic"
  | "strategy"
  | "corpus"
  | "domain"
  | "ontology";

// Memory Types

export interface Memory {
  id: string;
  type: string;
  flavor: MemoryFlavor;
  status: MemoryStatus;
  state: Record<string, any>;
  history: any[];
  signal: Record<string, any>;
  nextIn: number;
  nextAt: Date;
  lastAt: Date;
}

export type MemoryFlavor = "INDIVIDUAL" | "RELATIONAL";
export type MemoryStatus = "UNTOUCHED" | "UNKNOWN" | "LEARNING" | "KNOWN" | "GRADUATED";

// Strategy Types

export interface Strategy {
  id: string;
  slug: string;
  version: string;
  installed: boolean;
  name: string;
  description?: string;
  traits: StrategyTrait[];
  data: Record<string, any>;
}

export type StrategyTrait = "DUMMY";

// Event System

export interface EventBus {
  on: (event: string, listener: EventListener, listenerScope?: string) => void;
  emit: (event: string, body: any) => Promise<void>;
  use: (middleware: EventMiddleware) => void;
  scope: () => EventBus;
}

export type EventListener = (body: any, ctx: EventContext) => Promise<void> | void;
export type EventMiddleware = (ctx: EventContext, next: () => Promise<void>) => Promise<void>;

export interface EventContext {
  event: {
    name: string;
    body: any;
  };
  runtime?: Runtime;
}

// Routing

export type RouteHandler = (body: any, ctx: RouteContext) => Promise<any> | any;

export interface RouteContext extends Context {
  runtime?: Runtime;
  locals?: Record<string, any>;
  event?: any;
  cookies?: Map<string, string>;
}

export interface CallParams {
  method?: string;
}

/**
 * Middleware collection with pre/post hooks
 */
export interface MiddlewareCollection extends Array<oak.Middleware> {
  pre: MiddlewareExecutor;
  post: MiddlewareExecutor;
  compose: {
    pre: MiddlewareComposer;
    post: MiddlewareComposer;
  };
}

export type MiddlewareExecutor = (handler: RouteHandler) => void;
export type MiddlewareComposer = (...args: any[]) => RouteHandler;

// Curriculum

export interface Curriculum {
  units?: CurriculumResource[];
  tags?: CurriculumResource[];
  dependencies?: CurriculumResource[];
}

export interface CurriculumResource {
  corpusId?: string;
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  data?: Record<string, any>;
}

// Function Types

export type BootFunction = (
  runtime: Runtime,
  module: Module,
  parentModule?: Module,
) => Promise<Runtime>;
export type InstallFunction = (runtime: Runtime, module: Module) => Promise<boolean>;

// Registry & Services

export interface Registry {
  init: () => Promise<void>;
  load: (slug: string | Module) => Promise<Module>;
  loadMany: (slugs: (string | Module)[]) => Promise<Module[]>;
}

export interface ServiceClient {
  createUserClient: (ctx: RouteContext) => SupabaseClient;
  createAdminClient: () => SupabaseClient;
}

// Validation

export interface ValidatorSchema {
  scope?: () => any;
  schema?: (schema: any) => any;
}

// Queue Types

export interface Queue {
  id: string;
  status: QueueStatus;
  index: number;
  data: Record<string, any>;
}

export type QueueStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";
