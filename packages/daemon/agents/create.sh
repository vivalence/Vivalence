#!/bin/bash

mkdir -p lib tools agents server/routes

cat > lib/intent.js << 'EOF'
const IntentStatusEnum = {
  DISCOVERY: "DISCOVERY",
  RESOLVED: "RESOLVED",
  ERROR: "ERROR",
};

const ResolutionTypeEnum = {
  SESSION: "SESSION",
  DEPENDENCY: "DEPENDENCY",
  GAME: "GAME",
  TACTIC: "TACTIC",
  STRATEGY: "STRATEGY",
  CONVERSATION: "CONVERSATION",
  NOTEBOOK: "NOTEBOOK",
};

const ResolutionTraitEnum = {
  SCHEDULE: "SCHEDULE",
};

class Intent {
  constructor(id, manifest = {}) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = IntentStatusEnum.DISCOVERY;
    this.manifest = {
      name: manifest.name || "",
      description: manifest.description || "",
      icon: manifest.icon || "",
    };
    this.resolution = {
      type: null,
      traits: [],
    };
    this.state = {};
    this.history = []; 
  }

  get storable() {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      status: this.status,
      manifest: this.manifest,
      resolution: this.resolution,
      state: this.state,
      history: this.history,
    };
  }

  static fromStorage(data) {
    const intent = new Intent(data.id);
    intent.createdAt = new Date(data.createdAt);
    intent.updatedAt = new Date(data.updatedAt);
    intent.status = data.status;
    intent.manifest = data.manifest;
    intent.resolution = data.resolution;
    intent.state = data.state;
    intent.history = data.history;
    return intent;
  }
}

export {
  IntentStatusEnum,
  ResolutionTypeEnum,
  ResolutionTraitEnum,
  Intent,
};
EOF

cat > lib/signature.js << 'EOF'
import { AxSignature } from '@ax-llm/ax';

const schemaToSignature = (inputSchema, outputSchema) => {
  const signature = new AxSignature();
  
  if (inputSchema.description) {
    signature.setDescription(inputSchema.description);
  }
  
  Object.entries(inputSchema.properties || {}).forEach(([name, prop]) => {
    signature.addInputField({
      name,
      description: prop.description,
      type: getAxType(prop),
      isOptional: !inputSchema.required?.includes(name)
    });
  });
  
  Object.entries(outputSchema.properties || {}).forEach(([name, prop]) => {
    signature.addOutputField({
      name,
      description: prop.description,
      type: getAxType(prop),
      isOptional: !outputSchema.required?.includes(name)
    });
  });
  
  return signature;
};

const getAxType = (prop) => prop.type === 'array' 
  ? { name: prop.items?.type || 'string', isArray: true }
  : { name: prop.type || 'string', isArray: false };

const transformInput = (data, schema) => Object.fromEntries(
  Object.entries(schema.properties || {})
    .filter(([key]) => data[key] !== undefined)
    .map(([key, prop]) => [key, coerceValue(data[key], prop)])
);

const coerceValue = (value, schema) => {
  const type = schema.type;
  return type === 'string' ? String(value) :
         type === 'number' ? Number(value) :
         type === 'boolean' ? Boolean(value) :
         type === 'array' && !Array.isArray(value) ? [value] : value;
};

export { schemaToSignature, transformInput };
EOF

cat > tools/sessionDiscovery.js << 'EOF'
import { AxFunction } from '@ax-llm/ax';

const sessionDB = [
  { 
    runtime: 'python3', 
    session: 'ml-project-main',
    name: 'Machine Learning Project', 
    language: 'python',
    tags: ['data-science', 'machine-learning'],
    lastAccessed: '2025-04-30T15:30:00Z'
  },
  { 
    runtime: 'node16', 
    session: 'web-dashboard',
    name: 'Web Dashboard', 
    language: 'javascript',
    tags: ['frontend', 'react'],
    lastAccessed: '2025-05-05T09:15:00Z'
  },
  { 
    runtime: 'python3', 
    session: 'data-analysis',
    name: 'Data Analysis Project', 
    language: 'python',
    tags: ['data-science', 'visualization'],
    lastAccessed: '2025-05-06T12:45:00Z'
  }
];

