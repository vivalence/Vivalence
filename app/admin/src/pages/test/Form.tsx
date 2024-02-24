import React, { useState, useImperativeHandle } from 'react';
import { RJSFSchema, UiSchema, FieldProps, WidgetProps, RegistryWidgetsType } from "@rjsf/utils";
import validator from '@rjsf/validator-ajv8';
import { FormProps, IChangeEvent } from '@rjsf/core';
import Form from '@rjsf/antd';

import CodeEditorField from './Code';

import './index.css'

interface FormData {
  [key: string]: any;
}

interface IFormProps {
  [key: string]: any;
}

interface Props {
  schema: RJSFSchema;
  formData: FormData | undefined;
}

const uiSchema: UiSchema = {
  run: {
    'ui:field': CodeEditorField,
  },
};

const JsonForm: React.FC<Props> = (props, ref) => {

  const handleChange = ({ formData }: IChangeEvent<FormData>) => {
    /* console.log('JsonForm handleChange formData', formData) */
  };

  const formProps: FormProps<IFormProps> = {
    schema: props.schema as RJSFSchema,
    formData: props.formData as FormData,
    onChange: handleChange,
    validator: validator,
    uiSchema,
  };

  return <Form  {...formProps} />;
};

export default JsonForm;


