import React, { ReactElement, useEffect, useState, forwardRef, useImperativeHandle, Ref } from 'react';
import Search from './search';
import List from './list';
import { type OptionType, type RefHandles } from './types';
import { type Resource } from "$types/index";

interface AutocompleteProps<T extends Resource> {
  optionsAll: OptionType<T>[];
  optionsInit: OptionType<T>[];
  filter: (searchText: string) => OptionType<T>[];
}

const Autocomplete = forwardRef(<T extends Resource,>(props: AutocompleteProps<T>, ref: Ref<RefHandles>): ReactElement => {
  const [optionsActive, setActiveOptions] = useState<OptionType<T>[]>(props.optionsInit);
  useEffect(() => setActiveOptions(props.optionsInit), [props.optionsInit])

  useImperativeHandle(ref, () => ({
    added: () => optionsActive.filter((u) => !props.optionsInit.some((u2) => u2.value === u.value)),
    removed: () => props.optionsInit.filter((u) => !optionsActive.some((u2) => u2.value === u.value))
  }));

  const onSelect = (option: OptionType<T>) => {
    setActiveOptions(
      optionsActive.some((u) => u.value === option.value)
        ? optionsActive
        : [...optionsActive, option]
    );
  }

  const onDelete = (option: OptionType<T>) => {
    setActiveOptions([...optionsActive.filter((u) => u.value !== option.value)]);
  };

  return (
    <>
      <Search<T>
        optionsAll={props.optionsAll}
        filter={props.filter}
        onSelect={onSelect}
      />
      <label className="float right end">Total: {props.optionsAll.length} | Connected: {optionsActive.length}</label>

      <List<T>
        listMembers={optionsActive}
        onDelete={onDelete}
      />
    </>
  )
})

export { Search, List, OptionType, RefHandles };

export default Autocomplete;
