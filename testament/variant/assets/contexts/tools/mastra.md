# Mastra llmtxt

TS AI agent framework. 40+ LLM providers.

## Core

Agent = LLM + tools, iterates until done
Workflow = graph orchestration .then() .branch() .parallel()
Tool = typed fn(context, mastra) => result
MCP = universal tool protocol

## Mastra Instance

```ts
import { Mastra } from '@mastra/core'
new Mastra({ agents, workflows, tools, memory, vectors, mcpServers, logger, storage })
```

## Agent

```ts
import { Agent } from '@mastra/core/agent'
const agent = new Agent({ name, instructions, model: 'openai/gpt-4o-mini', tools, enableMemory })
await agent.generate(prompt, { memory: { thread, resourceId }, maxSteps, temperature })
await agent.stream(prompt, opts)
mastra.getAgent('name')
```

## Tool

```ts
import { createTool } from '@mastra/core/tools'
createTool({ id, description, inputSchema: z.object({...}), outputSchema: z.object({...}),
  execute: async ({ context, runtimeContext, mastra }) => result })
await tool.execute({ context, runtimeContext, mastra })
```

## Workflow

```ts
import { createWorkflow, createStep } from '@mastra/core/workflows'
const step = createStep({ id, inputSchema, outputSchema, 
  execute: async ({ inputData, mastra, state, setState, suspend }) => result })
createWorkflow({ id, inputSchema, outputSchema, stateSchema, initialState })
  .then(step1).parallel([s2,s3]).branch({ condition, then, else }).commit()
const run = await workflow.createRunAsync()
await run.start({ inputData })
await run.stream({ inputData })
await run.resumeAsync({ step, resumeData })
```

Workflow step params: inputData, mastra, state, setState, suspend, runtimeContext
Agent in step: mastra.getAgent('id').generate()
Tool in step: createStep(tool) or tool.execute()
Nested: .then(childWorkflow)
Clone: cloneWorkflow(wf, { id })

## MCP

```ts
import { MCPClient, MCPServer } from '@mastra/mcp'
const mcp = new MCPClient({ servers: { name: { command, args } | { url } } })
await mcp.connect(); const tools = await mcp.getTools()
new Agent({ tools: async () => await mcp.getTools() })

new MCPServer({ id, name, version, tools, agents, workflows, resources: { list, read } })
```

## Memory

```ts
import { Memory } from '@mastra/core/memory'
const memory = new Memory({ provider, maxMessages })
const thread = await memory.createThread({ resourceId, metadata })
await memory.saveMessages({ threadId, messages: [{ role, content }] })
const msgs = await memory.query({ threadId })
await memory.getThreadsByResourceId(id)
agent.generate(prompt, { memory: { thread, resourceId } })
```

## RAG

```ts
import { MDocument, createVectorQueryTool, createGraphRAGTool } from '@mastra/rag'
import { PineconeVector } from '@mastra/pinecone'

const doc = new MDocument({ content, metadata })
await doc.chunk({ strategy: 'recursive', size, overlap })
await doc.embed({ model: openai.embedding('text-embedding-3-small') })

const vector = new PineconeVector({ apiKey, indexName })
await vector.upsert({ embeddings, metadata })
await vector.query({ queryEmbedding, topK, filter })

const ragTool = createVectorQueryTool({ vectorStoreName, indexName, model, topK })
const graphTool = createGraphRAGTool({ vectorStoreName, indexName, model, 
  graphOptions: { dimension, threshold, randomWalkSteps, restartProb } })
```

## Storage

```ts
import { LibSQLStorage } from '@mastra/libsql'
new Mastra({ storage: new LibSQLStorage({ url, authToken }) })
createWorkflow({ enableStateSnapshots: true })
```

## Stream

```ts
const stream = await agent.stream(prompt)
for await (const chunk of stream) {
  chunk.type // 'text-delta' | 'tool-call'
  chunk.textDelta | chunk.toolName
}
```

## Deploy

```ts
mastra.getServer().listen(3000)
import { MastraClient } from '@mastra/client'
const client = new MastraClient({ url })
client.getAgent('id').generate()
client.getWorkflow('id').createRunAsync()
```

## Patterns

Multi-agent: workflow → step(mastra.getAgent('researcher').generate()) → step(analyst) → step(writer)
Workflow as tool: createTool({ execute: ({ mastra }) => mastra.getWorkflow('id').createRunAsync().start() })
Dynamic context: createTool({ execute: ({ runtimeContext }) => runtimeContext.get('apiKey') })
Error handling: .branch({ condition: ctx => ctx.result.success, then, else })

## API Quick Reference

Agent: new Agent({ name, instructions, model, tools, enableMemory, telemetry })
  .generate(prompt, { memory, maxSteps, temperature, onStepFinish })
  .stream(prompt, opts)
Tool: createTool({ id, description, inputSchema, outputSchema, execute })
Workflow: createWorkflow({ id, inputSchema, outputSchema, stateSchema, initialState })
  .then() .parallel() .branch() .commit()
Step: createStep({ id, inputSchema, outputSchema, execute })
  execute({ inputData, mastra, state, setState, suspend, runtimeContext })
MCP: new MCPClient({ servers }), new MCPServer({ tools, agents, workflows, resources })
Memory: new Memory({ provider }).createThread().saveMessages().query()
RAG: new MDocument().chunk().embed(), vector.upsert().query()
  createVectorQueryTool(), createGraphRAGTool()