const matchesTerm = (session, term) => {
  if (!term) return true;
  const searchTerm = term.toLowerCase();
  return (
    session.name.toLowerCase().includes(searchTerm) ||
    session.language.toLowerCase().includes(searchTerm) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

const sessionDiscovery = {
  name: 'session_discovery',
  description: 'Finds available sessions matching user requirements',
  func: async ({ language, project, term, recency = 'recent' }) => {
    let results = sessionDB.filter(session => {
      const languageMatch = !language || session.language.toLowerCase() === language.toLowerCase();
      const projectMatch = !project || session.name.toLowerCase().includes(project.toLowerCase());
      const termMatch = matchesTerm(session, term);
      
      return languageMatch && projectMatch && termMatch;
    });
    
    if (recency === 'recent') {
      results = results.sort((a, b) => 
        new Date(b.lastAccessed) - new Date(a.lastAccessed)
      );
    }
    
    return {
      sessions: results.map(({ runtime, session, name, language }) => ({
        runtime, session, name, language
      }))
    };
  },
  parameters: {
    type: 'object',
    properties: {
      language: { 
        type: 'string', 
        description: 'Programming language (e.g., python, javascript)'
      },
      project: { 
        type: 'string', 
        description: 'Project name or type'
      },
      term: {
        type: 'string',
        description: 'General search term to match against session name, language, or tags'
      },
      recency: { 
        type: 'string', 
        enum: ['recent', 'all'],
        description: 'Whether to prioritize recent sessions'
      }
    }
  }
};

export default sessionDiscovery;
EOF

cat > agents/intentAnalyzer.js << 'EOF'
import { AxAgent, AxChainOfThought } from '@ax-llm/ax';
import { ResolutionTypeEnum } from '../lib/intent.js';

const createIntentAnalyzer = () => {
  const examples = [
    {
      message: "Open my Python project",
      history: [],
      intentType: ResolutionTypeEnum.SESSION,
      confidence: 0.95,
      entities: { language: "python", project: "my Python project" }
    },
    {
      message: "I want to code something",
      history: [],
      intentType: ResolutionTypeEnum.SESSION,
      confidence: 0.60,
      entities: { intent: "coding" }
    },
    {
      message: "Tell me about machine learning",
      history: [],
      intentType: ResolutionTypeEnum.CONVERSATION,
      confidence: 0.90,
      entities: { topic: "machine learning" }
    },
    {
      message: "Let's work on a strategy for optimizing the marketing funnel",
      history: [],
      intentType: ResolutionTypeEnum.STRATEGY,
      confidence: 0.85,
      entities: { domain: "marketing", focus: "funnel optimization" }
    },
    {
      message: "What's the difference between Python and JavaScript?",
      history: [],
      intentType: ResolutionTypeEnum.CONVERSATION,
      confidence: 0.95,
      entities: { comparison: ["python", "javascript"] }
    }
  ];

  const agent = new AxAgent({
    name: 'IntentAnalyzer',
    description: 'Analyzes messages to determine intent type, confidence, and entities',
    signature: `message:string, history:json[] -> intentType:string, confidence:number, entities:json`,
    implementation: new AxChainOfThought()
  });
  
  examples.forEach(example => agent.addExample(example));
  
  return agent;
};

export default createIntentAnalyzer;
EOF

cat > agents/questionGenerator.js << 'EOF'
import { AxAgent } from '@ax-llm/ax';
import { ResolutionTypeEnum } from '../lib/intent.js';

const createQuestionGenerator = () => {
  const examples = [
    {
      intentType: ResolutionTypeEnum.SESSION,
      confidence: 0.6,
      entities: { intent: "coding" },
      question: "What kind of programming would you like to do? I can help set up a Python, JavaScript, or other development environment."
    },
    {
      intentType: ResolutionTypeEnum.SESSION,
      confidence: 0.7,
      entities: { language: "python" },
      question: "What kind of Python project would you like to work on? Data analysis, machine learning, or web development?"
    },
    {
      intentType: ResolutionTypeEnum.STRATEGY,
      confidence: 0.65,
      entities: { domain: "marketing" },
      question: "What specific aspect of marketing would you like to develop a strategy for? Customer acquisition, retention, or brand awareness?"
    },
    {
      intentType: ResolutionTypeEnum.NOTEBOOK,
      confidence: 0.7,
      entities: { purpose: "notes" },
      question: "What topic would you like to create notes for? Would you prefer a blank notebook or a template with sections?"
    }
  ];

  const agent = new AxAgent({
    name: 'QuestionGenerator',
    description: 'Creates contextual questions to clarify user intent',
    signature: `intentType:string, confidence:number, entities:json -> question:string`,
  });
  
  examples.forEach(example => agent.addExample(example));
  
  return agent;
};

export default createQuestionGenerator;
EOF

cat > agents/confirmationManager.js << 'EOF'
import { AxAgent } from '@ax-llm/ax';
import { ResolutionTypeEnum } from '../lib/intent.js';

const createConfirmationManager = () => {
  const examples = [
    {
      intentType: ResolutionTypeEnum.SESSION,
      resolution: {
        type: ResolutionTypeEnum.SESSION,
        params: {
          runtime: 'python3',
          session: 'ml-project-main',
          name: 'Machine Learning Project'
        }
      },
      confirmationPrompt: "I found your Machine Learning Project. Would you like to open this Python session?"
    },
    {
      intentType: ResolutionTypeEnum.SESSION,
      resolution: {
        type: ResolutionTypeEnum.SESSION,
        params: {
          runtime: 'python3',
          session: 'data-analysis',
          name: 'Data Analysis Project'
        }
      },
      confirmationPrompt: "I can open your Data Analysis Project in Python. Is that what you're looking for?"
    },
    {
      intentType: ResolutionTypeEnum.NOTEBOOK,
      resolution: {
        type: ResolutionTypeEnum.NOTEBOOK,
        params: {
          template: 'blank',
          name: 'Meeting Notes May 2025'
        }
      },
      confirmationPrompt: "I'll create a new blank notebook titled 'Meeting Notes May 2025'. Does that work for you?"
    },
    {
      intentType: ResolutionTypeEnum.STRATEGY,
      resolution: {
        type: ResolutionTypeEnum.STRATEGY,
        params: {
          template: 'marketing-funnel',
          name: 'Customer Acquisition Strategy'
        }
      },
      confirmationPrompt: "I'll set up a Customer Acquisition Strategy using the marketing funnel template. Should I proceed with this?"
    }
  ];

  const agent = new AxAgent({
    name: 'ConfirmationManager',
    description: 'Creates confirmation prompts with context for potential resolutions',
    signature: `intentType:string, resolution:json -> confirmationPrompt:string`
  });
  
  examples.forEach(example => agent.addExample(example));
  
  return agent;
};

export default createConfirmationManager;
EOF

cat > agents/resolutionManager.js << 'EOF'
import { AxAgent } from '@ax-llm/ax';
import { IntentStatusEnum, ResolutionTypeEnum } from '../lib/intent.js';

const createResolutionManager = () => {
  const examples = [
    {
      message: "Yes, that's what I want",
      potentialResolutions: [{
        type: ResolutionTypeEnum.SESSION,
        params: {
          runtime: 'python3',
          session: 'ml-project-main',
          name: 'Machine Learning Project'
        }
      }],
      resolution: {
        type: ResolutionTypeEnum.SESSION,
        params: {
          runtime: 'python3',
          session: 'ml-project-main'
        }
      }
    },
    {
      message: "No, I meant the data analysis one",
      potentialResolutions: [
        {
          type: ResolutionTypeEnum.SESSION,
          params: {
            runtime: 'python3',
            session: 'ml-project-main',
            name: 'Machine Learning Project'
          }
        },
        {
          type: ResolutionTypeEnum.SESSION,
          params: {
            runtime: 'python3',
            session: 'data-analysis',
            name: 'Data Analysis Project'
          }
        }
      ],
      resolution: {
        type: ResolutionTypeEnum.SESSION,
        params: {
          runtime: 'python3',
          session: 'data-analysis'
        }
      }
    },
    {
      message: "Actually, let's start fresh with a new notebook",
      potentialResolutions: [{
        type: ResolutionTypeEnum.SESSION,
        params: {
          runtime: 'python3',
          session: 'data-analysis',
          name: 'Data Analysis Project'
        }
      }],
      resolution: {
        type: ResolutionTypeEnum.NOTEBOOK,
        params: {
          template: 'blank',
          name: 'New Notebook'
        }
      }
    }
  ];

  const agent = new AxAgent({
    name: 'ResolutionManager',
    description: 'Finalizes intent resolution based on user confirmation',
    signature: `message:string, potentialResolutions:json[], history:json[] -> resolution:json`
  });
  
  examples.forEach(example => agent.addExample(example));
  
  return agent;
};

const resolveIntent = (intent, resolutionType, params) => {
  intent.status = IntentStatusEnum.RESOLVED;
  intent.resolution = {
    type: resolutionType,
    traits: [],
  };
  
  intent.state = {
    ...intent.state,
    ...params,
    discoveryPhase: 'RESOLVED'
  };
  
  intent.updatedAt = new Date();
  
  return intent;
};

export { createResolutionManager, resolveIntent };
EOF

cat > agents/discovery.js << 'EOF'
import { AxAgent } from '@ax-llm/ax';
import { MCPClient, MCPStdioTransport } from '@ax-llm/ax-mcp';
import { schemaToSignature } from '../lib/signature.js';
import { IntentStatusEnum } from '../lib/intent.js';
import createIntentAnalyzer from './intentAnalyzer.js';
import createQuestionGenerator from './questionGenerator.js';
import createConfirmationManager from './confirmationManager.js';
import { createResolutionManager, resolveIntent } from './resolutionManager.js';
import sessionDiscovery from '../tools/sessionDiscovery.js';

const setupMCPTools = async () => {
  const searchTransport = new MCPStdioTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search']
  });
  
  const webSearchMCP = new MCPClient(searchTransport);
  await webSearchMCP.init();
  
  const dataTransport = new MCPStdioTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-data-processor']
  });
  
  const dataProcessorMCP = new MCPClient(dataTransport);
  await dataProcessorMCP.init();
  
  return { webSearchMCP, dataProcessorMCP };
};

