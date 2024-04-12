// @ts-nocheck
import { dataProvider as baseDataProvider } from "@refinedev/supabase";
import { supabaseClient } from "../utility/supabaseClient";

const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours
const Cache = new Map();

const getData = async (key, func) => {
    let cache = Cache.get(key);
    if (cache && new Date() - cache.time < MAX_AGE) {
        return cache.data;
    } else {
        const data = await func();
        const cache = {
            data,
            time: new Date(),
        };
        Cache.set(key, cache);
        return data;
    }
};

export default (supabaseClient) => {
    const baseData = baseDataProvider(supabaseClient);

    return {
        ...baseData,
        default: baseData,
        getList: async (params) => {
            const list = await getData(`${params.resource}-list`, () =>
                baseData.getList(params),
            );
            // console.log("params", params);
            // console.log("list", list);
            return list;
        },
        //     if (params.resource === "Tag") {const { data: units, error: errorUnit } = await supabaseClient .from("_TagToUnit") .select(`*, Unit:Unit(*)`) .eq("A", oneResource.data.id) .count(); console.log("tag", list); console.log("units", units); const ids = list.data.map((item) => item.id); const { data, error } = await supabaseClient .from("auth_users") .select("id, email") .in("id", ids); if (error) return list; const mergedList = list.data.map((item) => {const additionalDetails = data.find((d) => d.id === item.id); return { ...item, ...additionalDetails };}); return list; // , data: { units } };} else {console.log("list", list); return list;}},
        getOne: async (params) => {
            const oneResource = await baseData.getOne(params);
            // console.log("getOne resource", params.resource);

            if (params.resource === "AppUser") {
                const { data, error } = await supabaseClient
                    .from("_AppUserToStrategy")
                    .select(`*, Strategy:Strategy(id, name)`)
                    .eq("A", oneResource.data.id);

                if (error) return { ...oneResource, error };
                return {
                    ...oneResource,
                    data: {
                        ...oneResource.data,
                        strategies: data.map((d) => d.Strategy),
                    },
                };
            } else if (params.resource === "Strategy") {
                const { data: users, error: errorUser } = await supabaseClient
                    .from("_AppUserToStrategy")
                    .select(`*, AppUser:AppUser(*)`)
                    .eq("B", oneResource.data.id);
                if (errorUser) return { ...oneResource, error: errorUser };

                const { data: units, error: errorUnits } = await getData(
                    "StrategyToUnit",
                    () =>
                        supabaseClient
                            .from("_StrategyToUnit")
                            .select(`*, Unit:Unit(*)`)
                            .eq("A", oneResource.data.id),
                );
                if (errorUnits) return { ...oneResource, error: errorUnits };

                const { data: games, error: errorGame } = await supabaseClient
                    .from("_StrategyToGame")
                    .select(`*, Game:Game(id, name, type)`)
                    .eq("B", oneResource.data.id);
                if (errorGame) return { ...oneResource, error: errorGame };

                const { data: tags, error: errorTag } = await supabaseClient
                    .from("_StrategyToTag")
                    .select(`*, Tag:Tag(id, name, type)`)
                    .eq("A", oneResource.data.id);
                if (errorTag) return { ...oneResource, error: errorTag };

                return {
                    ...oneResource,
                    data: {
                        ...oneResource.data,
                        users: users.map((d) => d.AppUser),
                        units: units.map((d) => d.Unit),
                        games: games.map((d) => d.Game),
                        tags: tags.map((d) => d.Tag),
                    },
                };
            } else if (params.resource === "Tag") {
                const { data: units, error: errorUnit } = await supabaseClient
                    .from("_TagToUnit")
                    .select(`*, Unit:Unit(*)`)
                    .eq("A", oneResource.data.id);

                const { data: strategies, error: errorStrategy } = await supabaseClient
                    .from("_StrategyToTag")
                    .select(`*, Strategy:Strategy(*)`)
                    .eq("B", oneResource.data.id);

                if (errorStrategy || errorUnit)
                    return { ...oneResource, error: errorStrategy || errorUnit };

                return {
                    ...oneResource,
                    data: {
                        ...oneResource.data,
                        units: units.map((d) => d.Unit),
                        strategies: strategies.map((d) => d.Strategy),
                    },
                };
            } else if (params.resource === "Game") {
                const { data: strategies, error: errorTag } = await supabaseClient
                    .from("_StrategyToGame")
                    .select(`*, Strategy:Strategy(*)`)
                    .eq("A", oneResource.data.id);

                if (errorTag) return { ...oneResource, error: errorTag };
                return {
                    ...oneResource,
                    data: {
                        ...oneResource.data,
                        strategies: strategies.map((d) => d.Strategy),
                    },
                };
            } else if (params.resource === "Unit") {
                const { data: tags, error: errorTag } = await supabaseClient
                    .from("_TagToUnit")
                    .select(`*, Tag:Tag(*)`)
                    .eq("B", oneResource.data.id);

                const { data: strategies, error: errorStrategy } = await supabaseClient
                    .from("_StrategyToUnit")
                    .select(`*, Strategy:Strategy(*)`)
                    .eq("B", oneResource.data.id);

                if (errorTag) return { ...oneResource, error: errorTag };
                return {
                    ...oneResource,
                    data: {
                        ...oneResource.data,
                        strategies: strategies.map((d) => d.Strategy),
                        tags: tags.map((d) => d.Tag),
                    },
                };
            }

            return oneResource;
        },
    };
};
