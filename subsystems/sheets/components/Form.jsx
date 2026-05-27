import React, { useEffect, useReducer } from "react";
import { Box, useInput } from "ink";
import { atActions, init, reduce } from "../state/form.js";
import { Field } from "./Field.jsx";
import { Actions } from "./Actions.jsx";

export function Form({ fields, actions, done }) {
  const [state, dispatch] = useReducer(reduce, { fields, actions }, init);

  useEffect(() => {
    if (state.done) done({ values: state.values, action: state.action });
  }, [state.done]);

  useInput(
    (input, key) => {
      if ((key.tab && key.shift) || key.upArrow) return dispatch({ kind: "prev" });
      if (key.tab || key.downArrow) return dispatch({ kind: "next" });
    },
    { isActive: !state.done },
  );

  return (
    <Box flexDirection="column">
      {fields.map((field, index) => {
        const Input = field.input;
        const active = index === state.active;
        return (
          <Field key={field.name} label={field.label} active={active}>
            <Input
              {...field.props}
              isDisabled={!active}
              onChange={(value) => dispatch({ kind: "set", value })}
              onSubmit={() => dispatch({ kind: "next" })}
            />
          </Field>
        );
      })}
      <Actions
        options={actions}
        active={atActions(state)}
        onAction={(action) => dispatch({ kind: "action", action })}
      />
    </Box>
  );
}
