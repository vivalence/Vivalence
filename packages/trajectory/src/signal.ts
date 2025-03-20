export class Signal<T = any> {
  readonly type: string;
  readonly value: T;

  constructor(type: string, value: T) {
    this.type = type;
    this.value = value;
  }
}