export const createDiscoveryAgent = async () => {
  const { webSearchMCP, dataProcessorMCP } = await setupMCPTools();
  
  const intentAnalyzer = createIntentAnalyzer();
  const questionGenerator = createQuestionGenerator();
  const confirmationManager = createConfirmationManager();
  const resolutionManager = createResolutionManager();
  
  const inputSchema = {
    type: 'object',
    properties: {
      message: { 
        type: 'string', 
        description: 'User message'
      },
      intent: { 
        type: 'object', 
        description: 'Current intent object with history and state'
      }
    },
    required: ['message', 'intent']
  };
  
  const outputSchema = {
    type: 'object',
    properties: {
      updatedIntent: { 
        type: 'object', 
        description: 'Updated intent object'
      },
      response: { 
        type: 'string', 
        description: 'Response to user'
      }
    },
    required: ['updatedIntent', 'response']
  };
  
  const signature = schemaToSignature(inputSchema, outputSchema);
  
  return new AxAgent({
    name: 'DiscoveryAgent',
    description: 'Discovers and resolves user intent through conversation using a ReAct approach (Reason + Act)',
    signature: signature.toString(),
    functions: [
      sessionDiscovery, 
      webSearchMCP, 
      dataProcessorMCP
    ],
    agents: [
      intentAnalyzer, 
      questionGenerator, 
      confirmationManager, 
      resolutionManager
    ]
  });
};

