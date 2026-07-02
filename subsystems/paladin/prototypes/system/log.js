export class Log {
  constructor(paladin, instance) {
    this.paladin = paladin;
    this.base = paladin.scope.ledger.branch(`/logs/${instance}`);
  }

  append(span) {
    return this.paladin.state.jsonl(this.base.branch("spans.jsonl"), span.json);
  }

  open(process, stream) {
    return this.paladin.state.open(this.base.branch(`${process}.${stream}.log`));
  }
}
