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
