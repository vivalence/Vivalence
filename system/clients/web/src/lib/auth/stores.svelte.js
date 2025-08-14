import { get } from "svelte/store";
import { persisted } from "svelte-persisted-store";
import { Call, withAuth, authorize } from "../call/index.js";

class Token {
  constructor(data) {
    Object.assign(this, data);
    // this.access = value.access;
    // this.refresh = value.refresh;
  }
}

class Identity {
  constructor(data) {
    Object.assign(this, data);

    // this.id = value.id;
    // this.username = value.username;
    // this.shards = {
    //   runtimes: value.shards.runtimes?.map((s) => new Shard(s)),
    // };
  }
}

export const token = persisted("token", null, {
  beforeRead: (value) => {
    return new Token(value);
  },
  // beforeWrite: (value) => {/* change value after writing to store, but before writing return value to local storage*/},
});

// class Shard {constructor(value) {this.slug = value.slug; this.url = value.url; this.call = new Call(value.url);} withAuth(auth) {this.call.use(withAuth(auth)).use(authorize()); return this;}}

export const identity = persisted("identity", null, {
  beforeRead: (value) => {
    return new Identity(value);
  },
  // beforeWrite: (value) => {/* change value after writing to store, but before writing return value to local storage*/},
});
