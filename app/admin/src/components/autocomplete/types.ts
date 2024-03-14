export interface OptionType<T> {
  value: string;
  label: string;
  data: T;
}

export interface RefHandles {
  added: () => OptionType<any>[];
  removed: () => OptionType<any>[];
}
