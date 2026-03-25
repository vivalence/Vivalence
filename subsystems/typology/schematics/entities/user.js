import { v } from "../lib.js";

export const UserDescriptor = {
  $id: "User",
  own: {
    roles: v.array(v.string()).optional(),
    config: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    sessions: () => v.array(v.session()).optional(),
  },
  narrowable: ["config"],
};
