import React, { useRef } from "react";
import { IResourceComponentsProps, useUpdate } from "@refinedev/core";
import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { Form, Input, Select, Tabs } from "antd";
import { useDocumentTitle } from "@refinedev/react-router-v6";
const { Option } = Select;

import Container from "$components/kit/Container";
import Connection, { type ConnectionEditHandles } from "$components/connection";
import Monaco from "$components/monaco-editor/index";
import Relations from "$components/relations/Relations";
/* import JSONField from "$components/json-field/index"; */

const defaultActiveKey = "3";

export const StrategyEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const strategy = queryResult?.data?.data as any;
  const strategyId = strategy?.id! as string;
  const unitConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const userConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const gameConnectionRef = useRef<ConnectionEditHandles | null>(null);
  const tagConnectionRef = useRef<ConnectionEditHandles | null>(null);

  const connections = {
    games: strategy?.games,
    tags: strategy?.tags,
    units: strategy?.units,
  };
  const { mutate: updateOne } = useUpdate();
  useDocumentTitle(`Strategy: ${strategy?.name}`);

  const onSave = async (values: any) => {
    try {
      updateOne({ resource: "Strategy", values, id: strategyId });
      if (unitConnectionRef.current) unitConnectionRef.current.onSave();
      if (userConnectionRef.current) userConnectionRef.current.onSave();
      if (gameConnectionRef.current) gameConnectionRef.current.onSave();
      if (tagConnectionRef.current) tagConnectionRef.current.onSave();
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  const items = [
    {
      key: "1",
      label: "Strategy",
      children: (
        <Container>
          <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
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
        </Container>
      ),
    },
    {
      key: "2",
      label: "Connections",
      children: (
        <>
          <Container>
            <Form.Item label="Connected Users">
              <Connection
                ref={userConnectionRef}
                active={queryResult?.data?.data.users}
                rootResourceId={strategyId}
                connectionName="StrategyToUser"
              />
            </Form.Item>
          </Container>
          <Container>
            <Form.Item label="Connected Games">
              <Connection
                ref={gameConnectionRef}
                active={queryResult?.data?.data.games}
                rootResourceId={strategyId}
                connectionName="StrategyToGame"
              />
            </Form.Item>
          </Container>
          <Container>
            <Form.Item label="Connected Tags">
              <Connection
                ref={tagConnectionRef}
                active={queryResult?.data?.data.tags}
                rootResourceId={strategyId}
                connectionName="StrategyToTag"
              />
            </Form.Item>
          </Container>
          <Container>
            <Form.Item label="Connected Units">
              <Connection
                ref={unitConnectionRef}
                active={queryResult?.data?.data.units}
                rootResourceId={strategyId}
                connectionName="StrategyToUnit"
              />
            </Form.Item>
          </Container>
        </>
      ),
    },
    {
      key: "3",
      label: "Relations",
      children: (
        <Form.Item name={["relations"]}>
          {
            // @ts-ignore
            <Relations connections={connections} />
          }
        </Form.Item>
      ),
    },
    {
      key: "4",
      label: "Provision",
      children: (
        <Form.Item name={["provision", "run"]}>
          <Monaco height="80vh" />
        </Form.Item>
      ),
    },
    // {key: '5', label: 'Data', children: (<Form.Item name={["data"]}> hi </Form.Item>),},
  ];

  return (
    <Edit
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <SaveButton {...saveButtonProps} />
        </>
      )}
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical" onFinish={onSave}>
        <Tabs defaultActiveKey={defaultActiveKey} items={items} />
      </Form>
    </Edit>
  );
};

/* export const StrategyEdit: React.FC<IResourceComponentsProps> = () => {const { form, formProps, saveButtonProps, queryResult } = useForm(); const strategy = queryResult?.data?.data as any; const strategyId = strategy?.id! as string; const unitConnectionRef = useRef<ConnectionEditHandles | null>(null); const userConnectionRef = useRef<ConnectionEditHandles | null>(null); const gameConnectionRef = useRef<ConnectionEditHandles | null>(null); const tagConnectionRef = useRef<ConnectionEditHandles | null>(null); const { mutate: updateOne } = useUpdate(); useDocumentTitle(`Strategy: ${strategy?.name}`); const onSave = async (values: any) => {try {updateOne({ resource: "Strategy", values, id: strategyId }); if (unitConnectionRef.current) unitConnectionRef.current.onSave(); if (userConnectionRef.current) userConnectionRef.current.onSave(); if (gameConnectionRef.current) gameConnectionRef.current.onSave(); if (tagConnectionRef.current) tagConnectionRef.current.onSave();} catch (error) {console.error("Error in mutation:", error);}}; const [jsonData, setJsonData] = useState(); useEffect(() => setJsonData(form.getFieldValue("data")), [form, queryResult, formProps],); return (<Edit headerButtons={({ defaultButtons }) => (<> {defaultButtons} <SaveButton {...saveButtonProps} /> </>)} saveButtonProps={saveButtonProps}> <Form {...formProps} layout="vertical" onFinish={onSave}> <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}> <Input /> </Form.Item> <Form.Item label="Object Status" name="objectStatus" rules={[{ required: true, message: "Please select a object status!" }]} > <Select placeholder="Select a Object Status"> <Option value="ACTIVE">Active</Option> <Option value="INACTIVE">Inactive</Option> <Option value="DELETED">Deleted</Option> </Select> </Form.Item> <Form.Item label="Connected Users"> <Connection ref={userConnectionRef} active={queryResult?.data?.data.users} rootResourceId={strategyId} connectionName="StrategyToUser" /> </Form.Item> <Form.Item label="Connected Games"> <Connection ref={gameConnectionRef} active={queryResult?.data?.data.games} rootResourceId={strategyId} connectionName="StrategyToGame" /> </Form.Item> <Form.Item label="Connected Tags"> <Connection ref={tagConnectionRef} active={queryResult?.data?.data.tags} rootResourceId={strategyId} connectionName="StrategyToTag" /> </Form.Item> <Form.Item label="Connected Units"> <Connection ref={unitConnectionRef} active={queryResult?.data?.data.units} rootResourceId={strategyId} connectionName="StrategyToUnit" /> </Form.Item> <Form.Item name={["data"]}> <JSONField schema={StrategySchema} data={jsonData} onChange={(data) => form.setFieldValue("data", data)} /> </Form.Item> </Form> </Edit>);}; */

{
  /* onChange={(data) => form.setFieldValue("data", data)} */
}
{
  /* formData={jsonData} */
}
{
  /* schema={StrategySchema} */
}
{
  /* data={jsonData} */
}
{
  /* onChange={(data) => form.setFieldValue("data", data)} */
}
