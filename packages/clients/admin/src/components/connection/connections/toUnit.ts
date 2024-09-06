import supabase from "$util/supabaseClient";
import { type Game, type Strategy, type Tag, type User } from "$types/index";
import { type ConnectionTypeMethods } from "../types";

export const StrategyToUnit: ConnectionTypeMethods<Unit> = {
  variableResourceKey: "Unit",
  map: (all) =>
    all
      .map((data) => ({
        value: data.id,
        label: data.data.spanish,
        link: `/unit/edit/${data.id}`,
        data,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  filter: (all) => (searchText) =>
    all.filter(({ data }) => {
      return (
        data.data.spanish.toLowerCase().includes(searchText.toLowerCase()) ||
        data.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }),
  create: async (option, rootResourceId) =>
    await supabase.from("_StrategyToUnit").insert([{ B: option.data.id, A: rootResourceId }]),
  remove: async (option, rootResourceId) =>
    await supabase.from("_StrategyToUnit").delete().eq("A", rootResourceId).eq("B", option.data.id),
};
export const TagToUnit: ConnectionTypeMethods<Unit> = {
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
        data.data.english.toLowerCase().startsWith(searchText.toLowerCase()) ||
        data.data.spanish.toLowerCase().startsWith(searchText.toLowerCase()),
      // data.id.toLowerCase().includes(searchText.toLowerCase()),
    ),
  // sort: (all) => all.sort((a, b) => a.data.index - b.data.index),
  create: async (option, rootResourceId) =>
    await supabase.from("_TagToUnit").insert([
      {
        A: rootResourceId,
        B: option.data.id,
      },
    ]),
  remove: async (option, rootResourceId) =>
    await supabase.from("_TagToUnit").delete().eq("A", rootResourceId).eq("B", option.data.id),
};
