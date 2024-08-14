import { env } from "$env/dynamic/public";
// import { resolve } from "url";

function createCall(settings) {
  return async (path, body = {}, params = {}) => {
    const options = {
      method: params.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...(!!params.cookie && { Cookie: params.cookie }),
        ...(!!params.session && { Authorization: `Bearer ${JSON.stringify(params.session)}` }),
      },
      credentials: "include",
    };
    if (options.method !== "GET") options.body = JSON.stringify(body);

    const url = new URL(path, env.PUBLIC_DAEMON_URL).toString();
    const request = fetch(url, options);
    const response = await request;
    const json = await response.json();
    return json;
  };
}

export default createCall;
