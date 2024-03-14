import React, { useRef, useState, useEffect } from "react";
import { useCreate, useUpdate, useList, IResourceComponentsProps, BaseRecord, } from "@refinedev/core";
import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import supabase from "$util/supabaseClient";
import { type Strategy } from "$types/index";
import MonacoEditor from "$components/monaco-editor/index";
import Autocomplete, { type OptionType, type RefHandles, } from "$components/autocomplete/index";
import { useResource } from "$util/hooks/index";

const mapStrategiesToOption = (data: Strategy[]): OptionType<Strategy>[] =>
  data.map((d) => ({ value: d.id, label: d.name, data: d, }));

const useFormSubmission = (gameId: string) => {
  const autocompleteRef = useRef<RefHandles>(null);
  const { mutate: createOne } = useCreate();
  const { mutate: updateOne } = useUpdate();

  const onFormFinish = async (values: any) => {
    if (!autocompleteRef.current) return console.error("Autocomplete ref is null");

    const { added, removed } = autocompleteRef.current;

    try {
      added().forEach(option => {
        createOne({
          resource: "_StrategyToGame",
          values: { B: option.data.id, A: gameId },
        });
      });
      removed().forEach(async option => {
        await supabase.from("_StrategyToGame").delete().eq("B", option.data.id).eq("A", gameId);
      });

      updateOne({ resource: "Game", values, id: gameId });
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  return { autocompleteRef, onFormFinish };
};

export const GameEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();

  const [strategiesAll] = useResource<Strategy>("Strategy", mapStrategiesToOption);
  const [optionsActive, setActive] = useState<OptionType<Strategy>[]>([]);

  const gameId = queryResult?.data?.data.id! as string;
  const { autocompleteRef, onFormFinish } = useFormSubmission(gameId,);

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

  /* console.log("form.getFieldValue('data')", form.getFieldValue('data')) */
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFormFinish}>
        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select a Game Type!' }]}
        >
          <Select placeholder="Select a game type" >
            <Option value="FLASHCARDS">Flashcards</Option>
            <Option value="TRANSLATIONS">Translations</Option>
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

        <Form.Item label="Data" name={['data']}>
          <MonacoEditor
            value={form.getFieldValue('data')}
            onChange={(data) => form.setFieldsValue({ data })}
            language="json"
          />
        </Form.Item>

      </Form>
    </Edit>
  );
}
