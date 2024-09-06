import React from "react";
import { IResourceComponentsProps, useNavigation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import { supabaseClient } from "../../utility/supabaseClient";

export const GameCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();
  const { editUrl, replace } = useNavigation();

  const onFinish = async (values: any) => {
    formProps.form?.resetFields();

    const { data, error } = await supabaseClient.from("Game").insert([values]).select();

    if (error) return console.error(error);

    const url = editUrl("Game", data[0].id!);
    replace(url);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input a name" }]}
        >
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
      </Form>
    </Create>
  );
};
