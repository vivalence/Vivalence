import dotenv from "dotenv";
dotenv.config({ path: "/Users/finn/vivalence/code/spanish/app/postgres/.env" });

const { SVELTE_CLIENT_COOKIE, PUBLIC_CLIENT_URL } = process.env;

export async function post(url, body) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: SVELTE_CLIENT_COOKIE,
    },
    body: JSON.stringify(body),
  };
  const response = await fetch(PUBLIC_CLIENT_URL + url, options);
  return response.json();
}
