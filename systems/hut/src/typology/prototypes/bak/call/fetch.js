const vfetch = async (ctx) => {
  const { url, method = "POST", body, headers = {} } = ctx.request;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json", //
      ...headers,
    },
    credentials: "include",
  };

  if (method !== "GET" && body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  let responsebody;
  try {
    responsebody = await response.json();
  } catch (e) {
    console.log("reponse body parsing failed", e.name, e);
  }

  ctx.response = {
    status: response.status,
    headers: response.headers,
    body: responsebody,
  };

  return ctx;
};

export default vfetch;
