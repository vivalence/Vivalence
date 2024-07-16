import { BaseRecord } from "@refinedev/core";

export interface User extends BaseRecord {
  id: string;
  email: string;
  roles: string[];
  [key: string]: any;
}

export interface Strategy {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Game {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Tag {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Unit {
  id: string;
  name: string;
  [key: string]: any;
}

// one type that can be any of User, Strategy, Tag, or Unit
export type Resource = User | Strategy | Tag | Unit | Game;
