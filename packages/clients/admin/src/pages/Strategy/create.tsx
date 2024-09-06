import React from "react";
import { IResourceComponentsProps, useNavigation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

import { supabaseClient } from "../../utility/supabaseClient";

export const StrategyCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();
  const { editUrl, replace } = useNavigation();

  const onFinish = async (values: any) => {
    formProps.form?.resetFields();

    const { data, error } = await supabaseClient
      .from("Strategy")
      .insert([{ name: values.name }])
      .select();

    if (error) return console.error(error);

    const url = editUrl("Strategy", data[0].id!);
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
      </Form>
    </Create>
  );
};
