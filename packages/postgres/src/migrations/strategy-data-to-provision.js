import fs from "fs";
import supabase from "../clients/supabase.js";

async function scope() {
    const START = 0;
    const TAKE = 5000;
    const BATCHSIZE = 100;
    let index = START;

    const { data: strategies } = await supabase
        .from("Strategy")
        .select("*")
        .order("createdAt", { ascending: true });

    console.log(strategies.length);

    for (const strategy of strategies) {
        try {
            const data = strategy.data;
            const provision = { run: data.provisioning };
            delete data.provisioning;
            await supabase.from("Strategy").update({ data, provision }).eq("id", strategy.id);
        } catch (error) {
            if (error.code === "P2002") {
            } else {
                console.log("ERROR", error);
            }
        }
    }
}

await scope();
