import React from "react";
import { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import { DeleteButton, EditButton, List, SaveButton, ShowButton, TagField, useTable } from "@refinedev/antd";
import { Form, Input, Space, Table } from "antd";

export const GameList: React.FC<IResourceComponentsProps> = () => {
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
    onSearch: (values: any) => {
      return [
        {
          field: "name",
          operator: "contains",
          value: values.value,
        },
      ];
    },
    syncWithLocation: true,
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
        <Table.Column
          dataIndex={["name"]}
          title="name"
          render={(value: any) => value}
        />
        <Table.Column
          dataIndex="type"
          title="Type"
          render={(value: string) => <TagField value={value} key={value} />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
