import React, { useEffect, useRef } from 'react';
import { FieldProps } from "@rjsf/utils";
import * as monaco from 'monaco-editor';

const MonacoEditorField: React.FC<FieldProps> = ({ formData, onChange, idSchema, ...props }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !editorInstance.current) {
      editorInstance.current = monaco.editor.create(editorRef.current, {
        value: formData,
        language: 'typescript',
        theme: 'vs-dark',
      });

      editorInstance.current.onDidChangeModelContent(() => {
        const value = editorInstance.current?.getValue()
        onChange(value);
      });
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.dispose();
        editorInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorInstance.current) {
      const currentValue = editorInstance.current.getValue();
      if (formData !== currentValue) {
        const initialValue = formData && formData[props.name] || ''
        editorInstance.current.getModel()?.setValue(initialValue);
      }
    }
  }, [formData, onChange]);

  return <div id={idSchema.$id} ref={editorRef} style={{ height: '300px' }} />;
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


import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  }
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
