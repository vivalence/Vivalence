import React from "react";
import { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import {
  CloneButton,
  DeleteButton,
  EditButton,
  List,
  SaveButton,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Form, Input, Space, Table } from "antd";

export const StrategyList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps, searchFormProps } = useTable({
    sorters: {
      initial: [
        {
          field: "name",
          order: "asc",
        },
      ],
    },
    pagination: {
      pageSize: 100,
    },
    syncWithLocation: true,
    onSearch: (values: any) => {
      return [
        {
          field: "name",
          operator: "contains",
          value: values.value,
        },
      ];
    },
  });

  return (
    <List>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="value">
          <Input placeholder="Search" />
        </Form.Item>
        <SaveButton hideText onClick={searchFormProps.form?.submit} />
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex={["name"]} title="Email" render={(value: any) => value} />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <CloneButton hideText size="small" resource="Strategy" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
