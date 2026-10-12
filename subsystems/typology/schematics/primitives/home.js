import { v } from "../v.js";

export const Home = v.object({
  reference: v.string().desc('The mode a thread with none enters — a user\'s HOME over its client\'s; an absolute reference. Example: "/daemon/memo/mode/srs/memo"'),
});
