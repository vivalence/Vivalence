import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { grey } from "@ant-design/colors";

import { useResource } from "$util/hooks/useResource";
import Autocomplete, { type OptionType, type RefHandles } from "./autocomplete";
import { type Resource } from "$types/index";

import { ConnectionTypes } from "./connections";
import { type ConnectionTypeMethods, type ConnectionTypesInterface } from "./types";

const useFormSubmission = (
  rootResourceId: string,
  connectionName: keyof ConnectionTypesInterface,
) => {
  const autocompleteRef = useRef<RefHandles>(null);

  const onFormFinish = async () => {
    if (!autocompleteRef.current) {
      return console.error("Autocomplete ref is null");
    }

    const { added, removed } = autocompleteRef.current;

    try {
      added().forEach(async (option) => {
        await ConnectionTypes[connectionName].create(option, rootResourceId);
      });
      removed().forEach(async (option) => {
        await ConnectionTypes[connectionName].remove(option, rootResourceId);
      });
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  return { autocompleteRef, onFormFinish };
};

export interface ConnectionEditHandles {
  onSave: () => void;
}

interface ConnectionEditProps<T extends Resource> {
  active: T[];
  connectionName: keyof ConnectionTypesInterface;
  rootResourceId: string;
}

export const ConnectionEdit = forwardRef<
  ConnectionEditHandles,
  ConnectionEditProps<Resource>
>((props, ref) => {
  // @lj: unknown is ts hack because ts is retarded
  const connection = ConnectionTypes[props.connectionName] as unknown as ConnectionTypeMethods<Resource>;
  const { map, filter, variableResourceKey } = connection;

  let [optionsAll] = useResource<Resource>(variableResourceKey, map);

  const [optionsActive, setActive] = useState<OptionType<Resource>[]>([]);

  useEffect(() => props.active && setActive(map(props.active)), [props.active]);

  const { autocompleteRef, onFormFinish } = useFormSubmission(
    props.rootResourceId,
    props.connectionName,
  );

  useImperativeHandle(ref, () => ({
    onSave: () => {
      onFormFinish();
    },
  }));

  return (
    <Autocomplete
      ref={autocompleteRef}
      optionsInit={optionsActive}
      optionsAll={optionsAll}
      filter={filter(optionsAll)}
    />
  );
});

export default ConnectionEdit;
