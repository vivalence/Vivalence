<!-- writer: agent · reference, unbudgeted · read 2026-10-10 against ~/code/serverclienttest (not under VCS here, last touched 2024-10-06) · every claim cites file:line, rooted at ~/code/serverclienttest · the binary probed live once, then killed -->
# tauri-deno-demo — a desktop shell over a Deno server, from 10-2024

beef's prototype: a Tauri 2 window that shows a SvelteKit page and carries a Deno server compiled to a single binary as a sidecar. It lives at `~/code/serverclienttest/`. `~/code/tauri-app/` is the plain SvelteKit + Tauri template, with no Deno in it.

**Verdict: half-wired.** The window builds. The server binary exists and serves. Nothing connects the two: Tauri never starts the binary, and the page never calls it.

## tree

```
~/code/serverclienttest/
  package.json        "server:dev": "deno run -A --watch server/mod.js" · @tauri-apps/{api,cli,plugin-shell,plugin-log} 2.x
  deno.lock
  client/             SvelteKit 2 + Svelte 5 + adapter-static: the stock "sverdle" template, untouched
  server/
    mod.js            import './src/index.js'
    build.sh          deno compile → ../tauri/bin/server
    src/server.js     HTTP :8000, GET /test → ~/.zshrc as text/plain
    src/index.js      Find My cache logger, no HTTP
    src/logmanager.js its helper (imported as ./logManager.js, case differs)
    test.py           plistlib dump of the same Find My cache
  tauri/              Rust crate tauri-app, lib tauri_app_lib
    tauri.conf.json   window 800×600, csp null, no externalBin
    capabilities/default.json  shell:allow-{open,execute,spawn,kill,stdin-write} · log:allow-log
    src/lib.rs        greet command, shell + log plugins, setup() spawns nothing
    bin/server        65 MB deno compile output, 2024-10-04 19:48
    target/debug/     a debug build, 2026-02-16; no bundle/
```

## the three pieces

| piece | entry | state |
|---|---|---|
| window | `tauri/tauri.conf.json:7-10` | dev: `cd client && npm run dev` → `devUrl` :5173 · build: `frontendDist` `../client/build` |
| page | `client/src/routes/+layout.js:1-2` | `prerender = true` · `ssr = false`; 0 references to `8000`, `invoke` or `@tauri-apps` under `client/src` |
| server | `server/build.sh:3` | `deno compile --allow-net --allow-read --allow-env --output ../tauri/bin/server ./mod.js` |

## what the binary actually holds

`tauri/bin/server` was compiled on 10-04 from `src/server.js`. `server/mod.js` was edited on 10-06 to import `src/index.js` and was not recompiled after that. Grep of the binary: `zshrc` 4 hits · `Server running` 1 · `fmipcore` 0 · `createLogManager` 0. Probed 10-10: `GET /test` → 200, 3941 bytes · `GET /x` → 404 `Not Found`.

```js
// server/src/server.js:1-4
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { resolve } from "https://deno.land/std@0.181.0/path/mod.ts";

const port = 8000;
```

`serve` from std 0.181 has since been removed from std. A Deno 2.x port uses `Deno.serve({ port }, handler)`. `logmanager.js` imports `https://deno.land/std/fs/mod.ts` unpinned.

`src/index.js` is a different program: it reads `/Users/finn/Library/Caches/com.apple.findmy.fmipcore/Devices.data` (`index.js:7-8`) and stops after the first refresh (`return;` at `index.js:57`, inside `while (true)` at `:55`).

## the missing link

Every attempt to start the server is commented out:

```rust
// tauri/src/lib.rs:28
// let server_path = app .path_resolver() .resolve_resource("../server/server.js") .expect("failed to resolve server path"); Command::new("deno") .args(&["run", "--allow-net", server_path.to_str().unwrap()]) .spawn() .expect("Failed to start Deno server");
```

```rust
// tauri/src/lib.rs:35-44
// let server_bundle = app
//     .path()
//     .resolve("./bin/server", BaseDirectory::Resource)
//     .unwrap();

// info!("Starting Deno bundle: {:?}", server_bundle);

// Command::new(server_bundle)
//     .spawn()
//     .expect("Failed to start Deno bundle");
```

The Tauri 2 sidecar route needs three things, and the demo has only the third:

1. `tauri.conf.json` → `"bundle": { "externalBin": ["bin/server"] }`. The binary must sit beside it named with the target triple: `bin/server-aarch64-apple-darwin`.
2. `lib.rs` `setup` → `app.shell().sidecar("server")?.spawn()?` (`tauri_plugin_shell::ShellExt`), with the child kept so it can be killed on exit.
3. `capabilities/default.json` → shell permissions, present (`shell:allow-spawn`, `shell:allow-execute`). A sidecar spawned from the page also needs the binary allow-listed under `shell:allow-spawn` with `{ "name": "bin/server", "sidecar": true }`.

## for vivalence

The shape fits a packaged `viva`: Tauri as the window, the runtime as a `deno compile` sidecar, anima as `frontendDist`. Facts from this demo to carry:

- `deno compile` of a 38-line server is 65 MB. Deno's runtime is the floor, whatever the app.
- A compiled binary freezes its permissions at compile time (`build.sh:3`) and its sources at that moment: here `mod.js` moved on and the binary did not.
- `csp: null` (`tauri.conf.json:22`) lets the page `fetch` `http://localhost:8000` without a CSP entry. A real build sets `connect-src`.
- Remote `https://deno.land/std` imports compile into the binary. Pinned versions (`std@0.181.0`) survive; unpinned ones (`logmanager.js`) do not reproduce.
