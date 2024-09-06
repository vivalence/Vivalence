import { env } from "$env/dynamic/public";

// there is a way to make this elegantly recursive.
function createCall(settings) {
  const req = async (url, body = {}, params = {}) => {
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

    return await fetch(new URL(url).toString(), options);
  };

  const call = async (path, body, params) => {
    const url = new URL(path, env.PUBLIC_DAEMON_URL).toString();
    const response = await req(url, body, params);
    return await response.json();
  };

  const wrap = (root) => {
    const wrapped = (path, body, params) => call(`${root}${path}`, body, params);
    wrapped.wrap = wrap;
    wrapped.raw = req;
    return wrapped;
  };

  call.wrap = wrap;
  call.raw = req;
  return call;
}

export default createCall;
