import { env } from "$env/dynamic/public";

// there is a way to make this elegantly recursive.
function createCall(event) {
  const req = async (url, body = {}, params = {}) => {
    let cookie = event?.request?.headers?.get("cookie");
    if (!cookie && params?.cookie) cookie = params.cookie;

    // ...(!!event.data.session && {Authorization: `Bearer ${JSON.stringify(event.data.session)}`,}),
    // ...(!!params.session && { Authorization: `Bearer ${JSON.stringify(params.session)}` }),

    // let authorization = event?.request?.headers?.get("authorization");
    // if (!authorization && params?.authorization) authorization = params.authorization;
    // if (!authorization && event?.data?.session && event?.data?.session?.token) authorization = `Bearer ${event.data.session.token}`;

    const options = {
      method: params.method || "POST",
      headers: {
        "Content-Type": "application/json",
        // authorization,
        cookie,
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
