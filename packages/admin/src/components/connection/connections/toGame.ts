import supabase from "$util/supabaseClient";
import { type User, type Strategy, type Tag, type Game } from "$types/index";
import { type ConnectionTypeMethods } from "../types";

export const StrategyToGame: ConnectionTypeMethods<Game> = {
    variableResourceKey: "Game",
    map: (all) =>
        all
            .map((data) => ({
                value: data.id,
                // label: data.name,
                label: `${data.type} - ${data.name}`,

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
};
