export class Log {
  constructor(paladin, instance) {
    this.paladin = paladin;
    this.base = paladin.scope.ledger.branch(`/logs/${instance}`);
  }

  append(span) {
    return this.paladin.write.jsonl(this.base.branch("spans.jsonl"), span.json);
  }

  open(process, stream) {
    return this.paladin.write.open(this.base.branch(`${process}.${stream}.log`));
  }
}
