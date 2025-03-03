export default async function auth(ctx, next) {
  // console.log("[AUTH]");
  // if (ctx.request.url.pathname.match(/\/r\/ any alphanumeric string or id or uuid \/ .*/)) {
  // if (ctx.request.url.pathname.match(/\/runtime\/ ...
  // must match routes with /r/ or /runtime/
  if (ctx.request.url.pathname.match(/^\/(?:r|runtime)\/.+/)) {
    // console.log("[RUNTIME]");
    // runtime domain manages auth.
  } else if (ctx.request.url.pathname === "/status") {
    // console.log("[STATUS]");
    // public
  } else {
    // console.log("[ADMIN]");
    // run admin auth
  }

  // if (error || !data.user) {
  //   ctx.response.status = 401;
  //   ctx.response.body = { error: "Unauthorized" };
  //   console.error("[AUTH ERROR]");
  //   console.error(data, error, ctx);
  //   console.error("[/AUTH ERROR]");
  //   return;
  // }

  await next();
}
// URL {
//   href: "http://localhost:5175/r/l-ud-eng2esp/g/translations/game/Translations.svelte.map",
//   origin: "http://localhost:5175",
//   protocol: "http:",
//   username: "",
//   password: "",
//   host: "localhost:5175",
//   hostname: "localhost",
//   port: "5175",
//   pathname: "/r/l-ud-eng2esp/g/translations/game/Translations.svelte.map",
//   hash: "",
//   search: ""
// }
// const dummyRequest= {
//   body: Body { has: false, used: false },
//   hasBody: false,
//   headers: Headers {
//     "accept-encoding": "gzip, deflate, br, zstd",
//     "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6,ru;q=0.5",
//     connection: "keep-alive",
//     cookie: "sb-base-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKemRXSWlPaUl4WmpkaVl6UXdNeTAyWkRKa0xUUmhOMkl0WWpVeVppMHpZbVpsWldZd1pEVTVNR0lpTENKaGRXUWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2laWGh3SWpveE56STFOVFV3TVRZMUxDSnBZWFFpT2pFM01qVTFORFkxTmpVc0ltVnRZV2xzSWpvaVptbHVia0IyYVhaaGJHVnVZMlV1WTI5dElpd2ljR2h2Ym1VaU9pSWlMQ0poY0hCZmJXVjBZV1JoZEdFaU9uc2ljSEp2ZG1sa1pYSWlPaUpsYldGcGJDSXNJbkJ5YjNacFpHVnljeUk2V3lKbGJXRnBiQ0pkZlN3aWRYTmxjbDl0WlhSaFpHRjBZU0k2ZXlKeWIyeGxjeUk2V3lKVlUwVlNJbDE5TENKeWIyeGxJam9pWVhWMGFHVnVkR2xqWVhSbFpDSXNJbUZoYkNJNkltRmhiREVpTENKaGJYSWlPbHQ3SW0xbGRHaHZaQ0k2SW5CaGMzTjNiM0prSWl3aWRHbHRaWE4wWVcxd0lqb3hOekU1TmpVNU5qWTNmVjBzSW5ObGMzTnBiMjVmYVdRaU9pSXlZMk5sTURkbU15MWhNV1ZqTFRRMlpEUXRPRFU1WVMwNFptRm1NR016TWpsa01EZ2lMQ0pwYzE5aGJtOXVlVzF2ZFhNaU9tWmhiSE5sZlEuT2tGajNJQ3NVSGdTTWdDYzZPSURGYVY1SU9yWFlHTHFZUUozdDBZZmJJUSIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzI1NTUwMTY1LCJyZWZyZXNoX3Rva2VuIjoiYVJfQzR3Zl92dEJlTnNvYXhmQVNFZyIsInVzZXIiOnsiaWQiOiIxZjdiYzQwMy02ZDJkLTRhN2ItYjUyZi0zYmZlZWYwZDU5MGIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6ImZpbm5Adml2YWxlbmNlLmNvbSIsImVtYWlsX2NvbmZpcm1lZF9hdCI6IjIwMjQtMDMtMDFUMTY6NDM6NTYuMDIxNDY1WiIsInBob25lIjoiIiwiY29uZmlybWVkX2F0IjoiMjAyNC0wMy0wMVQxNjo0Mzo1Ni4wMjE0NjVaIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNC0wOC0xNFQxOTo0OTozNC40MTA0NjNaIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsicm9sZXMiOlsiVVNFUiJdfSwiaWRlbnRpdGllcyI6W3siaWRlbnRpdHlfaWQiOiJmNWY2MTUyMC1jYWY0LTRjMDQtYjNhZi1mOWEzYzRmMWY2N2IiLCJpZCI6IjFmN2JjNDAzLTZkMmQtNGE3Yi1iNTJmLTNiZmVlZjBkNTkwYiIsInVzZXJfaWQiOiIxZjdiYzQwMy02ZDJkLTRhN2ItYjUyZi0zYmZlZWYwZDU5MGIiLCJpZGVudGl0eV9kYXRhIjp7ImVtYWlsIjoiZmlubkB2aXZhbGVuY2UuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjFmN2JjNDAzLTZkMmQtNGE3Yi1iNTJmLTNiZmVlZjBkNTkwYiJ9LCJwcm92aWRlciI6ImVtYWlsIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNC0wMy0wMVQxNjo0Mzo1Ni4wMTY4NTdaIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDMtMDFUMTY6NDM6NTYuMDE2OTUzWiIsInVwZGF0ZWRfYXQiOiIyMDI0LTAzLTAxVDE2OjQzOjU2LjAxNjk1M1oiLCJlbWFpbCI6ImZpbm5Adml2YWxlbmNlLmNvbSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjQtMDMtMDFUMTY6NDM6NTYuMDA2NzMxWiIsInVwZGF0ZWRfYXQiOiIyMDI0LTA5LTA1VDE0OjI4OjA3LjQxNjIzNVoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfX0",
//     host: "localhost:5175",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "no-cors",
//     "sec-fetch-site": "same-site",
//     "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
//   },
//   ip: "127.0.0.1",
//   ips: [],
//   method: "GET",
//   secure: false,
//   url: "http://localhost:5175/r/l-ud-eng2esp/g/translations/game/Translations.svelte.map",
//   userAgent: UserAgent {
//   browser: { name: "Chrome", version: "128.0.0.0", major: "128" },
//   cpu: { architecture: undefined },
//   device: { model: "Macintosh", type: undefined, vendor: "Apple" },
//   engine: { name: "Blink", version: "128.0.0.0" },
//   os: { name: "macOS", version: "10.15.7" },
