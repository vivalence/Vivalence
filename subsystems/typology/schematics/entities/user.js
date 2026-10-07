import { v } from "../v.js";

const HOME = v.object({
  reference: v.string().desc('The mode a thread with none enters for this user, over its client\'s home — an absolute reference. Example: "/daemon/italian/mode/teacher/francesca"'),
});

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
  traits: { HOME },
  narrowable: ["trait"],
};
