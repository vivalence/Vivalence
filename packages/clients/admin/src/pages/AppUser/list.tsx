import React from "react";
/* import { AntdInferencer } from "@refinedev/inferencer/antd"; */
import { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import { DeleteButton, EditButton, List, SaveButton, ShowButton, TagField, useTable } from "@refinedev/antd";
import { Form, Input, Space, Table } from "antd";

export const AppUserList: React.FC<IResourceComponentsProps> = () => {
  /* return (<AntdInferencer />) */
  const { tableProps, searchFormProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "email",
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
          field: "email",
          operator: "contains",
          value: values.value,
        },
      ];
    },
  });

  /* const many = useMany({resource: "AppUser", ids: tableProps?.dataSource?.map((item: any) => item.id), queryOptions: {enabled: !!tableProps?.dataSource,},}); */
  /* console.log('many', many) */

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
          dataIndex={["email"]}
          title="Email"
          render={(value: any) => value}
        />
        <Table.Column
          dataIndex="roles"
          title="Roles"
          render={(value: any[]) => (
            <>
              {value?.map((item) => <TagField value={item} key={item} />)}
            </>
          )}
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
