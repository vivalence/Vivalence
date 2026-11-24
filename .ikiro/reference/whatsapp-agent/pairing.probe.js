export const pair = (owners, pending, message) =>
  message.text === pending.code
    ? { ...owners, [message.platform]: message.from }
    : owners;

const pending = { code: "viva-7403" };
const before = {};
const stranger = pair(before, pending, { platform: "whatsapp", from: "4917000000000", text: "hi" });
const whatsapp = pair(stranger, pending, { platform: "whatsapp", from: "4915100000000", text: "viva-7403" });
const telegram = pair(whatsapp, pending, { platform: "telegram", from: "88120044", text: "viva-7403" });
console.log(JSON.stringify([before, stranger, whatsapp, telegram]));
