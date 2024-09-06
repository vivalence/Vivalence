import React, { useEffect, useRef, useState } from "react";
import { IResourceComponentsProps, useNavigation, useUpdate } from "@refinedev/core";

import { useDocumentTitle } from "@refinedev/react-router-v6";
import { DeleteButton, Edit, SaveButton, useForm } from "@refinedev/antd";
import { Form, Input, Select, Tabs } from "antd";
const { Option } = Select;

import Connection, { type ConnectionEditHandles } from "$components/connection";
import JSONField from "$components/json-field/index";
import UnitSchema from "./unit-data-schema";

export const UnitEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const { mutate: updateOne } = useUpdate();
  const { replace } = useNavigation();
  const unit = queryResult?.data?.data as any;
  const unitId = unit?.id! as string;
  const tagConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null);

  useDocumentTitle(`Unit: ${unit?.data.spanish}`);

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Unit", values, id: unitId });
      if (strategyConnectionRef.current) strategyConnectionRef.current.onSave();
      if (tagConnectionRef.current) tagConnectionRef.current.onSave();
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  const [jsonData, setJsonData] = useState();
  useEffect(() => setJsonData(form.getFieldValue("data")), [form, queryResult, formProps]);

  const items = [
    {
      key: "1",
      label: "Unit",
      children: (
        <>
          <Form.Item
            label="Object Status"
            name="objectStatus"
            rules={[{ required: true, message: "Please select a object status!" }]}
          >
            <Select placeholder="Select a Object Status">
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="DELETED">Deleted</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Corpus ID"
            name="corpusId"
            rules={[{ required: true, message: "Please input the Corpus ID!" }]}
          >
            <Input />
          </Form.Item>
        </>
      ),
    },
    {
      key: "2",
      label: "Connections",
      children: (
        <>
          <Form.Item label="Connected Tags">
            <Connection
              ref={tagConnectionRef}
              active={queryResult?.data?.data.tags}
              rootResourceId={unitId}
              connectionName="UnitToTag"
            />
          </Form.Item>
          <Form.Item label="Connected Strategies">
            <Connection
              ref={strategyConnectionRef}
              active={queryResult?.data?.data.strategies}
              rootResourceId={unitId}
              connectionName="UnitToStrategy"
            />
          </Form.Item>
        </>
      ),
    },
    {
      key: "3",
      label: "Data",
      children: (
        <Form.Item name={["data"]}>
          <JSONField
            schema={UnitSchema}
            data={jsonData}
            onChange={(data) => form.setFieldValue("data", data)}
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <Edit
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <SaveButton hideText {...saveButtonProps} />
          <DeleteButton resource="Unit" id={unitId} hideText onSuccess={() => replace("/unit")} />
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={onSave}>
        <Tabs defaultActiveKey="1" items={items} />
      </Form>
    </Edit>
  );
};
//import React, { useRef, useState, useEffect } from "react"; import { useUpdate, useNavigation, IResourceComponentsProps, } from "@refinedev/core"; import { useDocumentTitle } from "@refinedev/react-router-v6"; import { DeleteButton, SaveButton, useForm, Edit } from "@refinedev/antd"; import { Form, Input, Select } from "antd"; const { Option } = Select; import Connection, { type ConnectionEditHandles } from "$components/connection"; import JSONField from "$components/json-field/index"; import UnitSchema from "./unit-data-schema"; /* type CorpusType = "WORD" | "CONJUGATION"; */ export const UnitEdit: React.FC<IResourceComponentsProps> = () => {const { form, formProps, saveButtonProps, queryResult } = useForm(); const { mutate: updateOne } = useUpdate(); const { replace } = useNavigation(); const unit = queryResult?.data?.data as any; const unitId = unit?.id! as string; /* const corpusType: CorpusType = form.getFieldValue("corpusType"); */ const tagConnectionRef = useRef<ConnectionEditHandles | null>(null); const strategyConnectionRef = useRef<ConnectionEditHandles | null>(null); useDocumentTitle(`Unit: ${unit?.data.spanish}`); const onSave = async (values: any) => {try {updateOne({ resource: "Unit", values, id: unitId }); if (strategyConnectionRef.current) strategyConnectionRef.current.onSave(); if (tagConnectionRef.current) tagConnectionRef.current.onSave();} catch (error) {console.error("Error in mutation:", error);}}; const [jsonData, setJsonData] = useState(); useEffect(() => setJsonData(form.getFieldValue("data")), [form, queryResult, formProps],); return (<Edit headerButtons={({ defaultButtons }) => (<> {defaultButtons} <SaveButton hideText {...saveButtonProps} /> <DeleteButton resource="Unit" id={unitId} hideText onSuccess={() => replace("/unit")} /> </>)} saveButtonProps={saveButtonProps} > <Form {...formProps} layout="vertical" onFinish={onSave}> {/* <Form.Item label="Corpus Type" name="corpusType" rules={[{ required: true, message: "Please select a Corpus Type!" }]} > <Select placeholder="Select a corpus type"> <Option value="WORD">Word</Option> <Option value="CONJUGATION">Conjugation</Option> </Select> </Form.Item> */} <Form.Item label="Object Status" name="objectStatus" rules={[{ required: true, message: "Please select a object status!" }]} > <Select placeholder="Select a Object Status"> <Option value="ACTIVE">Active</Option> <Option value="INACTIVE">Inactive</Option> <Option value="DELETED">Deleted</Option> </Select> </Form.Item> <Form.Item label="Corpus ID" name="corpusId" rules={[{ required: true, message: "Please input the Corpus ID!" }]} > <Input /> </Form.Item> <Form.Item label="Connected Tags"> <Connection ref={tagConnectionRef} active={queryResult?.data?.data.tags} rootResourceId={unitId} connectionName="UnitToTag" /> </Form.Item> <Form.Item label="Connected Strategies"> <Connection ref={strategyConnectionRef} active={queryResult?.data?.data.strategies} rootResourceId={unitId} connectionName="UnitToStrategy" /> </Form.Item> <Form.Item name={["data"]}> <JSONField schema={UnitSchema} data={jsonData} onChange={(data) => form.setFieldValue('data', data)} /> </Form.Item> </Form> </Edit>);}; */
