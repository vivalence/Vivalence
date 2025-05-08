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
