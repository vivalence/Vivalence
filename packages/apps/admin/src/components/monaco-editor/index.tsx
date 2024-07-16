import React from "react";
import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import { Typography } from "antd";

interface MonacoEditorFieldProps {
  onChange?: (value: string | undefined) => void;
  formData?: string | undefined;
  value?: string | undefined;
  language?: string;
  theme?: string;
  height?: string;
  title?: string;
  schema?: any;
  uiSchema?: any;
}

const MonacoEditorField: React.FC<MonacoEditorFieldProps> = (props) => {
  const schema = props.schema || {};
  const uiOptions = props.uiSchema ? props.uiSchema["ui:options"] : {};

  const handleEditorChange = (value: string | undefined) => {
    if (!value) value = "";
    props.onChange && props.onChange(value);
  };

  const defaultValue = typeof props.formData === "object"
    ? JSON.stringify(props.formData, null, 2)
    : props.formData || props.value || "";

  return (
    <>
      <Typography.Text>{props.title || schema.title || ""}</Typography.Text>
      <Editor
        height={props.height || uiOptions.height || "40vh"}
        theme={props.theme || "vs-dark"}
        defaultLanguage={props.language || uiOptions.language || "javascript"}
        defaultValue={defaultValue || ""}
        onChange={handleEditorChange}
        options={{
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
        }}
      />
    </>
  );
};

export default MonacoEditorField;

/* const customTypeDefinitions = `
 * interface Input {
 *   // Define the structure of your input here
 * }
 * interface Output {
 *   // Define the structure of your output here
 * }
 * declare function editFunction(input: Input): Output;
 * `;
 *
 * monaco.languages.typescript.typescriptDefaults.addExtraLib(customTypeDefinitions, 'filename/fake.d.ts');
 *  */

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
