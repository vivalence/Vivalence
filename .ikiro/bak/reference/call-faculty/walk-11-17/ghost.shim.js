import { createContext, useContext } from "solid-js";
import * as dictation from "./dictation.belt.js";
export const belt = { dictation };
export const ambient = (key, schema) => {
  const slot = createContext();
  const consume = () => {
    const value = useContext(slot);
    if (value === undefined) throw new Error(`[ambient] ${key}: consumed outside its Provider`);
    return value;
  };
  return { key, schema, Provider: slot.Provider, consume, Consumer: (props) => props.children(consume()) };
};
