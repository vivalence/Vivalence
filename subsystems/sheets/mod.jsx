import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Newline,
  render,
  Spacer,
  Static,
  Text,
  Transform,
  useApp,
  useFocus,
  useFocusManager,
  useInput,
  useStdin,
  useStdout,
} from "ink";

export {
  Box,
  createContext,
  Newline,
  React,
  render,
  Spacer,
  Static,
  Text,
  Transform,
  useApp,
  useContext,
  useEffect,
  useFocus,
  useFocusManager,
  useInput,
  useRef,
  useState,
  useStdin,
  useStdout,
};

export * from "./components/TextInput.jsx";
export * from "./components/PasswordInput.jsx";
export * from "./components/Select.jsx";
export * from "./components/MultiSelect.jsx";
export * from "./components/Confirm.jsx";
export * from "./components/TextArea.jsx";
export * from "./components/List.jsx";
export * from "./components/Field.jsx";
export * from "./components/Actions.jsx";
export * from "./components/Form.jsx";
export * from "./components/Banner.jsx";
export * from "./components/Tasks.jsx";
export * from "./components/Logo.jsx";
export * from "./components/Background.jsx";
export * from "./components/Chrome.jsx";
export * from "./components/JsonTree.jsx";
export * as cliffy from "./cliffy.js";
export { theme } from "./theme.js";

import { Chrome } from "./components/Chrome.jsx";

class BufferControl {
  hooks = { mount: [], render: [], tick: [], release: [], destroy: [] };
  on = {
    mount: (callback) => (this.hooks.mount.push(callback), this),
    render: (callback) => (this.hooks.render.push(callback), this),
    tick: (callback) => (this.hooks.tick.push(callback), this),
    release: (callback) => (this.hooks.release.push(callback), this),
    destroy: (callback) => (this.hooks.destroy.push(callback), this),
  };
  // arrow fields — bound to instance so methods survive destructure/callback handoff
  mount = () => {
    for (const hook of this.hooks.mount) hook(this);
  };
  render = (...args) => {
    for (const hook of this.hooks.render) hook(this, ...args);
  };
  tick = (...args) => {
    for (const hook of this.hooks.tick) hook(this, ...args);
  };
  release = (...args) => {
    for (const hook of this.hooks.release) hook(this, ...args);
  };
  destroy = () => {
    for (const hook of this.hooks.destroy) hook(this);
  };
}
export { BufferControl };

export const view = {
  scroll: {
    // scrollback, one frame, fire-and-forget
    emit(data, control, Component) {
      const buffer = control ?? new BufferControl();
      const instance = render(
        <Static items={[<Component {...data} buffer={buffer} />]}>
          {(item, index) => <Box key={index}>{item}</Box>}
        </Static>,
      );
      buffer.mount();
      setTimeout(() => {
        instance.unmount();
        buffer.destroy();
      }, 0);
      return instance.waitUntilExit();
    },
    // inline, dynamic, resolves on buffer.release(opts); last frame commits to scrollback on unmount
    render(data, control, Component) {
      const buffer = control ?? new BufferControl();
      return new Promise((resolve) => {
        buffer.on.release((_b, opts) => {
          instance.unmount();
          buffer.destroy?.();
          resolve(opts);
        });
        const instance = render(<Component {...data} buffer={buffer} />);
        buffer.mount();
      });
    },
  },
  buffer: {
    // alt-screen, autowrapped in Chrome, resolves on buffer.release(opts)
    render(data, control, Component) {
      const buffer = control ?? new BufferControl();
      return new Promise((resolve) => {
        buffer.on.release((_b, opts) => {
          instance.unmount();
          buffer.destroy?.();
          resolve(opts);
        });
        const instance = render(
          <Chrome>
            <Component {...data} buffer={buffer} />
          </Chrome>,
        );
        buffer.mount();
      });
    },
    // pre-mount a Chrome alt-screen with a swappable slot. body's scroll.* paints into it.
    // shell stays mounted until untilExit() resolves (esc/return).
    shell() {
      let current = null;
      let resolveExit;
      const exit = new Promise((resolve) => (resolveExit = resolve));

      function ShellRoot() {
        useInput((_input, key) => {
          if (key.escape || key.return) resolveExit();
        });
        return <Chrome>{current}</Chrome>;
      }

      const instance = render(<ShellRoot />);
      return {
        instance,
        mount(child) {
          current = child;
          instance.rerender(<ShellRoot />);
        },
        untilExit: () => exit,
        release() {
          instance.unmount();
        },
      };
    },
  },
  // returns a proxied view where scroll.* paints into the shell's slot
  hijack(shell) {
    return {
      scroll: {
        emit(data, control, Component) {
          const buffer = control ?? new BufferControl();
          shell.mount(<Component {...data} buffer={buffer} />);
          buffer.mount();
          return Promise.resolve();
        },
        render(data, control, Component) {
          const buffer = control ?? new BufferControl();
          return new Promise((resolve) => {
            buffer.on.release((_b, opts) => {
              buffer.destroy?.();
              resolve(opts);
            });
            shell.mount(<Component {...data} buffer={buffer} />);
            buffer.mount();
          });
        },
      },
      buffer: view.buffer,
    };
  },
};
