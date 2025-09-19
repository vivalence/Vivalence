import { atom, computed } from "nanostores";
import { Status } from "./status.js";

export class Connection {
  constructor(url) {
    this.url = url;
    this.$status = Status();
    this.$state = atom("UNRESOLVED");
    this.$error = atom(null);
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
}
