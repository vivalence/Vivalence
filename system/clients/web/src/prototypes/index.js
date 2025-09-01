import { persisted } from "svelte-persisted-store";
import { get } from "svelte/store";
import { Call } from "./call/index.js";

class Status {}

class Repository {
  constructor(name, call) {
    this.name = name;
    this.call = call;
  }

  async findOne(where, options = {}) {
    return await this.call(`/entities/${this.name}/findOne`, {
      where,
      options,
    });
  }

  async findMany(where = {}, options = {}) {
    return await this.call(`/entities/${this.name}/find`, { where, options });
  }

  async create(data) {
    return await this.call(`/entities/${this.name}/create`, data);
  }

  async update(where, data) {
    return await this.call(`/entities/${this.name}/update`, { where, data });
  }

  async delete(where) {
    return await this.call(`/entities/${this.name}/delete`, { where });
  }
}

export class Service {
  manifest = {};

  constructor(remote) {
    this.remote = remote;
    this.call = new Call(remote);
    this.status = persisted(remote, {});
  }

  get isConnected() {
    // !this.status.error
    // this.status....
    return !!this.connection.error;
  }

  get connection() {
    return get(this.status);
  }

  // createCall() {return async (endpoint, body = {}) => {try {const response = await fetch(`${this.url}${endpoint}`, {method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include",}); const data = await response.json(); this.updateStatus({state: "ready", code: response.status, message: "Connected", timestamp: new Date(),}); return data;} catch (error) {this.updateStatus({state: "error", code: 0, message: error.message, timestamp: new Date(), data: error,}); throw error;}};}
  async handshake() {
    try {
      this.status = { state: "connecting", message: "Connecting..." };
      this.status = await this.call("/status");
      this.manifest = await this.call("/manifest");
    } catch (error) {
      this.updateStatus({ state: "error", error });
      throw error;
    }

    return this;
  }
  // repository(name) {if (!this.entities[name]) {this.entities[name] = new Repository(name, this.call);} return this.entities[name];}
}

export class Runtime extends Service {
  constructor(shard) {
    super(shard.url);
    this.shard = shard;
  }

  // createAuthorizedCall() {return async (endpoint, body = {}) => {try {const headers = { "Content-Type": "application/json" }; if (this.authority.token?.access) {headers["Authorization"] = `Bearer ${this.authority.token.access}`;} const response = await fetch(`${this.url}${endpoint}`, {method: "POST", headers, body: JSON.stringify(body), credentials: "include",}); if (response.status === 401 && this.authority.refresh) {const refreshResult = await this.authority.refresh(); if (refreshResult.valid) {headers["Authorization"] = `Bearer ${this.authority.token.access}`; return await fetch(`${this.url}${endpoint}`, {method: "POST", headers, body: JSON.stringify(body), credentials: "include",}).then((r) => r.json());}} const data = await response.json(); this.updateStatus({state: "ready", code: response.status, message: "Connected", timestamp: new Date(),}); return data;} catch (error) {this.updateStatus({state: "error", code: 0, message: error.message, timestamp: new Date(), data: error,}); throw error;}};}
}
