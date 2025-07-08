import { Route, Routes } from "react-router-dom";
import { AddComment } from "./pages/AddComment";
import { AddStoryRelations } from "./pages/AddStoryRelations";
import { Create } from "./pages/Create";
import { Edit } from "./pages/Edit";
import { Home } from "./pages/Home";
import { Link } from "./pages/Link";
import { View } from "./pages/View";
import { LoadingAppPage } from "./pages/LoadingAppPage";
import { VerifySettingsPage } from "./pages/admin";

const App = () => {
  return (
    <Routes>
      <Route path="admin">
        <Route path="verify-settings" element={<VerifySettingsPage />} />
      </Route>

      <Route path="home" element={<Home />} />
      <Route path="view/:id" element={<View />} />
      <Route path="create" element={<Create />} />
      <Route path="edit/:storyId" element={<Edit />} />
      <Route path="link" element={<Link />} />
      <Route path="add">
        <Route path="comment/:storyId" element={<AddComment />} />
        <Route path="storyrelations/:storyId" element={<AddStoryRelations />} />
      </Route>
      <Route index element={<LoadingAppPage />} />
    </Routes>
  );
}

export { App };
