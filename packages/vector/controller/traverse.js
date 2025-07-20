export function traverse(vector, signals) {
  let current = vector;
  let middlewares = [];

  for (const signal of signals) {
    middlewares.push(...current.middlewares);
    
    const match = current.match(signal);
    if (!match) throw new Error(`No match: ${signal.type}/${signal.value?.segment}`);
    
    if (match.effect) return compose(middlewares, match.effect);
    if (match.descendant) current = match.descendant;
  }
  
  throw new Error("No effect found");
}

function compose(middlewares, effect) {
  return async (input, context) => {
    let i = 0;
    
    async function next() {
      if (i >= middlewares.length) return effect(input, context);
      return middlewares[i++](input, context, next);
    }
    
    return next();
  };
// }
// export function traverse(vector, signals) {
//   if (!Array.isArray(signals)) {
//     signals = [signals];
//   }

//   let currentVector = vector;
//   let middlewareStack = [];

//   for (const signal of signals) {
//     middlewareStack = [...middlewareStack, ...currentVector.middlewares];

//     let match = null;

//     for (const [pattern, effect] of currentVector.effects.entries()) {
//       const patternMatch = pattern.match(signal);
//       if (patternMatch !== null) {
//         match = { effect, pattern, match: patternMatch, signal };
//         break;
//       }
//     }

//     if (!match) {
//       for (const [pattern, descendant] of currentVector.descendants.entries()) {
//         const patternMatch = pattern.match(signal);
//         if (patternMatch !== null) {
//           match = { descendant, pattern, match: patternMatch, signal };
//           break;
//         }
//       }
//     }

//     if (!match) {
//       if (!currentVector.types.includes(signal.type)) {
//         throw new Error(`Pattern type not found: ${signal.type}`);
//       }
//       throw new Error(
//         `No pattern matched for signal: ${JSON.stringify(signal)}`,
//       );
//     }

//     if (match.effect) {
//       return composeEffect(middlewareStack, match.effect);
//     } else if (match.descendant) {
//       currentVector = match.descendant;
//     }
//   }

//   throw new Error("Traversal completed without finding an effect");
// }

// function composeEffect(middlewares, effect) {
//   if (middlewares.length === 0) {
//     return async (context) => {
//       const input = context.input || {};
//       const result = await effect(input, context);
//       context.effect = result;
//       return result;
//     };
//   }

//   return async (context) => {
//     const input = context.input || {};
//     let index = -1;

//     async function dispatch(i) {
//       if (i <= index) {
//         throw new Error("next() called multiple times");
//       }

//       index = i;

//       let fn = middlewares[i];
//       if (i === middlewares.length) {
//         const result = await effect(input, context);
//         context.effect = result;
//         return result;
//       }

//       if (!fn) return;

//       return await fn(input, context, () => dispatch(i + 1));
//     }

//     return await dispatch(0);
//   };
// }
