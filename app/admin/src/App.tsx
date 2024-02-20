import { Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
  RefineThemes,
} from "@refinedev/antd";
import { ConfigProvider, App as AntdApp } from "antd";
import "@refinedev/antd/dist/reset.css";

import "./App.css";
import authProvider from "./authProvider";

import { supabaseClient } from "./utility";

/* import { UnitCreate, UnitEdit, UnitList, UnitShow } from "./pages/units"; */
import { AppUserCreate, AppUserEdit, AppUserList, AppUserShow } from "./pages/AppUser";

const resources = [
  {
    name: "AppUser",
    list: "/user",
    create: "/user/create",
    edit: "/user/edit/:id",
    show: "/user/show/:id",
  },
];

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Purple}>
        <AntdApp>
          <RefineKbarProvider>
            <DevtoolsProvider>
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
                  projectId: "ohLSiu-WPTwmV-V83w78",
                }}
                resources={resources}>
                <ThemedLayoutV2>
                  <Routes>
                    <Route index
                      element={<NavigateToResource resource="AppUser" />}
                    />
                    <Route path="/user">
                      <Route index element={<AppUserList />} />
                      <Route path="create" element={<AppUserCreate />} />
                      <Route path="edit/:id" element={<AppUserEdit />} />
                      <Route path="show/:id" element={<AppUserShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Routes>
                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </ThemedLayoutV2>
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineKbarProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
