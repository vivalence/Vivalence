import { Signal, Deferred, Walker } from "@vivalence/trajectory";

export const AgenticController = (trajectory) => {
  const patterns = [];
  
  const normalizePath = (path) => path.replace(/\/+/g, '/').replace(/\/$/, '');
  
  const traverseTrajectory = (traj, basePath = "", parentPath = "") => {
    for (const [pattern, effect] of traj.effects.entries()) {
      const docs = pattern.docs || {};
      const segment = docs.segment || "";
      const path = normalizePath(basePath + "/" + segment);
      
      patterns.push({
        fullPath: path,
        name: docs.name,
        description: docs.description,
        valence: docs.valence,
        input: docs.input,
        output: docs.output,
        effect,
        parentPath
      });
    }
    
    for (const [pattern, descendant] of traj.descendants.entries()) {
      const docs = pattern.docs || {};
      const segment = docs.segment || "";
      const path = normalizePath(basePath + "/" + segment);
      
      patterns.push({
        fullPath: path,
        name: docs.name,
        description: docs.description,
        valence: docs.valence,
        input: docs.input,
        output: docs.output,
        parentPath
      });
      
      traverseTrajectory(descendant, path, basePath);
    }
  };
  
  const formatSchema = (schema) => {
    if (!schema) return "{}";
    if (schema.type && schema.properties) {
      return `{ ${Object.keys(schema.properties).join(', ')} }`;
    }
    return JSON.stringify(schema, null, 0).substring(0, 100);
  };
  
  const createCallable = (patternInfo) => ({
    name: patternInfo.fullPath,
    description: `
${patternInfo.name || patternInfo.fullPath}
${patternInfo.valence || ''}

Input: ${formatSchema(patternInfo.input)}
Output: ${formatSchema(patternInfo.output)}
`,
    parameters: patternInfo.input || { type: "object", properties: {} },
    func: async (input) => {
      const signal = new Signal("sig", { path: patternInfo.fullPath });
      const deferred = new Deferred();
      const walker = new Walker(trajectory, deferred);
      
      try {
        await walker.walk([signal], async () => {
          throw new Error(`No handler found for ${patternInfo.fullPath}`);
        });
        
        const ctx = {};
        const handler = await deferred.handler;
        return await handler(input, ctx);
      } catch (error) {
        throw error;
      }
    }
  });
  
  const formatIndex = () => {
    let indexText = "# Available Capabilities\n\n";
    
    const groupedPatterns = patterns.reduce((groups, pattern) => {
      const parts = pattern.fullPath.split('/').filter(Boolean);
      if (parts.length === 0) return groups;
      
      const basePath = `/${parts[0]}`;
      
      if (!groups[basePath]) groups[basePath] = [];
      groups[basePath].push(pattern);
      return groups;
    }, {});
    
    for (const [basePath, patterns] of Object.entries(groupedPatterns)) {
      const baseValence = patterns.find(p => p.fullPath === basePath)?.valence || "";
      indexText += `## ${basePath}\n${baseValence}\n\n`;
      
      const secondLevelPaths = patterns
        .filter(p => p.fullPath !== basePath)
        .reduce((acc, pattern) => {
          const parts = pattern.fullPath.split('/').filter(Boolean);
          if (parts.length < 2) return acc;
          
          const secondPath = `/${parts[0]}/${parts[1]}`;
          if (!acc[secondPath]) acc[secondPath] = [];
          acc[secondPath].push(pattern);
          return acc;
        }, {});
      
      for (const [secondPath, secondPatterns] of Object.entries(secondLevelPaths)) {
        const secondValence = secondPatterns.find(p => p.fullPath === secondPath)?.valence || "";
        indexText += `### ${secondPath}\n${secondValence}\n\n`;
        
        const endpoints = secondPatterns.filter(p => p.fullPath !== secondPath && p.effect);
        if (endpoints.length > 0) {
          indexText += "#### Endpoints:\n\n";
          
          for (const endpoint of endpoints) {
            indexText += `- \`${endpoint.fullPath}\`\n`;
            if (endpoint.valence) indexText += `  ${endpoint.valence}\n`;
            
            if (endpoint.input) indexText += `  **Input**: ${formatSchema(endpoint.input)}\n`;
            if (endpoint.output) indexText += `  **Output**: ${formatSchema(endpoint.output)}\n`;
            indexText += '\n';
          }
        }
      }
    }
    
    return indexText;
  };
  
  traverseTrajectory(trajectory);
  
  return {
    get callables() {
      return patterns
        .filter(pattern => !!pattern.effect)
        .map(pattern => createCallable(pattern));
    },
    get index() {
      return formatIndex();
    }
  };
};
