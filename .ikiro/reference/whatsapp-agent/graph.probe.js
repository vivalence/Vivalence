const answered = async (response) => {
  if (!response.ok) throw new Error(`whatsapp: ${response.status} ${await response.text()}`);
  return response;
};

export const graph = (service) => (path, body) =>
  fetch(`${service.statics.graph}/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${service.secrets.token}`,
      "content-type": "application/json",
    },
    body: body && JSON.stringify(body),
  })
    .then(answered)
    .then((response) => response.json());

export const meta = (service) => {
  const call = graph(service);
  const number = service.statics.number;
  return {
    state: () =>
      call(`${number}?fields=status,name_status,account_mode,quality_rating,webhook_configuration`),
    token: () => call(`debug_token?input_token=${service.secrets.token}`),
    claim: (hook, verify) =>
      call(number, { webhook_configuration: { override_callback_uri: hook, verify_token: verify } }),
    text: (address, body) =>
      call(`${number}/messages`, {
        messaging_product: "whatsapp",
        to: address,
        type: "text",
        text: { body },
      }),
  };
};

if (import.meta.main) {
  const env = Object.fromEntries(
    Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/instances/localhost/.env`)
      .split("\n")
      .filter((row) => /^[A-Z_]+=/.test(row))
      .map((row) => [row.slice(0, row.indexOf("=")), row.slice(row.indexOf("=") + 1)]),
  );
  const service = {
    statics: { graph: "https://graph.facebook.com/v26.0", number: env.VIVA_WHATSAPP_NUMBER_ID },
    secrets: { token: env.SECRET_VIVA_WHATSAPP_TOKEN },
  };
  const whatsapp = meta(service);
  console.log(await whatsapp.state());
  const { data } = await whatsapp.token();
  console.log({ valid: data.is_valid, minutes: Math.round((data.expires_at * 1000 - Date.now()) / 60000) });
  console.log(
    await meta({ ...service, secrets: { token: "wrong" } })
      .state()
      .catch((fault) => fault.message.slice(0, 90)),
  );
}
