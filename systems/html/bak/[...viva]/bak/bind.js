import { get } from "svelte/store";
import { page } from "$app/stores";
import { replaceState } from "$app/navigation";
import { populate } from "./populate.js";

export function bind(buffer) {
  let current = null;

  const hooks = {
    getParam(key) {
      return get(page).url.searchParams.get(key);
    },
    setParam(key, value) {
      const url = new URL(get(page).url);
      url.searchParams.set(key, value);
      replaceState(url, {});
    },
    navigate(pathname) {
      const url = new URL(get(page).url);
      url.pathname = pathname;
      replaceState(url, {});
      // this updates $page → subscription fires → populate runs with new path
    },
  };

  // $page fires immediately on subscribe with current value → first populate
  // $page fires on replaceState / goto / back-forward → re-populate
  const unsubscribe = page.subscribe(($page) => {
    const pathname = $page.url.pathname;
    if (pathname === current) return;
    current = pathname;
    populate(buffer, pathname, hooks);
  });

  return unsubscribe;
}
