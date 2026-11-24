import { shape } from "@vivalence/typology";
import { mode } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/tools/mode.js";

const stripped = shape.strip(mode);

const at = (nature) =>
  nature
    .split("/")
    .filter(Boolean)
    .reduce((node, segment) => node?.branches[segment], stripped);

export default {
  name: "viva",
  rules: {
    signal: {
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.type !== "Identifier" || node.callee.name !== "dispatch") return;
            const [signal, input] = node.arguments;
            if (signal?.type !== "Literal") return;
            const found = at(signal.value);
            if (!found?.effect) {
              context.report({ node: signal, message: `no route ${signal.value}` });
              return;
            }
            if (input?.type !== "ObjectExpression") return;
            const declared = Object.keys(found.effect.input.properties);
            for (const property of input.properties) {
              if (declared.includes(property.key.name)) continue;
              context.report({
                node: property.key,
                message: `${signal.value} takes ${declared.join(" · ")}, not ${property.key.name}`,
              });
            }
          },
        };
      },
    },
  },
};
