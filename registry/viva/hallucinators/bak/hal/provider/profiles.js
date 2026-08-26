import { createAnthropic } from "@ai/providers/anthropic";
import {
  customProvider,
  wrapLanguageModel,
  defaultSettingsMiddleware,
} from "@ai/sdk";
import Providers from "./providers.js";

const profiles = (slug, config, registry) => {
  const provider = registry[config.provider];

  return customProvider({
    [slug]: wrapLanguageModel({
      model: provider(config.model),
      middleware: defaultSettingsMiddleware({
        settings: {
          maxTokens: 100000,
          providerMetadata: {
            [config.provider]: {
              thinking: {
                type: "enabled",
                budgetTokens: 32000,
              },
            },
          },
        },
      }),
    }),
    fallbackProvider: provider,
  });
};
export default profiles;
