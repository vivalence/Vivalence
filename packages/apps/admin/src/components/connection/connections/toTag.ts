import supabase from "$util/supabaseClient";
import { type User, type Strategy, type Tag, type Game } from "$types/index";
import { type ConnectionTypeMethods } from "../types";

export const UnitToTag: ConnectionTypeMethods<Tag> = {
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
};

export const StrategyToTag: ConnectionTypeMethods<Tag> = {
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
};
