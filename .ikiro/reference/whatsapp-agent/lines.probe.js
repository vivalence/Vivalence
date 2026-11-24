import { Queue } from "@vivalence/typology";

const lines = new Map();

const line = (number) => lines.get(number) ?? lines.set(number, new Queue()).get(number);

const sorted = (payload) =>
  payload.entry
    .flatMap((entry) => entry.changes)
    .filter((change) => lines.has(change.value.metadata.phone_number_id))
    .forEach((change) =>
      lines
        .get(change.value.metadata.phone_number_id)
        .enqueue({ entry: [{ changes: [change] }] }),
    );

const delivery = (number, text) => ({
  entry: [
    {
      changes: [
        {
          value: {
            metadata: { phone_number_id: number },
            messages: [{ from: "4915100000000", id: `wamid.${text}`, text: { body: text } }],
          },
        },
      ],
    },
  ],
});

const heard = { prod: [], test: [] };
const release = new AbortController();
const pull = async (name, number) => {
  for await (const payload of line(number).drain(release.signal))
    heard[name].push(payload.entry[0].changes[0].value.messages[0].text.body);
};
const pulls = [pull("prod", "1512293525294016"), pull("test", "1523650714157685")];

sorted(delivery("1512293525294016", "to-prod"));
sorted(delivery("1523650714157685", "to-test"));
sorted(delivery("999", "to-nobody"));
await new Promise((done) => setTimeout(done, 50));
release.abort();
await Promise.allSettled(pulls);
console.log(heard, "lines", [...lines.keys()]);
