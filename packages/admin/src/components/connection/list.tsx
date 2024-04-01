import React, { ReactElement, } from "react";
import { Button, Skeleton, List as AntList } from "antd";
import { DeleteOutlined, LinkOutlined } from "@ant-design/icons";

import { type OptionType } from "./types"
import { type Resource } from "$types/index";

interface ListProps<T extends Resource> {
  listMembers: OptionType<T>[];
  onDelete: (option: OptionType<T>) => void;
}

const AnyLinkOutlined: any = LinkOutlined;
const AnyDeleteOutlined: any = DeleteOutlined;


const List = <T extends Resource,>({
  listMembers,
  onDelete,
}: ListProps<T>): ReactElement => {
  return (
    <AntList
      dataSource={listMembers}
      renderItem={(member: OptionType<T>) => (
        <AntList.Item
          actions={[
            <a href={member.link}>
              <Button
                size="small"
                icon={<AnyLinkOutlined />}
              /></a>,
            <Button
              size="small"
              danger
              onClick={() => onDelete(member)}
              icon={<AnyDeleteOutlined />}
            />,
          ]}
        >
          <Skeleton avatar title={false} loading={false} active>
            <AntList.Item.Meta title={<span>{member.label}</span>} />
          </Skeleton>
        </AntList.Item>
      )}
    />
  );
};

export default List;
