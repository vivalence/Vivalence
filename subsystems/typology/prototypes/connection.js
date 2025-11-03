import { atom, computed } from "nanostores";
import { Status } from "./status.js";

const track = (connection) => async (ctx, next) => {
  try {
    connection.setActive();
    await next();
    connection.setHealthy();
  } catch (error) {
    connection.setFaulty(error);
    throw error;
  }
};

export class Connection {
  constructor(url) {
    this.url = url;
    this.status = new Status(null, this);
    this.$state = atom("UNRESOLVED");
    this.$error = atom(null);
    this.carry = [track(this)];
  }

  get isHealthy() {
    return computed(this.$state, (state) => state === "HEALTHY");
  }

  get isFaulty() {
    return computed(this.$state, (state) => state === "FAULTY");
  }

  setActive() {
    this.$status.set({ code: "ACTIVE" });
  }

  setHealthy() {
    this.$state.set("HEALTHY");
    this.$status.set({ code: "SUCCESS", label: "connected" });
    this.$error.set(null);
  }

  setFaulty(error) {
    this.state.set("FAULTY");
    this.status.set({ code: "ERROR", error });
    this.error.set(error);
  }

  use(middleware) {
    this.carry.push(middleware);
    return this;
  }
}
