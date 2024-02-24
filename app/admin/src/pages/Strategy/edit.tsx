import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../utility/supabaseClient";
import { useCreate, useDeleteMany, useUpdate, useList, IResourceComponentsProps } from "@refinedev/core";
import { useForm, Edit } from "@refinedev/antd";

import { Form, Input, AutoComplete, DatePicker, List, Button, Skeleton, Avatar } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

interface IUser {
  id: string;
  email: string;
  roles: string[];
}

interface AutoCompleteOption {
  value: string;
  label: string;
  user: IUser;
}

// Map user to AutoCompleteOption. with output types
const mACO = (user: IUser) => ({ value: user.id, label: user.email, user });


export const StrategyEdit: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const strategyId = queryResult?.data?.data.id!;
  /* console.log("queryResult", queryResult, strategyId, queryResult?.data?.data.users); */

  /* const { mutate: createMany } = useCreateMany(); */
  const { mutate: createOne } = useCreate();
  const { mutate: deleteMany } = useDeleteMany();
  const { mutate: updateOne } = useUpdate();


  const list = useList<IUser>({ resource: "AppUser" });
  const [connectedUsers, setConnectedUsers] = useState<AutoCompleteOption[]>([]) //(queryResult?.data?.data.users.map(mACO) || []);
  const [searchOptions, setOptions] = useState<AutoCompleteOption[]>([]) //(users?.data.map(mACO) || []);

  useEffect(() => { if (queryResult?.status === 'success') setConnectedUsers(queryResult?.data?.data.users.map(mACO)); }, [queryResult?.status]);
  useEffect(() => { if (list.status === "success") setOptions(list.data?.data.map(mACO)); }, [list.status]);

  const onSearch = (searchText: string) => { setOptions(list.data?.data.filter((user) => user.email.toLowerCase().includes(searchText.toLowerCase()),).map(mACO) || [],); };
  const onSelect = (value: string, options: any) => { setConnectedUsers([...connectedUsers.filter((u) => u.value !== options.user.id), mACO(options.user)]); };
  const onDelete = (option: AutoCompleteOption) => () => { setConnectedUsers([...connectedUsers.filter((u) => u.value !== option.user.id)]); };

  const onFormFinish = async (values: any) => {
    console.log("onFormFinish", values);

    const usersPre: IUser[] = queryResult?.data?.data.users
    const usersPost: IUser[] = connectedUsers.map((u) => u.user)
    /* console.log("usersPre", usersPre); console.log("usersPost", usersPost); */
    const usersToJoin = usersPost.filter((u) => !usersPre.some((u2) => u2.id === u.id))
    const usersToUnjoin = usersPre.filter((u) => !usersPost.some((u2) => u2.id === u.id))
    /* console.log("usersToJoin", usersToJoin); console.log("usersToUnjoin", usersToUnjoin); */

    try {
      for (const user of usersToJoin) {
        createOne({ resource: "_AppUserToStrategy", values: { A: user.id, B: strategyId } });
      }
      for (const user of usersToUnjoin) {
        await supabaseClient.from('_AppUserToStrategy').delete().eq('A', user.id).eq('B', strategyId);
      }

      updateOne({ resource: "Strategy", values, id: strategyId, });

    } catch (error) {
      console.error('Error in mutation:', error)
    }

  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFormFinish}>

        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>


        <Form.Item label="Connected Users">
          <AutoComplete
            options={searchOptions}
            onSearch={onSearch}
            onSelect={onSelect}
            placeholder="Search users by ID or email"
            notFoundContent="No users found"
          />
        </Form.Item>
        <Form.Item>
          <List
            dataSource={connectedUsers}
            renderItem={(option: AutoCompleteOption) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    danger
                    onClick={onDelete(option)}
                    icon={<DeleteOutlined />}
                  />
                ]}
              >
                <Skeleton avatar title={false} loading={false} active>
                  <List.Item.Meta title={<span>{option.user.email}</span>} />
                </Skeleton>
              </List.Item>
            )}
          />
        </Form.Item>
        {/* */}

        {/*
            loading={initLoading}
            renderItem={(item) => (
            <List.Item
            actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a>]}
            >
            <Skeleton avatar title={false} loading={item.loading} active>
            <List.Item.Meta
            avatar={<Avatar src={item.picture.large} />}
            title={<a href="https://ant.design">{item.name?.last}</a>}
            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            />
            <div>content</div>
            </Skeleton>
            </List.Item>
            )}
          */}


      </Form>
    </Edit >
  );
};

/* const handleSubmit = async () => {
 *   const { users } = form.getFieldsValue(); // Assuming 'users' field holds the selected user IDs

 *   // Determine connections to add and remove based on comparison with initial state
 *   // This part depends on how you manage state and will vary based on your exact requirements

 *   // Example: Update connections
 *   // Here you would loop over the users to add or remove and call the updateConnection mutation for each
 *   // The actual implementation depends on your API design

 *   users.forEach(userId => {
 *     updateConnection({
 *       resource: 'userStrategyConnections', // Assuming this is your join table resource name
 *       type: 'create', // Or 'delete' for removals
 *       payload: { data: { userId, strategyId: record.id } }, // Adjust based on your API
 *     });
 *   });

 *   // Handle additions and removals here...
 * }; */
