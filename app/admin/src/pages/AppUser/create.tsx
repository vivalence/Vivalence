import React from "react";
import { IResourceComponentsProps, useCreate } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Button, message } from "antd";

import { supabaseClient } from "../../utility/supabaseClient"

export const AppUserCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm();

  const onFinish = async (values: any) => {
    const { data: { session } } = await supabaseClient.auth.getSession()

    const newUser = await supabaseClient.auth.signUp({
      email: values.email,
      password: values.password
    });
    console.log('newUser', newUser)

    await supabaseClient.auth.signOut();
    if (session) {
      await supabaseClient.auth.setSession(session);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input the user's email!" },
            { type: "email", message: "The input is not a valid email!" }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please input the password!" },
            { min: 6, message: "Password must be at least 6 characters long!" }
          ]}
        >
          <Input.Password />
        </Form.Item>
        {/* <Form.Item>
            <Button type="primary" htmlType="submit" loading={false}>
            Create User
            </Button>
            </Form.Item> */}
      </Form>
    </Create>
  );
};
