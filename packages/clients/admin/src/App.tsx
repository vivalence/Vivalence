import { Authenticated, Refine } from "@refinedev/core";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import {
  ErrorComponent,
  RefineThemes,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import { App as AntdApp, ConfigProvider } from "antd";

import "@refinedev/antd/dist/reset.css";
import "./App.css";

import { liveProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility";

import authProvider from "./authProvider";
import dataProvider from "./dataProvider";

import { AppUserCreate, AppUserEdit, AppUserList, AppUserShow } from "./pages/AppUser";
import { StrategyCreate, StrategyEdit, StrategyList, StrategyShow } from "./pages/Strategy";
import { GameCreate, GameEdit, GameList, GameShow } from "./pages/Game";
import { TagCreate, TagEdit, TagList, TagShow } from "./pages/Tag";
import { UnitCreate, UnitEdit, UnitList, UnitShow } from "./pages/Unit";
import { Login } from "./pages/login";

/* console.log('Login', Login) */

/* import JsonEditor from "./pages/test"; */

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
  {
    name: "Game",
    list: "/game",
    create: "/game/create",
    edit: "/game/edit/:id",
    show: "/game/show/:id",
  },
  {
    name: "Tag",
    list: "/tag",
    create: "/tag/create",
    edit: "/tag/edit/:id",
    show: "/tag/show/:id",
  },
  {
    name: "Unit",
    list: "/unit",
    create: "/unit/create",
    edit: "/unit/edit/:id",
    show: "/unit/show/:id",
  },
];

function App() {
  // @ts-ignore
  const dataProviderProp = dataProvider(supabaseClient);

  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Purple}>
        <Refine
          // @ts-ignore
          dataProvider={dataProviderProp}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          routerProvider={routerBindings}
          notificationProvider={useNotificationProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            useNewQueryKeys: true,
          }}
          resources={resources}
        >
          <Authenticated key="home">
            <AntdApp>
              <RefineKbarProvider>
                <DevtoolsProvider>
                  <ThemedLayoutV2>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route index element={<NavigateToResource resource="AppUser" />} />
                      {/* <Route path="/test" element={<JsonEditor />} /> */}
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
                      <Route path="/game">
                        <Route index element={<GameList />} />
                        <Route path="create" element={<GameCreate />} />
                        <Route path="edit/:id" element={<GameEdit />} />
                        <Route path="show/:id" element={<GameShow />} />
                      </Route>
                      <Route path="/tag">
                        <Route index element={<TagList />} />
                        <Route path="create" element={<TagCreate />} />
                        <Route path="edit/:id" element={<TagEdit />} />
                        <Route path="show/:id" element={<TagShow />} />
                      </Route>
                      <Route path="/unit">
                        <Route index element={<UnitList />} />
                        <Route path="create" element={<UnitCreate />} />
                        <Route path="edit/:id" element={<UnitEdit />} />
                        <Route path="show/:id" element={<UnitShow />} />
                      </Route>
                      <Route path="*" element={<ErrorComponent />} />
                    </Routes>
                    <RefineKbar />
                    <UnsavedChangesNotifier />
                  </ThemedLayoutV2>
                  <DevtoolsPanel />
                </DevtoolsProvider>
              </RefineKbarProvider>
            </AntdApp>
          </Authenticated>
          <DocumentTitleHandler />
        </Refine>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
