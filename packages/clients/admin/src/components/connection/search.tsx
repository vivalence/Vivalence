import { ReactElement, useEffect, useState } from "react";
import { AutoComplete as AntdAutoComplete } from "antd";
import { type OptionType } from "./types";
import { type Resource } from "$types/index";
import { CheckOutlined } from "@ant-design/icons";

interface SearchProps<T extends Resource> {
  optionsActive: OptionType<T>[];
  optionsAll: OptionType<T>[];
  onSelect: (option: OptionType<T>) => void;
  filter: (searchText: string) => OptionType<T>[];
}

const Search = <T extends Resource>({
  optionsActive,
  optionsAll,
  filter,
  onSelect,
}: SearchProps<T>): ReactElement => {
  const [options, setOptions] = useState<OptionType<T>[]>(optionsAll);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => setOptions(optionsAll), [optionsAll]);

  const onSearch = (searchText: string) => {
    setInputValue(searchText); // Update inputValue as user types
    setOptions(filter(searchText));
    setOpen(true);
  };

  const handleSelect = (_: string, option: OptionType<T>) => {
    onSelect(option);
    setInputValue(inputValue);
    setOpen(true);
  };

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      setOpen(true);
    }
  };

  return (
    <AntdAutoComplete
      options={options}
      onSearch={onSearch}
      onSelect={handleSelect}
      placeholder="Search..."
      notFoundContent="None found"
      value={inputValue}
      onChange={(value) => {
        setInputValue(value);
        setOpen(true);
      }}
      open={open}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      onBlur={() => setOpen(false)}
      optionRender={(option) => {
        const isActive = optionsActive.some(
          (activeOption) => activeOption.data.id === option.data.data.id,
        );
        return (
          <div>
            <span>{option.label}</span>
            {/* @ts-ignore */}
            {isActive && <CheckOutlined style={{ float: "right" }} />}
          </div>
        );
      }}
    />
  );
};

export default Search;
