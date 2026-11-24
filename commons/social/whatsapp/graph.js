export const answered = async (response) => {
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
      call(number, {
        webhook_configuration: { override_callback_uri: hook, verify_token: verify },
      }),
    media: (id) => call(id),
    text: (address, body) =>
      call(`${number}/messages`, {
        messaging_product: "whatsapp",
        to: address,
        type: "text",
        text: { body },
      }),
    typing: (message) =>
      call(`${number}/messages`, {
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
        typing_indicator: { type: "text" },
      }),
  };
};
