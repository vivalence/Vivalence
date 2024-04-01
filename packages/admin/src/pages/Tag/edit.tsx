import React, { useRef, useState, useEffect } from "react";
import { useUpdate, IResourceComponentsProps } from "@refinedev/core";
import { useForm, Edit, SaveButton } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import Connection, { type ConnectionEditHandles } from "$components/connection";

export const TagEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const { mutate: updateOne } = useUpdate();
  const unitConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const tagId = queryResult?.data?.data.id! as string;

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Tag", values, id: tagId });
      if (strategyConnectionRef.current) strategyConnectionRef.current.onSave();
      if (unitConnectionRef.current) unitConnectionRef.current.onSave();
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };
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
          <Connection
            ref={strategyConnectionRef}
            active={queryResult?.data?.data.strategies}
            rootResourceId={tagId}
            connectionName="TagToStrategy"
          />
        </Form.Item>
        <Form.Item label="Connected Units">
          <Connection
            ref={unitConnectionRef}
            active={queryResult?.data?.data.units}
            rootResourceId={tagId}
            connectionName="TagToUnit"
          />
        </Form.Item>


      </Form>
    </Edit>
  );
}
