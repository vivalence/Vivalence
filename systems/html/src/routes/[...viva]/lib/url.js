import { effect } from "nanostores";
import { replaceState } from "$app/navigation";
import { get } from "svelte/store";
import { page } from "$app/stores";

export function parse(terminal, url) {
  terminal._seedSessionId = url.searchParams.get("session") || null;
  terminal.perspective = url.pathname;
  terminal.phase = url.searchParams.get("phase") || terminal.phase;
}

export function serialize(terminal) {
  return effect([terminal.$phase, terminal.$perspective, terminal.$session], () => {
    const perspective = terminal.$perspective.get();
    if (!perspective) return;

    const url = new URL(get(page).url);
    url.pathname = perspective;

    const session = terminal.$session.get();
    if (session?.id) url.searchParams.set("session", session.id);
    // else url.searchParams.delete("session");

    const phase = terminal.$phase.get();
    if (phase) url.searchParams.set("phase", phase);
    // else url.searchParams.delete("phase");

    if (url.href !== get(page).url.href) {
      replaceState(url, {});
    }
  });
}
