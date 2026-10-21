import { Vector, shape, specimen, v } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const commands = () => new Vector().open({ nature: "/mode", valence: "pick", chord: "leader/m" }, () => "picked").open({ nature: "/quit", valence: "leave" }, () => "left");

specimen.it("fromRepl folds a chord: into an edge whose effect is the line; a command without one is left out", () => {
  const stripped = shape.strip(ghost.shard.keymap.fromRepl(commands())).branches;
  specimen.expect(Object.keys(stripped)).toEqual(["leader"]);
  specimen.expect(stripped.leader.branches.m.effect).toEqual({ valence: "/mode" });
});

specimen.it("catalog rolls the repl up into rows — nature and chord, an empty chord for an unbound command", () => {
  specimen.expect(ghost.shard.keymap.catalog(commands())).toEqual([{ nature: "/mode", valence: "pick", chord: "leader/m", options: [], args: false }, { nature: "/quit", valence: "leave", chord: "", options: [], args: false }]);
});

specimen.it("catalog lists a command before its sub-commands, in declaration order", () => {
  const repl = new Vector()
    .open({ nature: "/popover", valence: "float" }, () => "floated")
    .open({ nature: "/popover/close", valence: "drop" }, () => "dropped")
    .open({ nature: "/quit", valence: "leave" }, () => "left");
  specimen.expect(ghost.shard.keymap.catalog(repl).map((entry) => entry.nature)).toEqual(["/popover", "/popover/close", "/quit"]);
});

specimen.it("catalog lists a command's options: the words of its first input's enum, none for a free word or no input", () => {
  const repl = new Vector()
    .open({ nature: "/dock", valence: "the dock", input: v.object({ word: v.enum(["left", "closed"]).desc('A word. Example: "closed"') }) }, () => "docked")
    .open({ nature: "/split", valence: "the share", input: v.object({ share: v.number().desc("A share. Example: 0.5") }) }, () => "split");
  specimen.expect(ghost.shard.keymap.catalog(repl).map((entry) => [entry.nature, entry.options])).toEqual([["/dock", ["left", "closed"]], ["/split", []]]);
});
