import React, { ReactElement, useEffect, useState } from 'react';
import { AutoComplete as AntAutoComplete } from 'antd';
import { type OptionType } from "./types"
import { type Resource } from "$types/index";

interface SearchProps<T extends Resource> {
  optionsAll: OptionType<T>[];
  onSelect: (option: OptionType<T>) => void;
  filter: (searchText: string) => OptionType<T>[];
}

const Search = <T extends Resource,>({ optionsAll, filter, onSelect }: SearchProps<T>): ReactElement => {
  const [options, setOptions] = useState<OptionType<T>[]>(optionsAll);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => setOptions(optionsAll), [optionsAll]);

  const onSearch = (searchText: string) => {
    setInputValue(searchText); // Update inputValue as user types
    setOptions(filter(searchText));
  };

  const handleSelect = (value: string, option: OptionType<T>) => {
    onSelect(option);
    setInputValue('');
  };

  return (
    <AntAutoComplete
      options={options}
      onSearch={onSearch}
      onSelect={handleSelect}
      placeholder="Search..."
      notFoundContent="None found"
      value={inputValue}
      onChange={setInputValue}
    />
  );
};


export default Search;
