# AI SDK llmtxt

## Tools (40%)

```ts
import { tool } from 'ai'; import { z } from 'zod';
const weatherTool = tool({
  description: 'Get weather',
  inputSchema: z.object({ location: z.string().describe('City') }),
  execute: async ({ location }) => ({ temp: 72 }),
  strict: true, // enforce schema
  needsApproval: true, // or async fn
  inputExamples: [{ input: { location: 'SF' } }],
});
```

**Multi-step**: `stopWhen: stepCountIs(5)`, `hasToolCall('name')`, custom conditions
**Choice**: `toolChoice: 'auto'|'required'|'none'|{type:'tool',toolName:'x'}`
**Callbacks**: `onStepFinish`, `prepareStep({ steps }) => ({ model, tools })`
**Dynamic**: `dynamicTool({ name, description, inputSchema, execute })`
**Context**: `execute: async (args, { toolCallId, messages, abortSignal })`
**Lifecycle**: `onInputStart`, `onInputDelta`, `onInputAvailable`
**Types**: `ToolCallUnion<typeof tools>`, `ToolResultUnion<typeof tools>`
**Errors**: `NoSuchToolError`, `InvalidToolInputError`, `experimental_repairToolCall`
**Active**: `activeTools: ['tool1', 'tool2']`
**Multi-modal**: Return `{ text, image }` or use `toModelOutput()`

**Approval UI** (useChat):
```ts
const { addToolApprovalResponse } = useChat();
// Check part.type === 'tool-approval-request'
addToolApprovalResponse(toolCallId, approved);
// Auto: sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses
```

**Provider Tools**:
- Anthropic: `anthropic.tools.memory()`, `.search()`, `.codeExecution()`
- OpenAI: `openai.tools.localShell()`, `.patch()`, MCP
- Google: `google.tools.maps()`, `.rag()`, `.fileSearch()`
- xAI: `xai.tools.webSearch()`, `.xSearch()`, `.codeExecution()`

**MCP**:
```ts
import { experimental_createMCPClient as createMCPClient, Experimental_StdioMCPTransport } from 'ai';
const client = await createMCPClient({
  transport: new Experimental_StdioMCPTransport({
    command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/path']
  })
});
const tools = await client.tools(); // or .tools({ name: { description, inputSchema } })
const resources = await client.resources.list(); // app-controlled
const content = await client.resources.read({ uri });
const prompts = await client.prompts.get({ name, args });
await client.close();
```

## Agents

```ts
import { ToolLoopAgent, stepCountIs, hasToolCall } from 'ai';
const agent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4.5',
  instructions: 'System prompt',
  tools: { weather, calc },
  toolChoice: 'auto',
  stopWhen: [stepCountIs(20), hasToolCall('done')],
  output: Output.object({ schema }),
  prepareStep: ({ steps }) => ({ model, tools, activeTools }),
  onStepFinish: ({ text, toolCalls, finishReason }),
  callOptionsSchema: z.object({ userId: z.string() }),
  prepareCall: ({ callOptions }) => ({ tools }),
});

const result = await agent.generate({ prompt }); // or .stream()
// result: { text, usage, steps, response }
```

**Types**: `InferAgentUIMessage<typeof agent>`
**UI**: `createAgentUIStreamResponse({ agent, messages })`
**Custom**: Implement `Agent` interface

## Core Functions

```ts
import { generateText, streamText, Output } from 'ai';

// Non-streaming
const { text, usage, finishReason, steps } = await generateText({
  model: 'openai/gpt-5',
  prompt: 'text', // or messages: [...]
  system: 'System prompt',
  tools: { weather },
  stopWhen: stepCountIs(3),
  output: Output.object({ schema: z.object({ name: z.string() }) }),
  onFinish: ({ text, usage }),
});

// Streaming
const result = streamText({ model, prompt });
for await (const chunk of result.textStream) process.stdout.write(chunk);
// or: result.fullStream for events
const { text } = await result.content;
```

**Structured Output**:
- `Output.object({ schema })` - single object
- `Output.array({ schema })` - array
- `Output.choice({ schema })` - options
- `Output.json({ schema })` - raw JSON
- `Output.text()` - plain text

**Streaming**: `streamObject({ model, output, prompt })` → `partialObjectStream`

**Callbacks**: `onChunk`, `onFinish`, `onError`, `prepareStep`

## UI Hooks

```ts
// Chat
const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop, reload, sendMessage, addToolApprovalResponse } = useChat({ api: '/api/chat' });
// Auto-submit: sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls

// Completion
const { completion, input, handleInputChange, handleSubmit, complete, stop } = useCompletion({ api: '/api/completion' });

// Object
const { object, submit, isLoading } = useObject({ api: '/api/object', schema });
```

