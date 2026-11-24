import type { Static, TIntersect, TObject } from "typebox";
import type * as traits from "../traits/index.js";
import type { EntitySchematic, Filled } from "../v.d.ts";
import type {
  BufferSchematic,
  ModeSchematic,
  ThreadSchematic,
  TurnSchematic,
  UserSchematic,
} from "./index.js";

export type Own<Entity extends EntitySchematic> = Static<
  TIntersect<[Entity["base"], TObject<Entity["own"]>]>
>;

export type Rel<Held> = string | Held;

export type Thread = Omit<Own<typeof ThreadSchematic>, "trait"> & {
  trait: Filled<typeof traits.thread>;
  user?: Rel<User>;
  mode?: Rel<Mode>;
  parent?: Rel<Thread>;
  children?: Thread[];
  buffers?: Buffer[];
  turns?: Turn[];
};

export type Buffer = Omit<Own<typeof BufferSchematic>, "trait"> & {
  trait: Filled<typeof traits.buffer>;
  thread?: Rel<Thread>;
  mode?: Rel<Mode>;
};

export type Turn = Own<typeof TurnSchematic> & { thread?: Rel<Thread>; parent?: Rel<Turn> };
export type User = Own<typeof UserSchematic>;
export type Mode = Own<typeof ModeSchematic>;

export interface Entities {
  thread: Thread;
  buffer: Buffer;
  turn: Turn;
  user: User;
  mode: Mode;
}
