import React, { forwardRef, ReactElement, Ref, useEffect, useImperativeHandle, useState } from "react";

import Search from "./search";
import List from "./list";
import { type OptionType, type RefHandles } from "./types";
import { type Resource } from "$types/index";

interface AutocompleteProps<T extends Resource> {
  optionsAll: OptionType<T>[];
  optionsInit: OptionType<T>[];
  filter: (searchText: string) => OptionType<T>[];
}

const Autocomplete = forwardRef(
  <T extends Resource>(props: AutocompleteProps<T>, ref: Ref<RefHandles>): ReactElement => {
    const [optionsActive, setActiveOptions] = useState<OptionType<T>[]>(props.optionsInit);
    useEffect(() => setActiveOptions(props.optionsInit), [props.optionsInit]);

    /* const optionsAll = props.optionsAll.map((u) => ({ ...u, key: u.data.id, active: optionsActive.some((u2) => u2.value === u.value) })); */
    /* console.log(optionsAll) */
    /* const [optionsAll, setAllOptions] = useState<OptionType<T>[]>(f(props.optionsAll)); */
    /* useEffect(() => setAllOptions(f(props.optionsAll)), [props.optionsAll, optionsActive]) */

    useImperativeHandle(ref, () => ({
      added: () => optionsActive.filter((u) => !props.optionsInit.some((u2) => u2.value === u.value)),
      removed: () => props.optionsInit.filter((u) => !optionsActive.some((u2) => u2.value === u.value)),
    }));

    const onSelect = (option: OptionType<T>) => {
      setActiveOptions(
        optionsActive.some((u) => u.value === option.value) ? optionsActive : [...optionsActive, option],
      );
    };

    const onDelete = (option: OptionType<T>) => {
      setActiveOptions([...optionsActive.filter((u) => u.value !== option.value)]);
    };

    return (
      <div style={{}}>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "-30px" }}>
          <label style={{ marginLeft: "auto" }}>
            Total: {props.optionsAll.length} | Connected: {optionsActive.length}
          </label>
        </div>

        <Search<T>
          optionsActive={optionsActive}
          optionsAll={props.optionsAll}
          filter={props.filter}
          onSelect={onSelect}
        />

        <List<T>
          listMembers={optionsActive}
          onDelete={onDelete}
        />
      </div>
    );
  },
);

export { List, OptionType, RefHandles, Search };

export default Autocomplete;
