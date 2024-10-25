import createMemoryProfiler from "./memory-profiler.js";

export default async function dev(params) {
  const profiler = createMemoryProfiler(1000);
  profiler.start();

  // console.log(Deno.memoryUsage());
  // const runtime = params.runtimes.values().next().value;

  // // console.log(runtime.schema);
  // const { data, error } = await runtime.locals.supabase.from("Memory").update({ type: "BAYESIAN" });
  // console.log(data, error);

  // if (unit) await runtime.bus.emit("unit:memorystatuschange", { unit, memory: {}, scope: {} });

  // const runtime = params.runtimes.values().next().value;
  // console.log(runtime.manifest);
  // console.log(runtime.tactics.get("article-morphology-gender-and-number").manifest);

  // const cookies = new Map();
  // cookies.set(
  //   "sb-base-auth-token",
  //   "base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKemRXSWlPaUl4WmpkaVl6UXdNeTAyWkRKa0xUUmhOMkl0WWpVeVppMHpZbVpsWldZd1pEVTVNR0lpTENKaGRXUWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2laWGh3SWpveE56SXpOalk0TlRjMExDSnBZWFFpT2pFM01qTTJOalE1TnpRc0ltVnRZV2xzSWpvaVptbHVia0IyYVhaaGJHVnVZMlV1WTI5dElpd2ljR2h2Ym1VaU9pSWlMQ0poY0hCZmJXVjBZV1JoZEdFaU9uc2ljSEp2ZG1sa1pYSWlPaUpsYldGcGJDSXNJbkJ5YjNacFpHVnljeUk2V3lKbGJXRnBiQ0pkZlN3aWRYTmxjbDl0WlhSaFpHRjBZU0k2ZXlKeWIyeGxjeUk2V3lKVlUwVlNJbDE5TENKeWIyeGxJam9pWVhWMGFHVnVkR2xqWVhSbFpDSXNJbUZoYkNJNkltRmhiREVpTENKaGJYSWlPbHQ3SW0xbGRHaHZaQ0k2SW5CaGMzTjNiM0prSWl3aWRHbHRaWE4wWVcxd0lqb3hOekl6TmpZME9UYzBmVjBzSW5ObGMzTnBiMjVmYVdRaU9pSTBZekF4TXpSa01DMHpPR0UyTFRSbU9EQXRPREl5T1Mwd09UaGhNMll6TnpJNVpHVWlMQ0pwYzE5aGJtOXVlVzF2ZFhNaU9tWmhiSE5sZlEuc3JVb1V2ZWo3TjAtaUtlXzVDRldERTBQa0dQUkFCY0JocVdwd01lMXh0RSIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzIzNjY4NTc0LCJyZWZyZXNoX3Rva2VuIjoiSUpRWkdOeHdCR3JkV1hqdzNoMFVrZyIsInVzZXIiOnsiaWQiOiIxZjdiYzQwMy02ZDJkLTRhN2ItYjUyZi0zYmZlZWYwZDU5MGIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6ImZpbm5Adml2YWxlbmNlLmNvbSIsImVtYWlsX2NvbmZpcm1lZF9hdCI6IjIwMjQtMDMtMDFUMTY6NDM6NTYuMDIxNDY1WiIsInBob25lIjoiIiwiY29uZmlybWVkX2F0IjoiMjAyNC0wMy0wMVQxNjo0Mzo1Ni4wMjE0NjVaIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNC0wOC0xNFQxOTo0OTozNC40MTA0NjM4ODVaIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsicm9sZXMiOlsiVVNFUiJdfSwiaWRlbnRpdGllcyI6W3siaWRlbnRpdHlfaWQiOiJmNWY2MTUyMC1jYWY0LTRjMDQtYjNhZi1mOWEzYzRmMWY2N2IiLCJpZCI6IjFmN2JjNDAzLTZkMmQtNGE3Yi1iNTJmLTNiZmVlZjBkNTkwYiIsInVzZXJfaWQiOiIxZjdiYzQwMy02ZDJkLTRhN2ItYjUyZi0zYmZlZWYwZDU5MGIiLCJpZGVudGl0eV9kYXRhIjp7ImVtYWlsIjoiZmlubkB2aXZhbGVuY2UuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjFmN2JjNDAzLTZkMmQtNGE3Yi1iNTJmLTNiZmVlZjBkNTkwYiJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNC0wMy0wMVQxNjo0Mzo1Ni4wMTY4NTdaIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDMtMDFUMTY6NDM6NTYuMDE2OTUzWiIsInVwZGF0ZWRfYXQiOiIyMDI0LTAzLTAxVDE2OjQzOjU2LjAxNjk1M1oiLCJlbWFpbCI6ImZpbm5Adml2YWxlbmNlLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjQtMDMtMDFUMTY6NDM6NTYuMDA2NzMxWiIsInVwZGF0ZWRfYXQiOiIyMDI0LTA4LTE0VDE5OjQ5OjM0LjQxMjg3N1oiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0",
  // );
  // const call = runtime.router.caller(runtime)({ cookies });

  // const body = {
  //   scope: {
  //     tactic: { id: "a5f3f728-2f3b-4767-8757-2386d7f977ab" },
  //     strategy: { id: "e4f3d446-c1c3-42b2-8e5e-7bd7fcae9928" },
  //     user: { id: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b" },
  //     game: { id: "55de6b74-f28d-4871-b394-ae806e482fa1" },
  //   },
  //   blacklist: {
  //     units: ["b521df06-cb03-4fa7-abc6-db55e0453696", "c54a5c83-64f3-4162-9bf7-880dca21244b"],
  //     tags: [
  //       "clrzb14tl002dg0m3p5lsy4f3",
  //       "clpwfwot10006g0n18uv27vbi",
  //       "clrzaz35y0003g0jsnr9c47j0",
  //       "clrzb8zro069ug0mwugfrctvb",
  //       "clrzaz4z90009g0jsrf0yyiqu",
  //       "clrzb15d70030g0m3zhq7cynz",
  //       "clrzaz4r10008g0jslyotjh0c",
  //       "clrzaz4ir0006g0jsp53an5jh",
  //     ],
  //     instructions: [
  //       "a28425c0-ff07-4135-884c-3c71425abe81",
  //       "011e2789-33fb-48ad-89ac-8547324984be",
  //     ],
  //   },
  //   // tagIds: ["55bdcbd6-fd42-41dd-8014-79668ae6fd07", "clpwfwow30008g0n1iruvb7un"],
  //   // take: 4,
  // };

  // console.log("call(body).response", JSON.stringify(body));
  // console.log("call(body).response", await call("/instructions/provision", body));
  // console.log("call(body).response", await call("/units/pending", body));

  return params;
}
