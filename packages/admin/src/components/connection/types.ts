import { type Resource } from "$types/index";

export interface OptionType<T extends Resource> {
    value: string;
    label: string;
    link: string;
    data: T;
}

export interface RefHandles {
    added: () => OptionType<any>[];
    removed: () => OptionType<any>[];
}
