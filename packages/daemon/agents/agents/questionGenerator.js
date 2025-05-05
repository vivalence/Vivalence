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
