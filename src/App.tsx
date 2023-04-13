import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

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
import { StoreProvider } from "./context/StoreProvider/StoreProvider";

import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";

TimeAgo.addDefaultLocale(en);

function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <QueryClientProvider client={query}>
          <Suspense fallback={<LoadingSpinner />}>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  FallbackComponent={ErrorFallback}
                >
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
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </Suspense>
        </QueryClientProvider>
      </StoreProvider>
    </HashRouter>
  );
}

export default App;
