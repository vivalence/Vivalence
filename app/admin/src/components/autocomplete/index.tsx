import React, { ReactElement, useEffect, useState, forwardRef, useImperativeHandle, Ref } from 'react';

import Search from './search';
import List from './list';
import { type OptionType, type RefHandles } from './types';

interface AutocompleteProps<T> {
  optionsAll: OptionType<T>[];
  optionsAtStart: OptionType<T>[];
  filter: (searchText: string,) => OptionType<T>[];
}

const Autocomplete = forwardRef(<T,>({ optionsAll, optionsAtStart, filter }: AutocompleteProps<T>, ref: Ref<RefHandles>): ReactElement => {
  const [optionsActive, setActiveOptions] = useState<OptionType<T>[]>(optionsAtStart);
  useEffect(() => setActiveOptions(optionsAtStart), [optionsAtStart])

  useImperativeHandle(ref, () => ({
    added: () => optionsActive.filter((u) => !optionsAtStart.some((u2) => u2.value === u.value)),
    removed: () => optionsAll.filter((u) => !optionsActive.some((u2) => u2.value === u.value))
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
        optionsAll={optionsAll}
        filter={filter}
        onSelect={onSelect}
      />

      <List<T>
        listMembers={optionsActive}
        displayMember={(option: OptionType<T>) => option.label}
        onDelete={onDelete}
      />
    </>
  )
})


export { Search, List, OptionType, RefHandles };

export default Autocomplete;
