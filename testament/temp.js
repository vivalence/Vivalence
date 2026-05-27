// DRAIN PRACTICE — one long-lived Span, fork a track every 1000ms,
// stream snapshots through a Pipe that fans out SYNC to A) console B) file.
//
// run:  deno run --env-file=./testament/.env -A ./testament/temp.js
//
// the lessons:
//   Pipe  = the drainage manifold. send(v) fires every tap synchronously.
//           two taps = two sinks, no extra wiring.
//   Span  = a trace trie. branch() forks a track; gauges hold the children.
//   drain = TERMINAL (seal + send-if-root). to STREAM progress we send the
//           growing root snapshot ourselves each tick; drain() is the last beat.

import { Span, Pipe } from "@vivalence/typology";

const FILE = "./testament/temp.spans.log";

// what Span.text() will become — indented tree, one node per line.
function render(span, depth = 0) {
  const pad = "  ".repeat(depth);
  const bits = [span.nature];
  if (span.timing?.duration != null) bits.push(`${span.timing.duration.toFixed(1)}ms`);
  if (span.subject) bits.push(`${span.subject.schema}:${span.subject.id ?? ""}`);
  if (span.fault) bits.push(`FAULT ${span.fault.code ?? ""} ${span.fault.message ?? ""}`.trim());
  return [`${pad}${bits.join(" ")}`, ...span.gauges.map((gauge) => render(gauge, depth + 1))].join(
    "\n",
  );
}

// the manifold: two sync taps, one send fills both.
const pipe = new Pipe();
pipe.tap((span) => console.log("─".repeat(44) + "\n" + render(span))); // A
pipe.tap((span) => Deno.writeTextFileSync(FILE, render(span) + "\n\n", { append: true })); // B
pipe.tap((span) => console.log({ span }));

// one long-lived root, forked + streamed every 1000ms.
const root = new Span("boot").to(pipe).begin();
root.track.subject().target("session", crypto.randomUUID().slice(0, 8));

let tick = 0;
const timer = setInterval(() => {
  tick += 1;
  const beat = root.branch(`tick/${tick}`).begin();
  beat.track.subject().target("beat", tick);
  beat.seal();

  pipe.send(root); // stream the current tree → both taps fire SYNC.  (Span.emit() would wrap this)

  if (tick >= 5) {
    clearInterval(timer);
    root.drain(); // terminal: seal root + final send
    console.log(`\n✦ drained to ${FILE}`);
    Deno.exit(0);
  }
}, 1000);
