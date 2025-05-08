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
