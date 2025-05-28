import './instrument';
import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { DeskproAppProvider, LoadingSpinner } from "@deskpro/app-sdk";
import { query } from "./utils/query";
import { ReplyBoxProvider } from "./hooks";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { StoreProvider } from "./context/StoreProvider/StoreProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { App } from "./App";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "./main.css";
import "simplebar/dist/simplebar.min.css";
import { Scrollbar } from "@deskpro/deskpro-ui";
import { ErrorBoundary, reactErrorHandler } from '@sentry/react';

TimeAgo.addDefaultLocale(en);

const root = ReactDOM.createRoot(document.getElementById('root') as Element, {
  onRecoverableError: reactErrorHandler(),
});
root.render(
  <StrictMode>
    <Scrollbar style={{ height: "100%", width: "100%" }}>
      <DeskproAppProvider>
        <HashRouter>
          <QueryClientProvider client={query}>
            <StoreProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <ErrorBoundary fallback={ErrorFallback}>
                  <ReplyBoxProvider>
                    <App />
                  </ReplyBoxProvider>
                </ErrorBoundary>
              </Suspense>
            </StoreProvider>
          </QueryClientProvider>
        </HashRouter>
      </DeskproAppProvider>
    </Scrollbar>
  </StrictMode>
);
