class Component extends DCLogic {
  constructor(props) {
    super(props);
    const p = (id, prompt, parent, withs) => ({ id, prompt, parent, with: withs, src: this.art(id) });
    this.state = {
      draft: "", busy: null, fault: null, over: false, next: "iterate", model: "openai/gpt-image-2", size: "3:2", count: 1,
      refs: [{ name: "wash-sample.jpg", role: "style", src: this.art("wash-sample.jpg") }, { name: "fox-photo.png", role: "subject", src: this.art("fox-photo.png") }],
      pictures: [
        p("a1c0", "a red fox in loose watercolor", null, "black-forest-labs/flux.2-pro · 3:2"),
        p("7d55", "a red fox in loose watercolor, white paper showing", null, "wash-sample.jpg as style · black-forest-labs/flux.2-pro · 3:2"),
        p("2e8f", "more paper, less fox", "7d55", "on 7d55 · wash-sample.jpg as style · black-forest-labs/flux.2-pro · 3:2"),
        p("3f9a", "the fox turned toward us", "2e8f", "on 2e8f · wash-sample.jpg as style · fox-photo.png as subject · openai/gpt-image-2 · 3:2"),
        p("8c01", "the fox turned toward us", "2e8f", "on 2e8f · wash-sample.jpg as style · fox-photo.png as subject · openai/gpt-image-2 · 3:2"),
      ],
      shown: "3f9a",
    };
    this.models = [
      { key: "1", id: "openai/gpt-image-2", references: 16, aspects: ["1:1", "3:2", "2:3"] },
      { key: "2", id: "black-forest-labs/flux.2-pro", references: 8, aspects: ["1:1", "3:2", "2:3", "4:3", "3:4", "16:9", "9:16"] },
      { key: "3", id: "google/gemini-2.5-flash-image", references: 3, aspects: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] },
    ];
    this.aspects = ["1:1", "3:2", "2:3", "16:9"];
  }
  art(seed) {
    const n = [...seed].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 997, 7);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="gray" fill-opacity=".18"/><circle cx="${60 + (n % 180)}" cy="${50 + (n % 70)}" r="${28 + (n % 30)}" fill="gray" fill-opacity=".55"/><path d="M0 ${140 + (n % 30)} Q150 ${100 + (n % 60)} 300 ${150 + (n % 20)} V200 H0Z" fill="gray" fill-opacity=".4"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  hash() {
    return Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  }
  addRef(name, role, src) {
    if (this.state.refs.some((r) => r.name === name)) return this.setState({ over: false });
    this.setState({ refs: [...this.state.refs, { name, role, src: src || this.art(name) }], over: false });
  }
  say() {
    const prompt = this.state.draft.trim();
    if (!prompt || this.state.busy) return;
    this.setState({ busy: prompt, fault: null, draft: "" });
    setTimeout(() => {
      const { refs, shown, next, model, size, count, pictures } = this.state;
      const faculty = this.models.find((m) => m.id === model);
      const parent = next === "iterate" && pictures.some((p) => p.id === shown) ? shown : null;
      const given = (parent ? 1 : 0) + refs.length;
      if (given > faculty.references) return this.setState({ busy: null, draft: prompt, fault: `[openrouter] ${model} takes at most ${faculty.references} references, ${given} given` });
      const withs = [parent ? `on ${parent}` : null, ...refs.map((r) => `${r.name} as ${r.role}`), `${model} · ${size}`].filter(Boolean).join(" · ");
      const batch = Array.from({ length: count }, () => { const id = this.hash(); return { id, prompt, with: withs, parent, src: this.art(id) }; });
      this.setState({ busy: null, pictures: [...pictures, ...batch], shown: batch[0].id });
    }, 1400);
  }
  latch(key, value) {
    return () => this.setState({ [key]: value });
  }
  renderVals() {
    const { draft, busy, fault, pictures, refs, shown, over, next, model, size, count } = this.state;
    const ref = refs.find((r) => r.name === shown);
    const current = pictures.find((p) => p.id === shown) || (ref ? { id: ref.name, prompt: "", with: `a reference · ${ref.role}`, src: ref.src } : null);
    const faculty = this.models.find((m) => m.id === model);
    const is = (a, b) => String(a === b);
    return {
      draft, over, overCls: over ? "is-over" : "",
      shownId: shown || "—",
      iterate: is(next, "iterate"), fresh: is(next, "fresh"), setIterate: this.latch("next", "iterate"), setFresh: this.latch("next", "fresh"),
      models: this.models.map((m) => ({
        key: m.key,
        vendor: m.id.split("/")[0],
        name: m.id.split("/")[1],
        meta: [m.id, "openrouter", `${m.references} references`, "no mask", ...m.aspects].join(" · "),
        on: is(model, m.id),
        pick: () => this.setState({ model: m.id, size: m.aspects.includes(size) ? size : m.aspects[0] }),
      })),
      grow: (e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; },
      aspects: this.aspects.map((a) => ({
        label: a,
        on: is(size, a),
        cls: faculty.aspects.includes(a) ? "" : "is-off",
        pick: () => faculty.aspects.includes(a) && this.setState({ size: a }),
      })),
      c1: is(count, 1), c2: is(count, 2), c4: is(count, 4), setC1: this.latch("count", 1), setC2: this.latch("count", 2), setC4: this.latch("count", 4),
      busy: !!busy,
      busyPrompt: busy || "",
      faulted: !!fault,
      fault: fault || "",
      hasShown: !busy && !!current,
      isEmpty: !busy && !current,
      shown: current ? { ...current, meta: [current.id, current.with, current.prompt].join(" · ") } : { id: "", prompt: "", with: "", meta: "", src: "" },
      type: (e) => this.setState({ draft: e.target.value }),
      key: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.say(); e.target.style.height = "auto"; } },
      dragOver: (e) => { e.preventDefault(); if (!over) this.setState({ over: true }); },
      dragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) this.setState({ over: false }); },
      drop: (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/picture");
        if (id) return this.addRef(id, "style", pictures.find((p) => p.id === id)?.src);
        const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return this.setState({ over: false });
        this.setState({ refs: [...refs, ...files.filter((f) => !refs.some((r) => r.name === f.name)).map((f) => ({ name: f.name, role: "style", src: URL.createObjectURL(f) }))], over: false });
      },
      addRef: () => {
        const names = ["poster-grid.png", "ink-study.jpg", "wash-sample.jpg", "fox-photo.png"];
        this.addRef(names[refs.length % names.length], "style");
      },
      refs: refs.map((r, i) => {
        const set = (role) => () => this.setState({ refs: refs.map((x, j) => (j === i ? { ...x, role } : x)) });
        return {
          ...r,
          cls: r.name === shown ? "is-shown" : "",
          show: () => this.setState({ shown: r.name }),
          isStyle: is(r.role, "style"), isSubject: is(r.role, "subject"), isStructure: is(r.role, "structure"),
          style: set("style"), subject: set("subject"), structure: set("structure"),
          remove: () => this.setState({ refs: refs.filter((_, j) => j !== i), shown: shown === r.name ? (pictures.at(-1)?.id ?? null) : shown }),
        };
      }),
      pictures: pictures.map((p) => ({
        ...p,
        cls: [p.id === shown ? "is-shown" : "", p.parent ? "" : "is-root"].join(" "),
        title: [p.id, p.parent ? `on ${p.parent}` : null, p.prompt].filter(Boolean).join(" · "),
        show: () => this.setState({ shown: p.id }),
        drag: (e) => { e.dataTransfer.setData("text/picture", p.id); e.dataTransfer.effectAllowed = "copy"; },
      })),
    };
  }
}
