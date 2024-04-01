import React, { useRef, useState, useEffect } from "react";
import { useUpdate, IResourceComponentsProps } from "@refinedev/core";
import { SaveButton, useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import Connection, { type ConnectionEditHandles } from "$components/connection";
import JSONField from "$components/json-field/index";
import UnitSchema from "./unit-data-schema";

type CorpusType = "WORD" | "CONJUGATION";

export const UnitEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const { mutate: updateOne } = useUpdate();
  const unitId = queryResult?.data?.data.id! as string;
  const corpusType: CorpusType = form.getFieldValue("corpusType");
  const tagConnectionRef = useRef<ConnectionEditHandles | null>(null);

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Unit", values, id: unitId });
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
  console.log(jsonData);

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
        <Form.Item
          label="Corpus Type"
          name="corpusType"
          rules={[{ required: true, message: "Please select a Corpus Type!" }]}
        >
          <Select placeholder="Select a corpus type">
            <Option value="WORD">Word</Option>
            <Option value="CONJUGATION">Conjugation</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Corpus ID"
          name="corpusId"
          rules={[{ required: true, message: "Please input the Corpus ID!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Connected Tags">
          <Connection
            ref={tagConnectionRef}
            active={queryResult?.data?.data.tags}
            rootResourceId={unitId}
            connectionName="UnitToTag"
          />
        </Form.Item>
        <Form.Item name={["data"]}>
          {corpusType && (
            <JSONField
              schema={UnitSchema[corpusType]}
              data={jsonData}
              onChange={(data) => form.setFieldValue('data', data)}
            />
          )}
        </Form.Item>
      </Form>
    </Edit>
  );
};
