import supabase from "$util/supabaseClient";
import { type User, type Strategy, type Tag, type Game } from "$types/index";
import { type ConnectionTypeMethods } from "../types";

export const UserToStrategy: ConnectionTypeMethods<Strategy> = {
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
};

export const GameToStrategy = {
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
};
export const TagToStrategy = {
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
};
export const UnitToStrategy = {
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
            .from("_StrategyToUnit")
            .insert([{ A: option.data.id, B: rootResourceId }]),
    remove: async (option, rootResourceId) =>
        await supabase
            .from("_StrategyToUnit")
            .delete()
            .eq("B", rootResourceId)
            .eq("A", option.data.id),
};
