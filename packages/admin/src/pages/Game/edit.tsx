import React, { useRef, useState, useEffect } from "react";
import { useUpdate, IResourceComponentsProps, } from "@refinedev/core";
import { useForm, Edit, SaveButton } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import Connection, { type ConnectionEditHandles } from "$components/connection";
import JSONField from "$components/json-field/index";
import GameSchema from "./game-data-schema";

type GameType = "FLASHCARDS" | "TRANSLATIONS";

export const GameEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const { mutate: updateOne } = useUpdate();
  const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const gametype: GameType = form.getFieldValue("type");
  const gameId = queryResult?.data?.data.id! as string;

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Game", values, id: gameId });
      if (strategyConnectionRef.current) strategyConnectionRef.current.onSave();
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  const [jsonData, setJsonData] = useState();
  useEffect(
    () => setJsonData(form.getFieldValue("data")),
    [form, queryResult, formProps],
  );

  return (
    <Edit
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <SaveButton {...saveButtonProps} />
        </>
      )}
      saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onSave}>
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
          <Connection
            ref={strategyConnectionRef}
            active={queryResult?.data?.data.strategies}
            rootResourceId={gameId}
            connectionName="GameToStrategy"
          />
        </Form.Item>
        <Form.Item name={["data"]}>
          {gametype && (
            <JSONField
              schema={GameSchema[gametype]}
              data={jsonData}
              onChange={(data) => form.setFieldValue('data', data)}
            />
          )}
        </Form.Item>
      </Form>
    </Edit>
  );
};