export const handleDiscovery = async (ai, intent, message) => {
  const discoveryAgent = await createDiscoveryAgent();
  
  if (!intent.state.discoveryPhase) {
    intent.state = {
      ...intent.state,
      discoveryPhase: 'INITIAL',
      confidence: 0,
      toolResults: {},
      potentialResolutions: [],
      conversationContext: {}
    };
  }
  
  if (message) {
    intent.history.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
  }
  
  const result = await discoveryAgent.forward(ai, {
    message: message || intent.history[intent.history.length - 1]?.content || '',
    intent: JSON.parse(JSON.stringify(intent))
  });
  
  const { updatedIntent, response } = result;
  
  intent.status = updatedIntent.status;
  intent.resolution = updatedIntent.resolution;
  intent.state = updatedIntent.state;
  intent.updatedAt = new Date();
  
  intent.history.push({
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString()
  });
  
  return { intent, response };
};
EOF

cat > server/routes/discover.js << 'EOF'
import { Router } from 'oak';
import { AxAI } from '@ax-llm/ax';
import { handleDiscovery } from '../agents/discovery.js';
import { Intent, IntentStatusEnum } from '../lib/intent.js';

const router = new Router();

const ai = new AxAI({
  name: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  config: { 
    temperature: 0.2,
    model: 'gpt-4o'
  }
});

router.post('/discover', async (ctx) => {
  const body = await ctx.request.body.json();
  const { intent: intentData, message } = body;
  
  let intent;
  if (intentData.status) {
    intent = Intent.fromStorage(intentData);
  } else {
    intent = new Intent(intentData.id, intentData.manifest);
  }
  
  const { intent: updatedIntent, response } = await handleDiscovery(ai, intent, message);
  
  const headers = new Headers();
  if (ctx.request.headers.get('accept') === 'text/event-stream') {
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');
    
    ctx.response.body = new ReadableStream({
      start(controller) {
        controller.enqueue(`data: ${JSON.stringify({ response, done: false })}\n\n`);
        
        controller.enqueue(`data: ${JSON.stringify({ 
          intent: updatedIntent.storable, 
          response, 
          done: true 
        })}\n\n`);
        
        controller.close();
      }
    });
    ctx.response.headers = headers;
  } else {
    ctx.response.body = { 
      intent: updatedIntent.storable, 
      response 
    };
  }
});

export default router;
EOF

cat > server/index.js << 'EOF'
import { Application } from "oak";
import discoverRouter from "./routes/discover.js";

const app = new Application();

app.use(discoverRouter.routes());
app.use(discoverRouter.allowedMethods());

app.addEventListener("listen", ({ port, secure }) => {
  console.log(`Server listening on ${secure ? "https" : "http"}://localhost:${port}`);
});

await app.listen({ port: 3000 });
EOF

echo "Directory structure and files created successfully!"
