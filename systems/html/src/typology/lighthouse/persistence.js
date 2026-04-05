import { effect } from "nanostores";

const STORAGE_KEY = (url) => `lighthouse:${url}`;

export function hydrate(lighthouse) {
  const key = STORAGE_KEY(lighthouse.connection.url);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const { authority, identity } = JSON.parse(stored);
      if (authority) lighthouse.$authority.set(authority);
      if (identity) lighthouse.$identity.set(identity);
    } catch {
      localStorage.removeItem(key);
    }
  }

  effect([lighthouse.$authority, lighthouse.$identity], (authority, identity) => {
    if (authority || identity) {
      localStorage.setItem(key, JSON.stringify({ authority, identity }));
    } else {
      localStorage.removeItem(key);
    }
  });
}
