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

  let response;
  try {
    response = await fetch(url, options);
    // console.log({ url });
    // console.log({ url, response });
  } catch (error) {
    console.error("@call Error:", error.name);
    console.error(url, { options });
    console.error("@call", error);
    throw error;
  }

  let responsebody;
  try {
    responsebody = await response.json();
  } catch (error) {
    console.log(
      "@typology/call/fetch reponse body parsing failed:",
      error.name,
    );
    console.error(error);
    console.log({ url, response });
    throw error;
  }

  ctx.response = {
    status: response.status,
    headers: response.headers,
    body: responsebody,
  };

  return ctx;
};

export default vfetch;
