import { Refine, Authenticated } from "@refinedev/core";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
  RefineThemes,
} from "@refinedev/antd";
import { ConfigProvider, App as AntdApp } from "antd";

import "@refinedev/antd/dist/reset.css";
import "./App.css";

import { liveProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility";

import authProvider from "./authProvider";
import dataProvider from "./dataProvider";


import { AppUserCreate, AppUserEdit, AppUserList, AppUserShow } from "./pages/AppUser";
import { StrategyCreate, StrategyEdit, StrategyList, StrategyShow } from "./pages/Strategy";

import JsonEditor from "./pages/test";

/* import { AntdInferencer } from "@refinedev/inferencer/antd"; */

const resources = [
  {
    name: "AppUser",
    list: "/user",
    create: "/user/create",
    edit: "/user/edit/:id",
    show: "/user/show/:id",
  },
  {
    name: "Strategy",
    list: "/strategy",
    create: "/strategy/create",
    edit: "/strategy/edit/:id",
    show: "/strategy/show/:id",
  },
];

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Purple}>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          routerProvider={routerBindings}
          notificationProvider={useNotificationProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            useNewQueryKeys: true,
            // projectId: '', // "ohLSiu-WPTwmV-V83w78",
          }}
          resources={resources}>
          <Authenticated key="home">
            <AntdApp>
              <RefineKbarProvider>
                <DevtoolsProvider>
                  <ThemedLayoutV2>

                    <Routes>
                      <Route index
                        element={<NavigateToResource resource="AppUser" />}
                      />
                      <Route path="/test" element={<JsonEditor />} />
                      <Route path="/user">
                        <Route index element={<AppUserList />} />
                        <Route path="create" element={<AppUserCreate />} />
                        <Route path="edit/:id" element={<AppUserEdit />} />
                        <Route path="show/:id" element={<AppUserShow />} />
                      </Route>
                      <Route path="/strategy">
                        <Route index element={<StrategyList />} />
                        <Route path="create" element={<StrategyCreate />} />
                        <Route path="edit/:id" element={<StrategyEdit />} />
                        <Route path="show/:id" element={<StrategyShow />} />
                      </Route>
                      <Route path="*" element={<ErrorComponent />} />
                    </Routes>
                    <RefineKbar />
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                  </ThemedLayoutV2>
                  <DevtoolsPanel />
                </DevtoolsProvider>
              </RefineKbarProvider>
            </AntdApp>
          </Authenticated>
        </Refine>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
