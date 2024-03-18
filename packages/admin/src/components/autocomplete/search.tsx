import React, { ReactElement, useEffect, useState } from 'react';
import { AutoComplete as AntAutoComplete } from 'antd';
import { type OptionType } from "./types"

interface SearchProps<T> {
  optionsAll: OptionType<T>[];
  onSelect: (option: OptionType<T>) => void;
  filter: (searchText: string) => OptionType<T>[];
}

const Search = <T,>({ optionsAll, filter, onSelect, }: SearchProps<T>): ReactElement => {
  const [options, setOptions] = useState<OptionType<T>[]>(optionsAll);
  useEffect(() => setOptions(optionsAll), [optionsAll])

  const onSearch = (searchText: string) => {
    setOptions(filter(searchText));
  };

  return (
    <AntAutoComplete
      options={options}
      onSearch={onSearch}
      onSelect={(value, option) => onSelect(option)}
      placeholder={'Search...'}
      notFoundContent="None found"
    />
  );
};

export default Search;
