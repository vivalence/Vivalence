const request = (bytes) =>
  new Request("http://localhost/webhook", { method: "POST", headers: { "content-type": "application/json" }, body: bytes });

const now = (req) => req.json().catch(() => null);
const cloned = (req) => req.clone().json().catch(() => null);

const timed = async (parse, bytes, rounds) => {
  const started = performance.now();
  for (let i = 0; i < rounds; i++) await parse(request(bytes));
  return Math.round(((performance.now() - started) / rounds) * 1000);
};

const report = {};
for (const size of [200, 20_000, 2_000_000]) {
  const bytes = new TextEncoder().encode(JSON.stringify({ text: "x".repeat(size) }));
  const rounds = size > 100_000 ? 50 : 2000;
  await timed(now, bytes, 200);
  report[size] = { now: await timed(now, bytes, rounds), cloned: await timed(cloned, bytes, rounds) };
}

const req = request(new TextEncoder().encode('{"a":  1}'));
const body = await cloned(req);
report.after = { body, used: req.bodyUsed, raw: new TextDecoder().decode(await req.arrayBuffer()) };
console.log(JSON.stringify(report));
