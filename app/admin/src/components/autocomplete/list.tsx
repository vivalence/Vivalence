import React, { ReactElement, useState } from "react";
import { Button, Skeleton, Avatar, List as AntList } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { type OptionType } from "./types"

interface ListProps<T> {
  listMembers: OptionType<T>[];
  onDelete: (option: OptionType<T>) => void;
  displayMember: (option: OptionType<T>) => string;
}

const List = <T,>({
  listMembers,
  displayMember,
  onDelete,
}: ListProps<T>): ReactElement => {
  return (
    <AntList
      dataSource={listMembers}
      renderItem={(member: OptionType<T>) => (
        <AntList.Item
          actions={[
            <Button
              size="small"
              danger
              onClick={() => onDelete(member)}
              icon={<DeleteOutlined />}
            />,
          ]}
        >
          <Skeleton avatar title={false} loading={false} active>
            <AntList.Item.Meta title={<span>{displayMember(member)}</span>} />
          </Skeleton>
        </AntList.Item>
      )}
    />
  );
};

export default List;
