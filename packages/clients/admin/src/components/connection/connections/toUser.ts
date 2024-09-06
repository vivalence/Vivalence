import supabase from "$util/supabaseClient";
import { type Game, type Strategy, type Tag, type User } from "$types/index";
import { type ConnectionTypeMethods } from "../types";

export const StrategyToUser: ConnectionTypeMethods<User> = {
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
    await supabase.from("_AppUserToStrategy").insert([{ A: option.data.id, B: rootResourceId }]),
  remove: async (option, rootResourceId) =>
    await supabase
      .from("_AppUserToStrategy")
      .delete()
      .eq("A", option.data.id)
      .eq("B", rootResourceId),
};
