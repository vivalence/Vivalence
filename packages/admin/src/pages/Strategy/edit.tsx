import React, { useRef, useState, useEffect } from "react";
import { useUpdate, IResourceComponentsProps } from "@refinedev/core";
import { useForm, Edit, SaveButton, } from "@refinedev/antd";
import { Form, Input } from "antd";

import Connection, { type ConnectionEditHandles } from "$components/connection";
import JSONField from "$components/json-field/index";

import StrategySchema from "./strategy-data-schema";

export const StrategyEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const strategyId = queryResult?.data?.data.id! as string;
  const userConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const gameConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const tagConnectionRef = useRef<ConnectionEditHandles | null>(null);

  const { mutate: updateOne } = useUpdate();

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Strategy", values, id: strategyId });
      if (userConnectionRef.current) userConnectionRef.current.onSave();
      if (gameConnectionRef.current) gameConnectionRef.current.onSave();
      if (tagConnectionRef.current) tagConnectionRef.current.onSave();
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

        <Form.Item label="Connected Users">
          <Connection
            ref={userConnectionRef}
            active={queryResult?.data?.data.users}
            rootResourceId={strategyId}
            connectionName="StrategyToUser"
          />
        </Form.Item>
        <Form.Item label="Connected Games">
          <Connection
            ref={gameConnectionRef}
            active={queryResult?.data?.data.games}
            rootResourceId={strategyId}
            connectionName="StrategyToGame"
          />
        </Form.Item>
        <Form.Item label="Connected Tags">
          <Connection
            ref={tagConnectionRef}
            active={queryResult?.data?.data.tags}
            rootResourceId={strategyId}
            connectionName="StrategyToTag"
          />
        </Form.Item>
        <Form.Item name={["data"]}>
          <JSONField
            schema={StrategySchema}
            data={jsonData}
            onChange={(data) => form.setFieldValue("data", data)}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
