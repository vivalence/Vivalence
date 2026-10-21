import { v } from "../v.js";

export const Docked = v.object(
  {
    align: v.enum(["left", "right", "top", "bottom"]).optional().desc('Which side the dock sits. Example: "right"'),
    share: v.number({ minimum: 0.1, maximum: 0.9 }).optional().desc("The dock's width as a share of the chrome. Example: 0.38"),
    view: v.enum(["docked", "full", "closed", "messenger"]).optional().desc('How the dock shows. Example: "docked"'),
    shown: v.enum(["docked", "full", "messenger"]).optional().desc('The open view the dock returns to after closed. Example: "messenger"'),
    lens: v.enum(["chat", "repl", "trace"]).optional().desc('Which stream the dock paints. Example: "repl"'),
    markdown: v.enum(["pretty", "plain"]).optional().desc('How the journal paints a reply\'s markdown. Example: "pretty"'),
  },
  { additionalProperties: false },
);
