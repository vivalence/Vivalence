import { specimen } from "@vivalence/typology";
import { init, react, held, GROUPS, SIGNALS } from "./activity/sheet.state.js";

const row = (id, extra = {}) => ({ id, status: "IDLE", steps: [], thread: "th", mode: "m", ...extra });
const rows = [row("a"), row("b"), row("c")];
const press = (state, input, key = {}, held = rows) => react(state, { input, key }, held);

specimen.describe("sheet.state — the cursor is an id, and every signal targets it", () => {
  specimen.it("↓ ↓ lands on the third and clamps; every signal names the cursor row; the cursor follows its id through a re-sort and a regroup, and falls back to the first row when its own is gone; q quits, an unknown key is nothing", () => {
    let state = init();
    specimen.expect(held(rows, state).id).toBe("a");
    state = press(state, "", { downArrow: true }).state;
    state = press(state, "", { downArrow: true }).state;
    specimen.expect(state.cursor).toBe("c");
    specimen.expect(press(state, "", { downArrow: true }).state.cursor).toBe("c");
    state = press(state, "", { upArrow: true }).state;
    specimen.expect(state.cursor).toBe("b");
    for (const [input, name] of Object.entries(SIGNALS)) specimen.expect(press(state, input).effect).toEqual({ kind: "signal", id: "b", name });
    specimen.expect(press(state, "o").effect).toBe(undefined);
    specimen.expect(held([rows[2], rows[0], rows[1]], state).id).toBe("b");
    const grouped = [row("a", { thread: "z" }), row("b", { thread: "a" }), row("c", { thread: "m" })];
    for (let n = 0; n < GROUPS.length; n++) {
      specimen.expect(held(grouped, state).id).toBe("b");
      state = press(state, "g", {}, grouped).state;
    }
    specimen.expect(state.group).toBe(0);
    state = press(state, "", { return: true }).state;
    specimen.expect([state.grains, state.cursor]).toEqual([true, "b"]);
    specimen.expect(held([rows[0], rows[2]], state).id).toBe("a");
    specimen.expect(press(state, "s", {}, []).effect).toBe(undefined);
    specimen.expect(press(init(), "q").effect).toEqual({ kind: "quit" });
    specimen.expect(press(init(), "", { escape: true }).effect).toEqual({ kind: "quit" });
    specimen.expect(press(init(), "z")).toEqual({ state: init() });
  });
});
