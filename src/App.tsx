import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import { StoreProvider } from "./context/StoreProvider/StoreProvider";

import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { Redirect } from "./components/Redirect/Redirect";
import { AddComment } from "./pages/AddComment";
import { AddStoryRelations } from "./pages/AddStoryRelations";
import { Create } from "./pages/Create";
import { Edit } from "./pages/Edit";
import { Home } from "./pages/Home";
import { Link } from "./pages/Link";
import { View } from "./pages/View";
import { query } from "./utils/query";
import { Suspense } from "react";
import { LoadingSpinner } from "@deskpro/app-sdk";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";

TimeAgo.addDefaultLocale(en);

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={query}>
        <Suspense fallback={<LoadingSpinner />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              //@ts-ignore
              <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
                <StoreProvider>
                  <Routes>
                    <Route path="/">
                      <Route index element={<Home />} />
                    </Route>
                    <Route path="view/:id" element={<View />} />
                    <Route path="create" element={<Create />} />
                    <Route path="edit/:storyId" element={<Edit />} />
                    <Route path="link" element={<Link />} />
                    <Route path="add">
                      <Route path="comment/:storyId" element={<AddComment />} />
                      <Route
                        path="storyrelations/:storyId"
                        element={<AddStoryRelations />}
                      />
                    </Route>
                    <Route path="home" element={<Redirect />} />
                  </Routes>
                </StoreProvider>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
