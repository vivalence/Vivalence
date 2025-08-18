export default function check(config) {
  const createResult = (issues) => {
    const result = Array.isArray(issues) ? issues : [issues];
    result.throw = () => {
      if (result.length > 0) {
        const messages = result.map((issue) => issue.message).join("; ");
        throw new Error(messages);
      }
    };
    return result.length > 0 ? result : null;
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

  config.check = {
    env: (input) => {
      const keys = Array.isArray(input) ? input : [input];
      const issues = keys.map(envValidator).filter(Boolean);
      return createResult(issues);
    },

    path: (input) => {
      const paths = Array.isArray(input) ? input : [input];
      const issues = paths.map(pathValidator).filter(Boolean);
      return createResult(issues);
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
