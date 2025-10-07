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
  // console.log(response);

  let responsebody;
  try {
    responsebody = await response.json();
  } catch (e) {
    console.log("@typology/call/fetch reponse body parsing failed:", e.name);
    console.log(url, response);
  }

  ctx.response = {
    status: response.status,
    headers: response.headers,
    body: responsebody,
  };

  return ctx;
};

export default vfetch;
