import { specimen } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { invoke } from "@vivalence/vector/controller";

specimen.describe("invoke", () => {
  specimen.it("invokes matched effect", async () => {
    const vector = new Vector();
    vector.open("greet", () => "hello");

    const result = await invoke(vector, "greet");
    specimen.expect(result).toBe("hello");
  });

  specimen.it("passes context to effect", async () => {
    const vector = new Vector();
    vector.open("echo", (ctx) => ctx.input);

    const result = await invoke(vector, "echo", { input: "ping" });
    specimen.expect(result).toBe("ping");
  });

  specimen.it("runs middleware before effect", async () => {
    const trace = [];
    const vector = new Vector();

    vector.use(async (_, next) => { trace.push("mw"); await next(); });
    vector.open("action", () => { trace.push("effect"); return "done"; });

    await invoke(vector, "action");
    specimen.expect(trace).toEqual(["mw", "effect"]);
  });

  specimen.it("sets path and signal on context", async () => {
    const vector = new Vector();
    const ctx = {};
    vector.open("/users/:id", () => "found");

    await invoke(vector, "/users/42", ctx);
    specimen.expect(ctx.path).toBeTruthy();
    specimen.expect(ctx.signal).toBeTruthy();
  });

  specimen.it("throws on no match", async () => {
    const vector = new Vector();
    await specimen.expect(invoke(vector, "nope")).rejects.toThrow();
  });
});
