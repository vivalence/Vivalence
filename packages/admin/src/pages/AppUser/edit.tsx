import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";

/* import { AntdInferencer } from "@refinedev/inferencer/antd"; */
/* export const AppUserEdit: React.FC<IResourceComponentsProps> = () => { return <AntdInferencer />; }; */

import { Edit, useForm } from "@refinedev/antd";
import { Select, Form, Input, DatePicker, Typography } from "antd";
import dayjs from "dayjs";

export const AppUserEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();

  const appUserData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Id"
          name={["id"]}
          rules={[{ required: true, },]}
        >
          <Input readOnly disabled />
        </Form.Item>
        <div style={{ marginBottom: "16px" }}>
          <Typography.Text
            strong
            style={{ display: "block", marginBottom: "8px" }}
          >
            Email
          </Typography.Text>

          <Typography.Text>{appUserData?.email}</Typography.Text>
        </div>

        <Form.Item
          name={["roles"]}
          label="Roles"
          rules={[{ required: true, message: 'Please select at least one role' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select roles"
            defaultValue={appUserData?.roles}
          >
            {["ADMIN", "USER", "GUEST"].map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};
