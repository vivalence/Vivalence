import supabase from "$util/supabaseClient";
import { type User, type Strategy, type Tag, type Game } from "$types/index";

export interface ConnectionTypeMethods<T extends Resource> {
    variableResourceKey: string;
    map: (items: T[]) => OptionType<T>[];
    filter: (all: OptionType<T>[]) => (searchText: string) => OptionType<T>[];
    create: (option: OptionType<T>, rootResourceId: string) => Promise<any>;
    remove: (option: OptionType<T>, rootResourceId: string) => Promise<any>;
}

export interface ConnectionTypesInterface {
    UserToStrategy: ConnectionTypeMethods<Strategy>;
    StrategyToUser: ConnectionTypeMethods<User>;
    StrategyToTag: ConnectionTypeMethods<Tag>;
    StrategyToGame: ConnectionTypeMethods<Game>;
    GameToStrategy: ConnectionTypeMethods<Strategy>;
    TagToStrategy: ConnectionTypeMethods<Strategy>;
    TagToUnit: ConnectionTypeMethods<Unit>;
    UnitToTag: ConnectionTypeMethods<Tag>;
}

export const ConnectionTypes: ConnectionTypesInterface = {
    UserToStrategy: {
        variableResourceKey: "Strategy",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: data.name,
                    link: `/strategy/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase
                .from("_AppUserToStrategy")
                .insert([{ B: option.data.id, A: rootResourceId }]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_AppUserToStrategy")
                .delete()
                .eq("B", option.data.id)
                .eq("A", rootResourceId),
    },
    StrategyToUser: {
        variableResourceKey: "AppUser",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: data.email,
                    link: `/user/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.email.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase
                .from("_AppUserToStrategy")
                .insert([{ A: option.data.id, B: rootResourceId }]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_AppUserToStrategy")
                .delete()
                .eq("A", option.data.id)
                .eq("B", rootResourceId),
    },
    StrategyToTag: {
        variableResourceKey: "Tag",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: `${data.type.join(", ")} - ${data.name}`,
                    link: `/tag/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase.from("_StrategyToTag").insert([
                {
                    A: rootResourceId,
                    B: option.data.id,
                },
            ]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_StrategyToTag")
                .delete()
                .eq("A", rootResourceId)
                .eq("B", option.data.id),
    },
    StrategyToGame: {
        variableResourceKey: "Game",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: data.name,
                    link: `/game/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase.from("_StrategyToGame").insert([
                {
                    B: rootResourceId,
                    A: option.data.id,
                },
            ]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_StrategyToGame")
                .delete()
                .eq("B", rootResourceId)
                .eq("A", option.data.id),
    },
    GameToStrategy: {
        variableResourceKey: "Strategy",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: data.name,
                    link: `/strategy/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase.from("_StrategyToGame").insert([
                {
                    B: option.data.id,
                    A: rootResourceId,
                },
            ]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_StrategyToGame")
                .delete()
                .eq("B", option.data.id)
                .eq("A", rootResourceId),
    },
    TagToStrategy: {
        variableResourceKey: "Strategy",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: data.name,
                    link: `/strategy/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase.from("_StrategyToTag").insert([
                {
                    A: option.data.id,
                    B: rootResourceId,
                },
            ]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_StrategyToTag")
                .delete()
                .eq("A", option.data.id)
                .eq("B", rootResourceId),
    },
    TagToUnit: {
        variableResourceKey: "Unit",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: `${data.data.spanish} - ${data.data.english}`,
                    link: `/unit/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    // data.data.english.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.data.spanish.toLowerCase().includes(searchText.toLowerCase()),
                // data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase.from("_TagToUnit").insert([
                {
                    A: rootResourceId,
                    B: option.data.id,
                },
            ]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_TagToUnit")
                .delete()
                .eq("A", rootResourceId)
                .eq("B", option.data.id),
    },
    UnitToTag: {
        variableResourceKey: "Tag",
        map: (all) =>
            all
                .map((data) => ({
                    value: data.id,
                    label: data.name,
                    link: `/tag/edit/${data.id}`,
                    data,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        filter: (all) => (searchText) =>
            all.filter(
                ({ data }) =>
                    data.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    data.id.toLowerCase().includes(searchText.toLowerCase()),
            ),
        create: async (option, rootResourceId) =>
            await supabase.from("_TagToUnit").insert([
                {
                    A: option.data.id,
                    B: rootResourceId,
                },
            ]),
        remove: async (option, rootResourceId) =>
            await supabase
                .from("_TagToUnit")
                .delete()
                .eq("A", option.data.id)
                .eq("B", rootResourceId),
    },
};
