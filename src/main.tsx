import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { DeskproAppProvider, LoadingSpinner } from "@deskpro/app-sdk";
import { query } from "./utils/query";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { StoreProvider } from "./context/StoreProvider/StoreProvider";
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { App } from "./App";

import "iframe-resizer/js/iframeResizer.contentWindow.js";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";

TimeAgo.addDefaultLocale(en);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <DeskproAppProvider>
      <HashRouter>
        <StoreProvider>
          <QueryClientProvider client={query}>
            <Suspense fallback={<LoadingSpinner />}>
              <QueryErrorResetBoundary>
                {({ reset }) => (
                  <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
                    <App />
                  </ErrorBoundary>
                )}
              </QueryErrorResetBoundary>
            </Suspense>
          </QueryClientProvider>
        </StoreProvider>
      </HashRouter>
    </DeskproAppProvider>
  </StrictMode>
);
