// limit: 8479 chars · 11-18 timing evidence, as printed
(async () => {
  if (window.__T) return "already";
  const T = (window.__T = { marks: [], perf: [], ws: { sent: 0, bytes: 0, first: null, last: null }, hooked: false });
  const now = () => performance.timeOrigin + performance.now();
  const mark = (name, data) => T.marks.push({ at: now(), name, ...(data === undefined ? {} : { data }) });
  T.mark = mark;
  T.now = now;

  const label = (node) => {
    const held = node?.closest?.("button,[role=menuitem],textarea,input") ?? node;
    return `${held?.tagName ?? "?"}.${held?.className ?? ""} ${held?.getAttribute?.("aria-label") ?? ""}`.trim().slice(0, 60);
  };
  for (const type of ["pointerdown", "pointerup", "click", "keydown"])
    document.addEventListener(type, (event) => mark(`dom.${type}`, `${label(event.target)}${event.key ? ` key=${event.key}` : ""} ts=${Math.round(performance.timeOrigin + event.timeStamp)}`), true);

  const observe = (type, pick, extra = {}) => {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) T.perf.push({ type, at: performance.timeOrigin + entry.startTime, dur: Math.round(entry.duration), ...pick(entry) });
      }).observe({ type, buffered: false, ...extra });
    } catch (fault) {
      T.perf.push({ type, fault: fault.message });
    }
  };
  observe("event", (entry) => ({ name: entry.name, input: Math.round(entry.processingStart - entry.startTime), handler: Math.round(entry.processingEnd - entry.processingStart), target: label(entry.target), id: entry.interactionId }), { durationThreshold: 16 });
  observe("long-animation-frame", (entry) => ({ block: Math.round(entry.blockingDuration), render: Math.round(entry.startTime + entry.duration - entry.renderStart), scripts: entry.scripts.map((script) => `${script.invoker.slice(0, 50)} ${Math.round(script.duration)}ms ${script.sourceURL.split("/").slice(-2).join("/").slice(0, 50)}:${script.sourceFunctionName}`).slice(0, 5) }));
  observe("longtask", () => ({}));

  const send = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    const length = typeof data === "string" ? data.length : (data.byteLength ?? data.size ?? 0);
    if (!this.__timed) {
      this.__timed = true;
      this.addEventListener("message", (event) => {
        const body = typeof event.data === "string" ? event.data : `<binary ${event.data.byteLength ?? event.data.size}>`;
        if (T.rec) mark("ws.recv", `${body.length} ${body.slice(0, 160)}`);
      });
    }
    if (T.rec) {
      if (length > 1500) {
        T.ws.sent += 1;
        T.ws.bytes += length;
        T.ws.first ??= now();
        T.ws.last = now();
        if (T.ws.sent === 1) mark("ws.send:first-big", `${length} ${typeof data === "string" ? data.slice(0, 120) : "<binary>"}`);
      } else mark("ws.send", `${length} ${typeof data === "string" ? data.slice(0, 160) : "<binary>"}`);
    }
    return send.call(this, data);
  };

  const real = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  T.clip = await (await fetch("http://127.0.0.1:51485/hola.wav")).arrayBuffer();
  T.realMic = true;
  navigator.mediaDevices.getUserMedia = async (constraints) => {
    mark("gum:start");
    if (T.realMic) {
      const stream = await real(constraints);
      mark("gum:real-granted");
      stream.getTracks().forEach((track) => track.stop());
    }
    const context = (T.context ??= new AudioContext());
    if (context.state === "suspended") await context.resume();
    const buffer = await context.decodeAudioData(T.clip.slice(0));
    const sink = context.createMediaStreamDestination();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(sink);
    const lead = T.lead ?? 0.4;
    source.onended = () => mark("clip:end");
    source.start(context.currentTime + lead);
    setTimeout(() => mark("clip:start"), lead * 1000);
    mark("gum:end", `fake stream, clip ${buffer.duration.toFixed(2)}s lead ${lead}s`);
    return sink.stream;
  };

  const addModule = AudioWorklet.prototype.addModule;
  AudioWorklet.prototype.addModule = async function (...args) {
    mark("worklet.addModule:start");
    try {
      return await addModule.apply(this, args);
    } finally {
      mark("worklet.addModule:end");
    }
  };

  const painted = (name) => requestAnimationFrame(() => {
    const frame = now();
    setTimeout(() => mark(`${name}:painted`, `raf ${Math.round(frame)}`), 0);
  });

  const hook = (terminal) => {
    if (T.hooked) return;
    T.hooked = true;
    T.terminal = terminal;
    const app = terminal.client.app;
    const microphone = app.box.device.microphone;
    for (const name of ["claim", "release", "pause", "resume"]) {
      const held = microphone[name];
      microphone[name] = function (...args) {
        mark(`mic.${name}:start`, args[0]);
        const out = held.apply(this, args);
        Promise.resolve(out).then(() => mark(`mic.${name}:end`), (fault) => mark(`mic.${name}:fault`, fault.message));
        return out;
      };
    }
    app.bridge.$dictation.listen((held, left) => {
      const state = held === null ? "null" : `turns=${held.turns.length} open=${held.open ? JSON.stringify(held.open.parts.map((part) => (part.draft ? `~${part.draft.text}` : part.text))).slice(0, 80) : "-"} last=${held.turns.length ? JSON.stringify(held.turns.at(-1).parts.map((part) => part.text)).slice(0, 80) : "-"}`;
      mark("$dictation", state);
      if ((held === null) !== (left === null)) painted(held === null ? "card.gone" : "card.shown");
    });
    app.bridge.$draft.listen((held) => {
      mark("$draft", held.slice(0, 80));
      painted("draft");
    });
    microphone.$claimed.listen((held) => mark("mic.$claimed", held));
    microphone.$paused.listen((held) => mark("mic.$paused", held));
    const wrap = (mode) => {
      if (!mode?.harness?.verbatim || mode.harness.verbatim.__timed) return;
      const verbatim = mode.harness.verbatim;
      const stream = verbatim.stream;
      verbatim.__timed = true;
      verbatim.stream = function (source, options) {
        mark("verbatim.stream:call");
        const fed = (async function* () {
          let count = 0;
          for await (const frame of source) {
            if (count === 0) mark("mic.frame:first", `rate ${frame.audio.rate} b64 ${frame.audio.data.length}`);
            count += 1;
            yield frame;
          }
          mark("mic.frames:end", count);
        })();
        const packets = stream.call(this, fed, options);
        return (async function* () {
          try {
            for await (const packet of packets) {
              mark("packet", `${packet.event}${packet.part?.text !== undefined ? ` ${JSON.stringify(packet.part.text).slice(0, 70)}` : ""}`);
              yield packet;
            }
          } finally {
            mark("verbatim.stream:end");
          }
        })();
      };
    };
    T.wrap = wrap;
    wrap(terminal.mode);
  };

  const subjects = await import("/@fs/Users/finn/vivalence/code/vivalence/systems/ghost/subjects/index.js?t=1795007719352");
  const { Repl } = subjects.terminal;
  const dispatch = Repl.prototype.dispatch;
  Repl.prototype.dispatch = function (typed) {
    hook(this.terminal);
    T.wrap(this.terminal.mode);
    mark("repl.dispatch:start", String(typed));
    const out = dispatch.call(this, typed);
    Promise.resolve(out).then(() => mark("repl.dispatch:done", String(typed)), (fault) => mark("repl.dispatch:fault", `${typed} ${fault.message}`));
    return out;
  };

  T.dump = (from = 0) => {
    const marks = T.marks.filter((held) => held.at >= from);
    const zero = marks.length ? marks[0].at : 0;
    return marks.map((held) => `${String(Math.round(held.at - zero)).padStart(6)} ${held.name}${held.data === undefined ? "" : ` ${held.data}`}`).join("\n");
  };
  return `hooked Repl=${typeof Repl} clip=${T.clip.byteLength}`;
})()
