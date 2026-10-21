import { createContext, useContext } from "solid-js";

export const ambient = (key, schema) => {
  const slot = createContext();
  const consume = () => {
    const value = useContext(slot);
    if (value === undefined) throw new Error(`[ambient] ${key}: consumed outside its Provider`);
    return value;
  };
  return { key, schema, Provider: slot.Provider, consume, Consumer: (props) => props.children(consume()) };
};
