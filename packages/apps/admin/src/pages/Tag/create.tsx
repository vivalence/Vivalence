import React from "react";
import { IResourceComponentsProps, useNavigation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import { supabaseClient } from "../../utility/supabaseClient";

export const TagCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();
  const { editUrl, replace } = useNavigation();

  const onFinish = async (values: any) => {
    formProps.form?.resetFields();

    const { data, error } = await supabaseClient
      .from("Tag")
      .insert([{ name: values.name, type: values.type }])
      .select();

    if (error) return console.error(error);

    const url = editUrl("Tag", data[0].id!);
    replace(url);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Please input a name" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Please select at least one Tag Type!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select tag types"
          >
            <Option value="STRUCTURAL">Structural</Option>
            <Option value="ONTOLOGICAL">Ontological</Option>
            <Option value="LEARNABLE">Learnable</Option>
            <Option value="COMPLETABLE">Completable</Option>
          </Select>
        </Form.Item>
      </Form>
    </Create>
  );
};
