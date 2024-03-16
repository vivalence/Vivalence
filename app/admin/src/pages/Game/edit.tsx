import React, { useRef, useState, useEffect } from "react";
import {
  useCreate,
  useUpdate,
  IResourceComponentsProps,
} from "@refinedev/core";
import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import supabase from "$util/supabaseClient";
import { type Strategy } from "$types/index";
import Autocomplete, {
  type OptionType,
  type RefHandles,
} from "$components/autocomplete/index";
import { useResource } from "$util/hooks/index";
import JSONField from "$components/json-field/index";
import GameSchema from "./game-data-schema";

type GameType = "FLASHCARDS" | "TRANSLATIONS";

const mapStrategiesToOption = (data: Strategy[]): OptionType<Strategy>[] =>
  data.map((d) => ({ value: d.id, label: d.name, data: d }));

const useFormSubmission = (gameId: string) => {
  const autocompleteRef = useRef<RefHandles>(null);
  const { mutate: createOne } = useCreate();
  const { mutate: updateOne } = useUpdate();

  const onFormFinish = async (values: any) => {
    if (!autocompleteRef.current) return console.error("Autocomplete ref is null");

    const { added, removed } = autocompleteRef.current;

    try {
      added().forEach((option) => {
        createOne({
          resource: "_StrategyToGame",
          values: { B: option.data.id, A: gameId },
        });
      });
      removed().forEach(async (option) => {
        await supabase
          .from("_StrategyToGame")
          .delete()
          .eq("B", option.data.id)
          .eq("A", gameId);
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

  const [strategiesAll] = useResource<Strategy>("Strategy", mapStrategiesToOption,);
  const [optionsActive, setActive] = useState<OptionType<Strategy>[]>([]);

  const gameId = queryResult?.data?.data.id! as string;
  const { autocompleteRef, onFormFinish } = useFormSubmission(gameId);

  useEffect(() => { setActive(mapStrategiesToOption(queryResult?.data?.data.strategies || [])); }, [queryResult?.data?.data.strategies]);

  const filter = (searchText: string): OptionType<Strategy>[] => {
    return strategiesAll.filter((option: OptionType<Strategy>) => {
      return (
        option.data.name.toLowerCase().includes(searchText.toLowerCase()) ||
        option.data.id.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  const gametype: GameType = form.getFieldValue("type");

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFormFinish}>
        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Please select a Game Type!" }]}
        >
          <Select placeholder="Select a game type">
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
        <Form.Item name={["data"]}>
          {/* Need to register field with form, but field cant be child of form */}
        </Form.Item>
      </Form>
      {gametype && (
        <JSONField
          schema={GameSchema[gametype]}
          data={form.getFieldValue("data")}
          onChange={(data) => form.setFieldValue('data', data)}
        />
      )}
    </Edit>
  );
};
