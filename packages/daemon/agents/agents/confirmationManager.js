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
