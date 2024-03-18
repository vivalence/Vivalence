import React, { useRef, useState, useEffect } from "react";
import { useCreate, useUpdate, useList, IResourceComponentsProps, BaseRecord, } from "@refinedev/core";
import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import supabase from "$util/supabaseClient";
import { type Strategy } from "$types/index";
import Autocomplete, { type OptionType, type RefHandles, } from "$components/autocomplete/index";
import { useResource } from "$util/hooks/index";

const mapStrategiesToOption = (data: Strategy[]): OptionType<Strategy>[] =>
  data.map((d) => ({ value: d.id, label: d.name, data: d, }));

const useFormSubmission = (tagId: string) => {
  const autocompleteRef = useRef<RefHandles>(null);
  const { mutate: createOne } = useCreate();
  const { mutate: updateOne } = useUpdate();

  const onFormFinish = async (values: any) => {
    if (!autocompleteRef.current) return console.error("Autocomplete ref is null");

    const { added, removed } = autocompleteRef.current;

    try {
      added().forEach(option => {
        createOne({
          resource: "_StrategyToTag",
          values: { A: option.data.id, B: tagId },
        });
      });
      removed().forEach(async option => {
        await supabase.from("_StrategyToTag").delete().eq("A", option.data.id).eq("B", tagId);
      });

      updateOne({ resource: "Tag", values, id: tagId });
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  return { autocompleteRef, onFormFinish };
};

export const TagEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();

  const [strategiesAll] = useResource<Strategy>("Strategy", mapStrategiesToOption);
  const [optionsActive, setActive] = useState<OptionType<Strategy>[]>([]);

  const tagId = queryResult?.data?.data.id! as string;
  const { autocompleteRef, onFormFinish } = useFormSubmission(tagId,);

  useEffect(() => {
    setActive(mapStrategiesToOption(queryResult?.data?.data.strategies || []));
  }, [queryResult?.data?.data.strategies]);

  const filter = (searchText: string): OptionType<Strategy>[] => {
    return strategiesAll.filter((option: OptionType<Strategy>) => {
      return (
        option.data.name.toLowerCase().includes(searchText.toLowerCase()) ||
        option.data.id.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFormFinish}>
        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select at least one Tag Type!' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select tag types"
          >
            <Option value="STRUCTURAL">Structural</Option>
            <Option value="ONTOLOGICAL">Ontological</Option>
            <Option value="LEARNABLE">Learnable</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Connected Strategies">
          <Autocomplete
            ref={autocompleteRef}
            filter={filter}
            optionsAll={strategiesAll}
            optionsAtStart={optionsActive}
          />
        </Form.Item>

      </Form>
    </Edit>
  );
}
