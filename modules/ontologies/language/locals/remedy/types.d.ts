/**
 * Core types for the Remedy system
 */

/**
 * Issue to be remedied
 */
export interface Issue {
  message: string;
  path: string[];
  violation: string;
  context: Record<string, any>;
  hash?: () => string;
}

/**
 * Result of applying a remedy
 */
export interface RemedyResult {
  resolved: boolean;
  [key: string]: any;
}

/**
 * Handler function for remedying an issue
 */
export type RemedyHandler = (issue: Issue, ctx: any) => Promise<RemedyResult>;

/**
 * Module configuration for registering handlers
 */
export interface RemedyModule {
  path: string[];
  handlers: Record<string, RemedyHandler>;
  children?: RemedyModule[];
}

/**
 * State for tracking remedy application
 */
export interface RemedyState {
  history: Set<string>;
  depth: number;
}

/**
 * Registry options
 */
export interface RemedyOptions {
  maxDepth?: number;
  debug?: boolean;
}
