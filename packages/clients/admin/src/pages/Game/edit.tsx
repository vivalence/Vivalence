import React, { useEffect, useRef, useState } from "react";
import { IResourceComponentsProps, useUpdate } from "@refinedev/core";
import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { Form, Input, Select, Tabs } from "antd";
const { Option } = Select;

import Connection, { type ConnectionEditHandles } from "$components/connection";
import JSONField from "$components/json-field/index";
import GameSchema from "./game-data-schema";

type GameType = "FLASHCARDS" | "TRANSLATIONS" | "CONJUGATIONS";

export const GameEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const { mutate: updateOne } = useUpdate();
  const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const gametype: GameType = form.getFieldValue("type");
  const game = queryResult?.data?.data as any;
  const gameId = game?.id! as string;
  useDocumentTitle(`Game: ${game?.name}`);

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Game", values, id: gameId });
      if (strategyConnectionRef.current) strategyConnectionRef.current.onSave();
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  const [jsonData, setJsonData] = useState();
  useEffect(() => setJsonData(form.getFieldValue("data")), [form, queryResult, formProps]);

  const items = [
    {
      key: "1",
      label: "Game",
      children: (
        <>
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
              <Option value="CONJUGATIONS">Conjugations</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Object Status"
            name="objectStatus"
            rules={[{ required: true, message: "Please select a object status!" }]}
          >
            <Select placeholder="Select a Object Status">
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="DELETED">Deleted</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      key: "2",
      label: "Connections",
      children: (
        <Form.Item label="Connected Strategies">
          <Connection
            ref={strategyConnectionRef}
            active={queryResult?.data?.data.strategies}
            rootResourceId={gameId}
            connectionName="GameToStrategy"
          />
        </Form.Item>
      ),
    },
    {
      key: "3",
      label: "Data",
      children: (
        <Form.Item name={["data"]}>
          {gametype && (
            <JSONField
              schema={GameSchema[gametype]}
              data={jsonData}
              onChange={(data) => form.setFieldValue("data", data)}
            />
          )}
        </Form.Item>
      ),
    },
  ];

  return (
    <Edit
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <SaveButton {...saveButtonProps} />
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={onSave}>
        <Tabs defaultActiveKey="1" items={items} />
      </Form>
    </Edit>
  );
};
