import { AxSignature } from "@ax-llm/ax";

const schemaToSignature = (description, inputSchema, outputSchema) => {
  const signature = new AxSignature();

  if (description) {
    signature.setDescription(description);
  }

  // Process input and output schemas
  const inputFields = flattenSchema(inputSchema);
  const outputFields = flattenSchema(outputSchema);

  inputFields.forEach((field) => signature.addInputField(field));
  outputFields.forEach((field) => signature.addOutputField(field));

  return signature;
};

const flattenSchema = (schema, prefix = "") => {
  if (!schema || !schema.properties) return [];

  return Object.entries(schema.properties).flatMap(([name, prop]) => {
    const fullName = prefix ? `${prefix}_${name}` : name;
    const isRequired = schema.required?.includes(name);

    if (prop.type === "object" && prop.properties) {
      return flattenSchema(prop, fullName);
    }

    return [
      {
        name: fullName,
        description: prop.description || "",
        type: convertToAxType(prop),
        isOptional: !isRequired,
      },
    ];
  });
};

const convertToAxType = (prop) => {
  if (prop.enum) {
    return {
      name: "class",
      isArray: false,
      classes: prop.enum,
    };
  }

  if (prop.type === "array") {
    const itemType = prop.items?.type || "string";
    return {
      name: mapJsonTypeToAx(itemType),
      isArray: true,
    };
  }

  return {
    name: mapJsonTypeToAx(prop.type || "string"),
    isArray: false,
  };
};

const mapJsonTypeToAx = (jsonType) => {
  const typeMap = {
    string: "string",
    integer: "number",
    number: "number",
    boolean: "boolean",
    object: "json",
    array: "string",
    null: "string",
  };

  return typeMap[jsonType] || "string";
};

export { schemaToSignature };
