import React, { useRef, useState, useEffect } from "react";
import {
  useUpdate,
  IResourceComponentsProps,
  useNavigation,
} from "@refinedev/core";
import { useDocumentTitle } from "@refinedev/react-router-v6";

import { useForm, Edit, SaveButton, DeleteButton } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
const { Option } = Select;

import Connection, { type ConnectionEditHandles } from "$components/connection";
import JSONField from "$components/json-field/index";
import TagSchema from "./tag-data-schema";

type TagType = ("STRUCTURAL" | "ONTOLOGICAL" | "LEARNABLE")[];

export const TagEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const { mutate: updateOne } = useUpdate();
  const { replace } = useNavigation();
  const unitConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const tagtype: TagType = form.getFieldValue("type");
  const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const tag = queryResult?.data?.data as any;
  const tagId = tag?.id! as string;
  useDocumentTitle(`Tag: ${tag?.name}`);

  const onSave = async (values: any) => {
    /* console.log("values", values); */
    try {
      updateOne({ resource: "Tag", values, id: tagId });
      if (strategyConnectionRef.current) strategyConnectionRef.current.onSave();
      if (unitConnectionRef.current) unitConnectionRef.current.onSave();
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  const [jsonData, setJsonData] = useState({} as any);
  useEffect(
    () => setJsonData(form.getFieldValue("data")),
    [form, queryResult, formProps],
  );
  /* console.log("jsonData", jsonData); */

  return (
    <Edit
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <SaveButton hideText {...saveButtonProps} />
          <DeleteButton
            resource="Tag"
            id={tagId}
            hideText
            onSuccess={() => replace("/tag")}
          />
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={onSave}>
        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[
            { required: true, message: "Please select at least one Tag Type!" },
          ]}
        >
          <Select mode="multiple" placeholder="Select tag types">
            <Option value="STRUCTURAL">Structural</Option>
            <Option value="ONTOLOGICAL">Ontological</Option>
            <Option value="LEARNABLE">Learnable</Option>
            <Option value="COMPLETABLE">Completable</Option>

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

        <Form.Item name={["data"]}>
          {tagtype &&
            tagtype.map((type) => (
              <div key={type}>
                <label>{type}</label>
                <JSONField
                  key={type}
                  schema={TagSchema[type]}
                  data={jsonData[type]}
                  onChange={(data = {}) => {
                    {/* console.log('update', data) */ }
                    form.setFieldValue(`data`, { ...jsonData, [type]: data })
                  }}
                />
              </div>
            ))}
        </Form.Item>
      </Form>
    </Edit>
  );
};
