import React from "react";
/* import { AntdInferencer } from "@refinedev/inferencer/antd"; */
import { IResourceComponentsProps, BaseRecord } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  DeleteButton,
  ShowButton,
  DateField,
  TagField,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const AppUserList: React.FC<IResourceComponentsProps> = () => {
  /* return (<AntdInferencer />) */
  const { tableProps } = useTable({ syncWithLocation: true });

  /* const many = useMany({resource: "AppUser", ids: tableProps?.dataSource?.map((item: any) => item.id), queryOptions: {enabled: !!tableProps?.dataSource,},}); */
  /* console.log('many', many) */

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["email"]}
          title="Email"
          render={(value: any) => value}
        />
        <Table.Column
          dataIndex={["id"]}
          title="User"
          render={(value: any) => value}
        />
        <Table.Column
          dataIndex={["createdAt"]}
          title="Created At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex={["updatedAt"]}
          title="Updated At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex="roles"
          title="Roles"
          render={(value: any[]) => (
            <>
              {value?.map((item) => (
                <TagField value={item} key={item} />
              ))}
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
