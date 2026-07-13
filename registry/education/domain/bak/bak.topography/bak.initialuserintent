// import { IntentEntity } from "@vivalence/entities";
export const manifest = {
  type: "dataset",
  traits: ["REACTIVE"],
};

const data = {
  intents: [
    {
      traits: ["RESOLVED"],
      data: {
        RESOLVED: {
          path: "/strategy/eva",
        },
      },
    },
  ],
};

export function react(to) {
  to.branch("/user") //
    .open("/create/after", (ctx) => {
      data.intents.map(({ traits, data }) => {
        const intent = new IntentEntity();
        intent.traits = traits;
        intent.data = data;
        intent.user = ctx.event.entity.id;
        ctx.runtime.entities.em.persist(intent);
      });
    });
}
