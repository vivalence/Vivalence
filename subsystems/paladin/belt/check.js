import { v } from "@vivalence/typology";

const WRONG = ["UNDOCUMENTED", "REQUIRED", "INVALID"];

export default function check(config) {
  const createResult = (issues, input) => {
    const result = Array.isArray(issues) ? issues : [issues];
    result.fails = result.length > 0;
    result.throw = (EP = null) => {
      if (!result.fails) return;
      const messages = result.map((issue) => issue.message).join("; ");
      console.log(`[CONFIG.CHECK ERROR]`, { input, result, messages });
      throw new (EP || Error)(messages);
    };
    return result;
  };

  const envValidator = (key) => {
    const value = config.env.get(key) || config.env.secrets?.get(key);

    if (!value) {
      return {
        type: "env",
        key,
        message: `Environment variable ${key} is missing`,
      };
    }

    return null;
  };

  const pathValidator = (path) => {
    const resolvedPath = typeof path === "function" ? path() : path;

    try {
      Deno.statSync(resolvedPath);
      return null;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return {
          type: "path",
          path: resolvedPath,
          message: `Path ${resolvedPath} does not exist`,
        };
      }
      throw error;
    }
  };

  // the authored schema against what the thunks were observed to read.
  const environment = (instance) => {
    const schema = instance.environment?.properties ?? {};
    const rows = [];
    const seen = new Set();

    // a secret is reported as PRESENT or absent, never as itself. everything else shows the
    // RESOLVED value — the raw ${...} source text is already in the scope's own vars.
    const raw = (key) => (key.startsWith("SECRET_") ? config.secret.get(key) : config.env.get(key));
    const reading = (key) =>
      key.startsWith("SECRET_")
        ? { value: config.secret.get(key) ? "***" : null, stratum: config.secret.provenance(key) }
        : { value: config.env.get(key), stratum: config.env.provenance(key) };
    const blank = (value) => value === null || value === undefined || value === "";
    const invalid = (key) => {
      const held = schema[key];
      const value = raw(key);
      if (!held || blank(value)) return null;
      const failure = [...v.errors(held, v.convert(held, value))][0];
      if (!failure) return null;
      return failure.keyword === "pattern" && held.title ? `must be ${held.title}` : failure.message;
    };
    const row = (key, at, held) => ({
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

    for (const entry of instance.requirements ?? []) {
      for (const key of entry.read) {
        seen.add(key);
        const held = schema[key];
        const shaped = row(key, entry.at, held);
        rows.push({ ...shaped, verdict: verdict(held, entry.unset.includes(key), shaped.reason) });
      }
    }

    // SUPERSEDED — an UNREAD verdict with a `consumer:` escape hatch. wrong for 5 of 17 keys.
    // for (const [key, held] of Object.entries(schema)) {
    //   if (seen.has(key)) continue;
    //   rows.push({ key, at: held.consumer ? `consumer:${held.consumer}` : null,
    //               verdict: held.consumer ? "external" : "UNREAD", ... });
    // }
    // rows.fails = rows.some((row) => ["UNDOCUMENTED", "UNREAD", "REQUIRED"].includes(row.verdict));

    for (const [key, held] of Object.entries(schema)) {
      if (seen.has(key)) continue;
      const shaped = row(key, null, held);
      const unset = blank(raw(key));
      rows.push({
        ...shaped,
        verdict: shaped.reason
          ? "INVALID"
          : unset && !v.isOptional(held)
            ? "REQUIRED"
            : "documented",
      });
    }

    rows.sort((a, b) => a.key.localeCompare(b.key) || (a.at ?? "").localeCompare(b.at ?? ""));
    rows.fails = rows.some((held) => WRONG.includes(held.verdict));
    return rows;
  };

  config.check = {
    environment,
    wrong: WRONG,
    env: (input) => {
      const keys = Array.isArray(input) ? input : [input];
      const issues = keys.map(envValidator).filter(Boolean);
      return createResult(issues, input);
    },

    path: (input) => {
      const paths = Array.isArray(input) ? input : [input];
      const issues = paths.map(pathValidator).filter(Boolean);

      return createResult(issues, input);
    },
  };
}

// export default function check(config) {
//   const createChecker = (validator) => (constraints) => {
//     const results = [];

//     for (const constraint of constraints) {
//       const result = validator(constraint);

//       if (!result.valid && result.required) {
//         results.push(result);
//       }
//       // if (!result.valid && result.required) {throw new Error(`Constraint failed: ${result.message}`);}
//     }

//     return results;
//   };

//   const envValidator = (constraint) => {
//     if (typeof constraint === "string") constraint = { key: constraint };
//     const { key, required = true, type = "string", message } = constraint;
//     const value = config.env.get(key) || config.env.secrets?.get(key);

//     const result = {
//       key,
//       value,
//       required,
//       valid: false,
//       message: message || `Environment variable ${key} is missing or invalid`,
//     };

//     if (!value && required) {
//       return result;
//     }

//     if (!value && !required) {
//       result.valid = true;
//       return result;
//     }

//     // Type validation
//     switch (type) {
//       case "string":
//         result.valid = typeof value === "string" && value.length > 0;
//         break;
//       case "number":
//         result.valid = !isNaN(Number(value));
//         break;
//       case "boolean":
//         result.valid = ["true", "false", "1", "0"].includes(
//           value.toLowerCase(),
//         );
//         break;
//       default:
//         result.valid = true;
//     }

//     return result;
//   };

//   const pathValidator = (constraint) => {
//     if (typeof constraint === "string") constraint = { path: constraint };
//     const { path, required = true, type = "exists", message } = constraint;
//     const resolvedPath = typeof path === "function" ? path() : path;

//     const result = {
//       path: resolvedPath,
//       required,
//       valid: false,
//       message: message || `Path ${resolvedPath} constraint failed`,
//     };

//     try {
//       const stat = Deno.statSync(resolvedPath);

//       switch (type) {
//         case "exists":
//           result.valid = true;
//           break;
//         case "file":
//           result.valid = stat.isFile;
//           break;
//         case "directory":
//           result.valid = stat.isDirectory;
//           break;
//         default:
//           result.valid = true;
//       }
//     } catch (error) {
//       if (error instanceof Deno.errors.NotFound && !required) {
//         result.valid = true;
//       }
//     }

//     return result;
//   };

//   config.check = {
//     env: createChecker(envValidator),
//     path: createChecker(pathValidator),
//   };
// }