**Frameworks**: React, Svelte (`@ai-sdk/svelte`), Vue, Angular, SolidJS

**Tool Parts** (messages):
```ts
message.parts.forEach(part => {
  if (part.type === 'tool-invocation') {
    if (part.state === 'output-available') console.log(part.result);
  }
});
```

## Middleware

```ts
import { wrapLanguageModel, extractReasoningMiddleware, defaultSettingsMiddleware, addToolInputExamplesMiddleware } from 'ai';

const model = wrapLanguageModel({
  model: openai('gpt-5'),
  middleware: [loggingMiddleware, ragMiddleware], // or single
});
```

**Built-in**: `extractReasoningMiddleware({ tagName })`, `simulateStreamingMiddleware()`, `defaultSettingsMiddleware({ settings })`, `addToolInputExamplesMiddleware()`

**Custom**:
```ts
const ragMiddleware: LanguageModelV3Middleware = {
  transformParams: async ({ params }) => {
    const docs = await retrieve(lastUserMessage);
    return { ...params, messages: [{ role: 'system', content: docs }, ...params.messages] };
  },
  wrapGenerate: async ({ doGenerate, params }) => {
    const result = await doGenerate(params);
    await logUsage(result.usage);
    return result;
  },
};
```

## Providers

```ts
import { gateway, customProvider, createProviderRegistry } from 'ai';

// Gateway: 'provider/model'
const model = gateway('anthropic/claude-sonnet-4.5');

// Custom
const myProvider = customProvider({
  languageModels: {
    fast: gateway('openai/gpt-4.5-mini'),
    smart: wrapLanguageModel({ model: gateway('anthropic/claude-opus-4'), middleware }),
  },
  fallbackProvider: gateway,
});

// Registry
const registry = createProviderRegistry({ anthropic, openai, gateway });
const model = registry.languageModel('anthropic:claude-sonnet-4.5');
```

## Embeddings

```ts
import { embed, embedMany, cosineSimilarity } from 'ai';

const { embedding, usage } = await embed({
  model: openai.textEmbeddingModel('text-embedding-3-large'),
  value: 'text',
});

const { embeddings } = await embedMany({
  model, values: ['a', 'b', 'c'], maxParallelCalls: 5
});

const similarity = cosineSimilarity(emb1, emb2); // 0-1
```

## Image Generation

```ts
import { generateImage } from 'ai';

const { images } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'cityscape', // or { text, images: [...] } for editing
  n: 3,
  size: '1024x1024', // or aspectRatio: '16:9'
  seed: 123,
});

images[0].base64; // or .uint8Array
```

## Additional

**Transcription**: `transcribe({ model: openai.transcription('whisper-1'), audio, language })`
**Speech**: `generateSpeech({ model: openai.speech('tts-1'), text, voice })`
**Rerank**: `rerank({ model: cohere.rerank('rerank-english-v2.0'), query, documents })` → `rankings[].score`
**DevTools**: `wrapLanguageModel({ model, middleware: devToolsMiddleware() })` + `npx @ai-sdk/devtools`
**Telemetry**: `experimental_telemetry: { isEnabled, recordInputs, functionId, metadata }`
**Abort**: `abortSignal: controller.signal` or `timeout: { totalMs: 5000 }`

**Errors**: `APICallError`, `InvalidArgumentError`, `NoContentGeneratedError`, `UnsupportedFunctionalityError`

## Stream Protocol

**UI Message Stream** (toUIMessageStreamResponse):
```
data: {"type":"message-start","role":"assistant"}
data: {"type":"text-delta","textDelta":"Hi"}
data: {"type":"tool-input-start","toolCallId":"x","toolName":"weather"}
data: {"type":"tool-input-available","toolCallId":"x","input":{...}}
data: {"type":"tool-output-available","toolCallId":"x","output":{...}}
data: {"type":"finish-message","usage":{...}}
```

## Patterns

**RAG**: Embed query → vector search → tool result → generate with context
**Multi-modal**: Tools return images via `{ text, imageUrl }` or `toModelOutput()`
**Agentic**: `prepareStep` + `stopWhen` + `onStepFinish` for dynamic workflows

## Migration

**5→6**: `Experimental_Agent` → `ToolLoopAgent`, `system` → `instructions`, default stopWhen: 1→20, use `output` not `generateObject` params

---

Docs: ai-sdk.dev | GitHub: vercel/ai | v6.x Jan 2026
