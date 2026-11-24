import { is, v } from "@vivalence/typology";

const WRONG = ["UNDOCUMENTED", "REQUIRED", "INVALID"];

export const check = (paladin) => {
  const result = (issues, input) => {
    const held = Array.isArray(issues) ? issues : [issues];
    held.fails = held.length > 0;
    held.throw = (EP = null) => {
      if (!held.fails) return;
      const messages = held.map((issue) => issue.message).join("; ");
      console.log(`[CONFIG.CHECK ERROR]`, { input, result: held, messages });
      throw new (EP || Error)(messages);
    };
    return held;
  };

  paladin.check = {
    wrong: WRONG,

    env: (input) => {
      const keys = Array.isArray(input) ? input : [input];
      const issues = keys
        .filter((key) => !(paladin.env.get(key) || paladin.env.secrets?.get(key)))
        .map((key) => ({
          type: "env",
          key,
          message: `Environment variable ${key} is missing`,
        }));
      return result(issues, input);
    },

    environment: (instance) => {
      const schema = instance.environment?.properties ?? {};
      const raw = (key) =>
        key.startsWith("SECRET_") ? paladin.secret.get(key) : paladin.env.get(key);
      const reading = (key) =>
        key.startsWith("SECRET_")
          ? {
              value: paladin.secret.get(key) ? "***" : null,
              stratum: paladin.secret.provenance(key),
            }
          : { value: paladin.env.get(key), stratum: paladin.env.provenance(key) };
      const invalid = (key) => {
        const held = schema[key];
        const value = raw(key);
        if (!held || is.empty(value)) return null;
        return v.faults(held, v.convert(held, value))[0]?.reason ?? null;
      };
      const shape = (key, at, held) => ({
        key,
        at,
        ...reading(key),
        describe: held?.description ?? null,
        group: held?.group ?? null,
        required: held ? !v.isOptional(held) : null,
        reason: invalid(key),
      });
      const verdict = (held, unset, reason) =>
        !held
          ? "UNDOCUMENTED"
          : !unset
            ? reason
              ? "INVALID"
              : "ok"
            : v.isOptional(held)
              ? "optional"
              : "REQUIRED";

      const read = instance.paladin.requirements.flatMap((entry) =>
        entry.read.map((key) => {
          const shaped = shape(key, entry.at, schema[key]);
          return {
            ...shaped,
            verdict: verdict(schema[key], entry.unset.includes(key), shaped.reason),
          };
        }),
      );
      const seen = new Set(read.map((held) => held.key));
      const documented = Object.entries(schema)
        .filter(([key]) => !seen.has(key))
        .map(([key, held]) => {
          const shaped = shape(key, null, held);
          const unset = is.empty(raw(key));
          return {
            ...shaped,
            verdict: shaped.reason
              ? "INVALID"
              : unset && !v.isOptional(held)
                ? "REQUIRED"
                : "documented",
          };
        });

      const verdicts = [...read, ...documented].sort(
        (a, b) => a.key.localeCompare(b.key) || (a.at ?? "").localeCompare(b.at ?? ""),
      );
      verdicts.fails = verdicts.some((held) => WRONG.includes(held.verdict));
      return verdicts;
    },

    instance: (held) => {
      const wrong = paladin.check
        .environment(held)
        .filter((entry) => WRONG.includes(entry.verdict));
      const named = new Set(wrong.map((entry) => entry.at));
      const faults = held.paladin.faults
        .filter((fault) => ![...named].some((at) => at && fault.startsWith(`${at} `)))
        .map((message) => ({ type: "instance", message }));
      const issues = wrong.map((entry) => {
        const at = entry.at ? ` at ${entry.at}` : "";
        const reason = entry.reason ? ` — ${entry.reason}` : "";
        const message = `${entry.key} ${entry.verdict}${at}${reason}`;
        return { type: "env", key: entry.key, message };
      });
      return result([...faults, ...issues], "viva instance/doctor");
    },
  };
};
