import paladin from "@vivalence/paladin";

const encoder = new TextEncoder();

export const ledger = async (shellDie, next) => {
  const file = await paladin.ledger.log(shellDie.instance.manifest.slug).open("ghost", "spans");
  const untap = shellDie.controller.stdout.pipe.tap((record) => file.writeSync(encoder.encode(`${JSON.stringify(record)}\n`)));
  try {
    await next();
  } finally {
    untap();
    file.close();
  }
};
