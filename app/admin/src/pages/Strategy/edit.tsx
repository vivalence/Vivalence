import React, { useRef, useState, useEffect } from "react";
import { useCreate, useUpdate, useList, IResourceComponentsProps, } from "@refinedev/core";
import { useForm, Edit } from "@refinedev/antd";
import { Form, Input } from "antd";

import { useResource } from "$util/hooks/index";
import supabase from "$util/supabaseClient";
import { type User } from "$types/index";
import MonacoEditor from "$components/monaco-editor/index";
import Autocomplete, {
  type OptionType,
  type RefHandles,
} from "$components/autocomplete/index";


const mapUsersToOption = (users: User[]): OptionType<User>[] =>
  users.map((user) => ({
    value: user.id,
    label: user.email,
    data: user,
  }));


const useFormSubmission = (strategyId: string) => {
  const autocompleteRef = useRef<RefHandles>(null);
  const { mutate: createOne } = useCreate();
  const { mutate: updateOne } = useUpdate();

  const onFormFinish = async (values: any) => {
    if (!autocompleteRef.current) return console.error("Autocomplete ref is null");

    const { added, removed } = autocompleteRef.current;

    try {
      added().forEach(option => {
        createOne({
          resource: "_AppUserToStrategy",
          values: { A: option.data.id, B: strategyId },
        });
      });
      removed().forEach(async option => {
        await supabase.from("_AppUserToStrategy").delete().eq("A", option.data.id).eq("B", strategyId);
      });

      updateOne({ resource: "Strategy", values, id: strategyId });
    } catch (error) {
      console.error("Error in mutation:", error);
    }
  };

  return { autocompleteRef, onFormFinish };
};

export const StrategyEdit: React.FC<IResourceComponentsProps> = () => {
  const { form, formProps, saveButtonProps, queryResult } = useForm();
  const strategyId = queryResult?.data?.data.id! as string;

  const [optionsAll] = useResource<User>("AppUser", mapUsersToOption);
  const [optionsActive, setActive] = useState<OptionType<User>[]>([]);
  const { autocompleteRef, onFormFinish } = useFormSubmission(strategyId);

  useEffect(() => {
    setActive(mapUsersToOption(queryResult?.data?.data.users || []));
  }, [queryResult?.data?.data.users]);

  const filter = (searchText: string) => {
    return optionsAll.filter((option) => {
      return (
        option.data.email.toLowerCase().includes(searchText.toLowerCase()) ||
        option.data.id.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFormFinish}>
        <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Connected Users">
          <Autocomplete
            ref={autocompleteRef}
            filter={filter}
            optionsAll={optionsAll}
            optionsAtStart={optionsActive}
          />
        </Form.Item>
        <Form.Item label="Data" name={['data']}>
          <MonacoEditor
            value={form.getFieldValue('data')}
            onChange={(data) => form.setFieldsValue({ data })}
            language="json"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
}
