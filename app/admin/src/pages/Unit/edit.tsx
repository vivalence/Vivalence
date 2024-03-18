import React, { useRef, useState, useEffect } from "react";
import { useCreate, useUpdate, useList, IResourceComponentsProps, BaseRecord, } from "@refinedev/core";
import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import supabase from "$util/supabaseClient";
import { type Tag } from "$types/index";
import Autocomplete, { type OptionType, type RefHandles, } from "$components/autocomplete/index";
/* import MonacoEditor from "$components/monaco-editor/index"; */
import { useResource } from "$util/hooks/index";

const mapTagsToOption = (data: Tag[]): OptionType<Tag>[] =>
  data.map((d) => ({ value: d.id, label: d.name, data: d, }));

const useFormSubmission = (unitId: string) => {
  const autocompleteRef = useRef<RefHandles>(null);
  const { mutate: createOne } = useCreate();
  const { mutate: updateOne } = useUpdate();

  const onFormFinish = async (values: any) => {
    if (!autocompleteRef.current) return console.error("Autocomplete ref is null");

    const { added, removed } = autocompleteRef.current;

    try {
      added().forEach(option => {
        createOne({
          resource: "_TagToUnit",
          values: { A: option.data.id, B: unitId },
        });
      });
      removed().forEach(async option => {
        await supabase.from("_TagToUnit").delete().eq("A", option.data.id).eq("B", unitId);
      });

      updateOne({ resource: "Unit", values, id: unitId });
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  return { autocompleteRef, onFormFinish };
};


export const UnitEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();

  const [tagsAll] = useResource<Tag>("Tag", mapTagsToOption);
  const [optionsActive, setActive] = useState<OptionType<Tag>[]>([]);

  const unitId = queryResult?.data?.data.id! as string;
  const { autocompleteRef, onFormFinish } = useFormSubmission(unitId);

  useEffect(() => {
    setActive(mapTagsToOption(queryResult?.data?.data.tags || []));
  }, [queryResult?.data?.data.strategies]);

  const filter = (searchText: string): OptionType<Tag>[] => {
    return tagsAll.filter((option: OptionType<Tag>) => {
      return (
        option.data.name.toLowerCase().includes(searchText.toLowerCase()) ||
        option.data.id.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };
  queryResult && console.log('queryResult', queryResult)

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFormFinish}>
        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Corpus ID"
          name="corpusId"
          rules={[{ required: true, message: 'Please input the Corpus ID!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Corpus Type"
          name="corpusType"
          rules={[{ required: true, message: 'Please select a Corpus Type!' }]}
        >
          <Select placeholder="Select a corpus type">
            <Option value="WORD">Word</Option>
            <Option value="CONJUGATION">Conjugation</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Connected Strategies">
          <Autocomplete
            ref={autocompleteRef}
            filter={filter}
            optionsAll={tagsAll}
            optionsAtStart={optionsActive}
          />
        </Form.Item>

        {/* <Form.Item label="Data" name={['data']}>
            <MonacoEditor
            value={form.getFieldValue('data')}
            onChange={(newValue) => form.setFieldsValue({ data: newValue })}
            language="json"
            />
            </Form.Item> */}
      </Form>
    </Edit>
  );
}
