import { dataProvider as baseDataProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility/supabaseClient";

export default (supabaseClient) => {
    const baseData = baseDataProvider(supabaseClient);

    return {
        ...baseData,
        getList: async (params) => {
            const list = await baseData.getList(params);
            if (params.resource === "AppUser") {
                const ids = list.data.map((item) => item.id);
                const { data, error } = await supabaseClient
                    .from("auth_users")
                    .select("id, email")
                    .in("id", ids);

                if (error) return list;

                const mergedList = list.data.map((item) => {
                    const additionalDetails = data.find((d) => d.id === item.id);
                    return { ...item, ...additionalDetails };
                });

                return { ...list, data: mergedList };
            } else {
                console.log("list", list);
                return list;
            }
        },
        getOne: async (params) => {
            const oneResource = await baseData.getOne(params);

            if (params.resource === "AppUser") {
                const { data, error } = await supabaseClient
                    .from("auth_users")
                    .select("id, email")
                    .eq("id", oneResource.data.id)
                    .single();
                if (error) return oneResource;
                return { ...oneResource, data: { ...oneResource.data, ...data } };
            } else {
                return oneResource;
            }
        },
        default: baseData.custom, // @lf typesystem weirdness
    };
};
