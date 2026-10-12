import { v } from "../v.js";
import { Home } from "../primitives/home.js";

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
  traits: { HOME: Home },
  narrowable: ["trait"],
};
