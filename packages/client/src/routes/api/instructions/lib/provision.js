import Mustache from "mustache";
import * as ebisu from "$lib/ebisu";
import * as lib from "$lib";

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const QueueProvisioningLock = new Map();

export default async (props) => {
    if (QueueProvisioningLock.has(`${props.userId}-${props.strategyId}`)) {
        return { status: 202 };
    } else {
        QueueProvisioningLock.set(`${props.userId}-${props.strategyId}`, new Date());
        makeInstructions(props);
        return { status: 202 };
    }
};

const makeInstructions = async ({
    strategyId,
    blacklist,
    userId,
    locals,
    dry = false,
    local = false
}) => {
    const start = performance.now();

    try {
        // GET DATA
        const { data: strategy, error } = await locals.supabase
            .from("Strategy")
            .select(
                `*,
                _StrategyToGame (Game: A (*)),
                _StrategyToUnit (Unit: B (*, Memory (id, state, type, status, lastSeen, userId, Tag (id), Unit(id) ))),
                _StrategyToTag (Tag: B (*, Memory (id, state, type, status, lastSeen, userId, Tag (id), Unit(id) )))`
            ) // might be able to remove a memory from the tag
            .eq("id", strategyId)
            .eq("_StrategyToUnit.Unit.Memory.userId", userId)
            .eq("_StrategyToTag.Tag.Memory.userId", userId)
            .single();

        if (error) throw error;

        const { data: queue = [] } = await locals.supabase
            .from("Queue")
            .select("data")
            .eq("strategyId", strategyId)
            .eq("userId", userId);

        queue.map(({ data }) => data.payload.blacklist.forEach((id) => blacklist.push(id)));

        strategy.Units = strategy._StrategyToUnit.map(({ Unit }) => {
            Unit.Memory = Unit.Memory.filter((m) => !m.Tag)[0];

            if (Unit.Memory)
                Unit.Memory.strength = ebisu.predictRecall(
                    Unit.Memory.state,
                    new Date() - new Date(Unit.Memory.lastSeen)
                );
            return Unit;
        });

        strategy.Tags = strategy._StrategyToTag.map(({ Tag }) => {
            Tag.Memory = Tag.Memory.filter((m) =>
                strategy.Units.map((u) => u.id).includes(m.Unit.id)
            ).map((m) => {
                m.strength = ebisu.predictRecall(m.state, new Date() - new Date(m.lastSeen));
                return m;
            });
            return Tag;
        });

        strategy.Games = strategy._StrategyToGame.map(({ Game }) => Game);

        delete strategy._StrategyToUnit;
        delete strategy._StrategyToTag;
        delete strategy._StrategyToGame;
        locals.Mustache = Mustache;

        const context = {
            blacklist,
            userId,
            strategyId,
            language: { learning: "spanish", spoken: "english" }
        };
        locals.ebisu = ebisu;
        locals.shuffle = lib.shuffleArray;

        const strategyProvisioning =
            local || new Function(`return ${strategy.data.provisioning}`)();

        const instructions = await strategyProvisioning({ locals, strategy, context });

        // PERSIST INSTRUCTIONS
        if (!dry) {
            const insert = await locals.supabase
                .from("Queue")
                .insert(instructions.map((data, index) => ({ userId, strategyId, data, index })));
            if (insert.error) throw insert.error;
        }

        const end = performance.now();
        console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
        return instructions;
    } catch (error) {
        console.error(`[PROVISIONING ERROR]`, error.message);
        console.error(error);
    } finally {
        QueueProvisioningLock.delete(`${userId}-${strategyId}`);
    }
};
