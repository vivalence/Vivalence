import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import { CLIENT, ENTRY, KIT, SRC, build, dom, fire, keys, send } from "./rig.js";

const WIDGETS = {
  Composer: new URL("app/panels/a/widgets/Composer.svelte", SRC),
  Dictaphone: new URL("app/panels/a/widgets/Dictaphone.svelte", SRC),
  Tune: new URL("app/widgets/Tune.svelte", SRC),
  Key: KIT.Key,
  Segmented: KIT.Segmented,
  Stepper: KIT.Stepper,
  Status: KIT.Status,
  Tag: KIT.Tag,
  Float: KIT.Float,
};

const recorder = (active = "idle") => ({ $active: atom(active), $committed: atom(""), $tail: atom(""), $error: atom(null) });

const stopper = () => {
  const calls = [];
  return {
    calls,
    control: {
      armed: null,
      press: () => calls.push("press"),
      release: () => calls.push("release"),
      stop: () => calls.push("stop"),
    },
  };
};

const thread = () => ({
  id: "t1",
  $trait: atom({ INTELLIGENT: { tune: "balanced" } }),
  trait: { INTELLIGENT: { tune: "balanced" } },
  traits: ["INTELLIGENT"],
  daemon: { cortex: { find: () => [] } },
});

specimen.describe("composer — mounted, the field obeys the focus law and the keys hand their pointer on", () => {
  let directory, document, mount, unmount, flush, state, get, set, Composer;
  const mounted = [];

  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "anima-composer-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush, state, get, set } = await import(CLIENT));
    ({ default: Composer } = await (await build(directory, WIDGETS))("Composer"));
  });
  specimen.afterEach(() => {
    for (const app of mounted.splice(0)) unmount(app);
    flush();
    document.body.innerHTML = "";
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  const compose = (given = {}) => {
    const draft = state(given.draft ?? "");
    const held = {
      field: null,
      get draft() {
        return get(draft);
      },
    };
    const { control, calls } = stopper();
    const sent = [];
    const target = document.body.appendChild(document.createElement("div"));
    const app = mount(Composer, {
      target,
      props: {
        thread: thread(),
        harnessed: true,
        hint: "message…",
        control,
        recorder: recorder(),
        level: atom(0),
        onsend: () => sent.push(held.draft),
        ...given,
        get draft() {
          return get(draft);
        },
        set draft(value) {
          set(draft, value);
        },
        get field() {
          return held.field;
        },
        set field(value) {
          held.field = value;
        },
      },
    });
    mounted.push(app);
    flush();
    const field = target.getElementsByTagName("textarea")[0];
    const key = (tone) => keys(target).find((button) => button.classList.contains(tone)) ?? null;
    return { held, calls, sent, field, key };
  };

  const type = (field, text) => {
    field.value = text;
    fire(field, "input");
    flush();
  };

  const open = (field) => [field.hasAttribute("disabled"), field.hasAttribute("readonly"), Boolean(field.disabled), Boolean(field.readOnly)];

  specimen.it("the field is never disabled and never readonly: without a harness it reverts what is typed", () => {
    const { held, field } = compose({ harnessed: false });
    specimen.expect(open(field)).toEqual([false, false, false, false]);
    specimen.expect(field.getAttribute("placeholder")).toBe("—");
    type(field, "typed into a thread with no harness");
    specimen.expect(field.value).toBe("");
    specimen.expect(held.draft).toBe("");
  });

  specimen.it("while dictation listens the field stays a field and reverts; idle, it takes the draft", () => {
    const listening = compose({ draft: "held", recorder: recorder("listening"), verbatim: true });
    specimen.expect(open(listening.field)).toEqual([false, false, false, false]);
    type(listening.field, "held and typed over");
    specimen.expect(listening.field.value).toBe("held");
    specimen.expect(listening.held.draft).toBe("held");

    const idle = compose();
    specimen.expect(idle.held.field === idle.field).toBe(true);
    type(idle.field, "e4");
    specimen.expect(idle.held.draft).toBe("e4");
  });

  specimen.it("the stop key calls control.press on pointer down and control.release on up, leave and cancel", () => {
    const { calls, field, key } = compose({ stoppable: true, sending: true });
    const stop = key("negative");
    specimen.expect([Boolean(stop), Boolean(key("primary"))]).toEqual([true, false]);
    specimen.expect(open(field)).toEqual([false, false, false, false]);

    fire(stop, "pointerdown");
    specimen.expect(calls).toEqual(["press"]);
    fire(stop, "pointerup");
    specimen.expect(calls).toEqual(["press", "release"]);

    fire(stop, "pointerdown");
    send(stop, "pointerleave");
    specimen.expect(calls).toEqual(["press", "release", "press", "release"]);

    fire(stop, "pointerdown");
    send(stop, "pointercancel");
    specimen.expect(calls).toEqual(["press", "release", "press", "release", "press", "release"]);

    send(stop, "pointerleave");
    specimen.expect(calls).toHaveLength(6);
  });

  specimen.it("the stop key's click is the keyboard's path: detail 0 stops, a pointer's click does not", () => {
    const { calls, key } = compose({ stoppable: true });
    fire(key("negative"), "click", { detail: 1 });
    specimen.expect(calls).toEqual([]);
    fire(key("negative"), "click", { detail: 0 });
    specimen.expect(calls).toEqual(["stop"]);
  });

  specimen.it("the send key is disabled on an empty draft, never the field", () => {
    const empty = compose();
    specimen.expect(Boolean(empty.key("primary").disabled)).toBe(true);
    specimen.expect(open(empty.field)).toEqual([false, false, false, false]);
    fire(empty.key("primary"), "click", { detail: 1 });
    specimen.expect(empty.sent).toEqual([]);

    type(empty.field, "e4");
    specimen.expect(Boolean(empty.key("primary").disabled)).toBe(false);
    fire(empty.key("primary"), "click", { detail: 1 });
    specimen.expect(empty.sent).toEqual(["e4"]);

    const unharnessed = compose({ harnessed: false, draft: "kept from before" });
    specimen.expect(Boolean(unharnessed.key("primary").disabled)).toBe(true);
    specimen.expect(open(unharnessed.field)).toEqual([false, false, false, false]);
  });

  specimen.it("the tune key opens the intelligence editor in a float of the body zone, and closes it", () => {
    const { key } = compose({ tunable: true, tune: "balanced" });
    specimen.expect(document.body.getElementsByClassName("float")).toHaveLength(0);
    const tune = key("plain");
    specimen.expect(tune.textContent.trim()).toBe("balanced");

    fire(tune, "click", { detail: 1 });
    flush();
    const float = document.body.getElementsByClassName("float")[0];
    specimen.expect(Boolean(float)).toBe(true);
    specimen.expect(float.parentNode.getAttribute("data-zone")).toBe("1");
    specimen.expect(float.textContent).toContain("effort");

    fire(tune, "click", { detail: 1 });
    flush();
    specimen.expect(document.body.getElementsByClassName("float")).toHaveLength(0);
  });
});
