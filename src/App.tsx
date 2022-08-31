import { DeskproAppProvider } from "@deskpro/app-sdk";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { StoreProvider } from "./context/StoreProvider/StoreProvider";
import { Main } from "./pages/Main";
import "./App.css";

import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";

TimeAgo.addDefaultLocale(en);

function App() {
  return (
    <DeskproAppProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </DeskproAppProvider>
  );
}

export default App;
