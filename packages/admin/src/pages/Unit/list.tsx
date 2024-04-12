import React from "react";
import { IResourceComponentsProps, BaseRecord } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  DeleteButton,
  SaveButton,
  ShowButton,
  TagField,
} from "@refinedev/antd";
import { Table, Space, Form, Input, } from "antd";

export const UnitList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps, searchFormProps } = useTable({
    sorters: {
      initial: [
        {
          field: "id",
          order: "asc",
        },
      ],
    },
    pagination: {
      pageSize: 20,

    },
    syncWithLocation: true,
    meta: {
      count: "estimated",
    },
    onSearch: (values: any) => {
      return [
        {
          field: "data->>spanish",
          operator: "contains",
          /* operator: "eq", */
          value: values.value,
        },
        /* {
         *   field: "data->>english",
         *   operator: "contains",
         *   value: values.value,
         * }, */
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
      <Table {...tableProps}
        rowKey="id">
        <Table.Column
          dataIndex={["name"]}
          title="name"
          render={(_: any, data: any) => `${data.data.spanish} - ${data.data.english}`
          }
        />
        <Table.Column
          dataIndex="corpusType"
          title="Type"
          render={(value: string) => <TagField value={value} key={value} />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
              />
              <ShowButton
                hideText
                size="small"
                recordItemId={record.id}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

