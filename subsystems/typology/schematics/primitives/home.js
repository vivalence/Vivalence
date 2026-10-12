import { v } from "../v.js";

export const Home = v.object({
  reference: v.string().desc('The mode a terminal with no thread sits in — a user\'s HOME over its client\'s; an absolute reference: a host mode, or a hosted mode under its client. Example: "/runtime/runtime/mode/harness/runtime" · "/client/ghost/mode/home/console"'),
});
