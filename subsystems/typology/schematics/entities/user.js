import { v } from "../v.js";
import { user } from "../traits/index.js";

export const UserDescriptor = {
  $id: "User",
  own: {
    slug: v.string().optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    threads: () => v.array(v.thread()).optional(),
  },
  traits: user,
  narrowable: ["trait"],
};
