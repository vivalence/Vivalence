import { dataProvider as baseDataProvider } from "@refinedev/supabase";
import { supabaseClient } from "../utility/supabaseClient";

export default (supabaseClient) => {
  const baseData = baseDataProvider(supabaseClient);

  return {
    ...baseData,
    getList: async (params) => {
      const list = await baseData.getList(params);
      return list;
      // if (params.resource === "AppUser") {const ids = list.data.map((item) => item.id); const { data, error } = await supabaseClient .from("auth_users") .select("id, email") .in("id", ids); if (error) return list; const mergedList = list.data.map((item) => {const additionalDetails = data.find((d) => d.id === item.id); return { ...item, ...additionalDetails };}); return { ...list, data: mergedList };} else {console.log("list", list); return list;}
    },
    getOne: async (params) => {
      const oneResource = await baseData.getOne(params);

      if (params.resource === "Strategy") {
        // console.log("oneResource", oneResource);
        const { data, error } = await supabaseClient
          .from("_AppUserToStrategy")
          .select(`*, AppUser:AppUser(*)`)
          .eq("B", oneResource.data.id);

        if (error) return { ...oneResource, error };
        return {
          ...oneResource,
          data: {
            ...oneResource.data,
            users: data.map((d) => d.AppUser),
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

        if (errorTag) return { ...oneResource, error: errorTag };
        return {
          ...oneResource,
          data: {
            ...oneResource.data,
            tags: tags.map((d) => d.Unit),
          },
        };
      }

      return oneResource;
    },
    // default: baseData.custom, // @lf typesystem weirdness
  };
};
