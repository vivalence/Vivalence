import type { TString } from "typebox";
import type { Schematic, v } from "../v.d.ts";

export * from "./url.js";
export * as mime from "./mime.js";

export interface ID extends TString {}
export interface Slug extends TString {}
export interface JWTToken extends TString {}
export interface Username extends TString {}
export interface Password extends TString {}

export const ID: Schematic<ID>;
export const slug: (options?: Parameters<typeof v.string>[0]) => Schematic<Slug>;
export const Slug: Schematic<Slug>;
export const JWTToken: Schematic<JWTToken>;
export const Username: Schematic<Username>;
export const Password: Schematic<Password>;
