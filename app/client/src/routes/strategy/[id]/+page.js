import path from "path";
import store from "./store.js";

export const load = async (props) => {
    await store.init({ strategyId: props.params.id, fetch: props.fetch });
};
