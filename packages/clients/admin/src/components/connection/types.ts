import { type Resource } from "$types/index";
import { type Game, type Strategy, type Tag, type User } from "$types/index";

export interface OptionType<T extends Resource> {
  value: string;
  label: string;
  link: string;
  data: T;
}

export interface RefHandles {
  added: () => OptionType<any>[];
  removed: () => OptionType<any>[];
}

export interface ConnectionTypeMethods<T extends Resource> {
  variableResourceKey: string;
  map: (items: T[]) => OptionType<T>[];
  filter: (all: OptionType<T>[]) => (searchText: string) => OptionType<T>[];
  // sort?: (all: T[]) => T[];
  create: (option: OptionType<T>, rootResourceId: string) => Promise<any>;
  remove: (option: OptionType<T>, rootResourceId: string) => Promise<any>;
}

export interface ConnectionTypesInterface {
  StrategyToUser: ConnectionTypeMethods<User>;

  UserToStrategy: ConnectionTypeMethods<Strategy>;
  GameToStrategy: ConnectionTypeMethods<Strategy>;
  TagToStrategy: ConnectionTypeMethods<Strategy>;
  UnitToStrategy: ConnectionTypeMethods<Strategy>;

  StrategyToUnit: ConnectionTypeMethods<Unit>;
  TagToUnit: ConnectionTypeMethods<Unit>;

  StrategyToTag: ConnectionTypeMethods<Tag>;
  UnitToTag: ConnectionTypeMethods<Tag>;

  StrategyToGame: ConnectionTypeMethods<Game>;
}
