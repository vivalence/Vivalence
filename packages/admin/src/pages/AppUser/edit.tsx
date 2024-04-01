import React, { useRef } from "react";
import { useUpdate, IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm, SaveButton } from "@refinedev/antd";
import { Select, Form, Input, Typography } from "antd";

import Connection, { type ConnectionEditHandles } from "$components/connection";

export const AppUserEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const appUserData = queryResult?.data?.data;
  const userId = appUserData?.id! as string;
  const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null);

  const { mutate: updateOne } = useUpdate();
  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "AppUser", values, id: userId });
      if (strategyConnectionRef.current) strategyConnectionRef.current.onSave();
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
        <Form.Item label="Connected Strategies">
          <Connection
            ref={strategyConnectionRef}
            active={queryResult?.data?.data.strategies}
            rootResourceId={userId}
            connectionName="UserToStrategy"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
