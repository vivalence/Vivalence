import React from "react";
import { IResourceComponentsProps, useNavigation, } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";

import { Form, Input, Select } from "antd";
const { Option } = Select;

import { supabaseClient } from "$util/supabaseClient"

export const UnitCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();
  const { editUrl, replace } = useNavigation();

  const onFinish = async (values: any) => {
    formProps.form?.resetFields();

    const { data, error } = await supabaseClient
      .from('Unit')
      .insert([
        {
          corpusId: values.corpusId,
          corpusType: values.corpusType,
          data: {}
        }
      ])
      .select()

    if (error) return console.error(error)

    const url = editUrl("Unit", data[0].id!)
    replace(url);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Corpus ID"
          name="corpusId"
          rules={[{ required: true, message: 'Please input the Corpus ID!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Corpus Type"
          name="corpusType"
          rules={[{ required: true, message: 'Please select a Corpus Type!' }]}
        >
          <Select
            placeholder="Select a corpus type">
            <Option value="WORD">Word</Option>
            <Option value="CONJUGATION">Conjugation</Option>
          </Select>
        </Form.Item>
      </Form>
    </Create >
  );
};
