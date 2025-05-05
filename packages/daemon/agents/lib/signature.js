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
