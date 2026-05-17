import { v } from "../v.js";

export const UserDescriptor = {
  $id: "User",
  own: {
    roles: v.array(v.string()).optional(),
    config: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    threads: () => v.array(v.thread()).optional(),
  },
  narrowable: ["config"],
};
