import React from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { FormProps, IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/antd";

import Monaco from "$components/monaco-editor/index";

const HandlebarsField = {
  "ui:field": Monaco,
  "ui:options": {
    language: "handlebars",
    height: "300px",
  },
};
const HTMLField = {
  "ui:field": Monaco,
  "ui:options": {
    language: "html",
    height: "150px",
  },
};

const JSField = {
  "ui:field": Monaco,
  "ui:options": {
    language: "javascript",
    height: "300px",
  },
};

export const Fields = { HandlebarsField, HTMLField, JSField };

interface FormData {
  [key: string]: any;
}
export interface JsonFieldSchema {
  data: RJSFSchema;
  ui: UiSchema;
}

interface IFormProps {
  [key: string]: any;
}

interface Props {
  schema: JsonFieldSchema;
  onChange: (formData: FormData) => void;
  data: FormData | undefined;
}

const JsonForm: React.FC<Props> = (props) => {
  const handleChange = ({ formData }: IChangeEvent<FormData>) => {
    props.onChange(formData || {});
  };

  const formProps: FormProps<IFormProps> = {
    schema: props.schema.data as RJSFSchema,
    uiSchema: props.schema.ui as UiSchema,
    formData: props.data as FormData,
    onChange: handleChange,
    validator: validator,
  };
  console.log("formProps", formProps);

  return <Form {...formProps} />;
};

export default JsonForm;
