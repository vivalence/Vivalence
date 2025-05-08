import createLLMService from "./service.js";
import providers from "./providers/index.js";

export default async function setupLLMService(service, ctx) {
  const llmService = createLLMService();

  Object.entries(service.config.providers).map(([provider, key]) => {
    llmService.registerProvider(provider, providers[provider](key));
  });
  Object.entries(service.config.profiles).map(([profile, config]) => {
    llmService.registerProfile(profile, config);
  });

  async function serve(inputs) {
    return await llmService.prompt({
      prompt: inputs.prompt,
      schema: inputs.schema,
      provider: inputs.provider.api,
      model: inputs.provider.model,
      params: {
        temperature: inputs.provider.temperature,
        max_tokens: inputs.provider.max_tokens,
      },
    });
  }

  serve.profiles = Object.fromEntries(
    llmService.getAllProfiles().map((profile) => [
      profile.name,
      {
        provider: profile.provider,
        model: profile.model,
        key: service.config.providers[profile.provider],
        ...profile.params,
      },
    ]),
  );

  return serve;
}
