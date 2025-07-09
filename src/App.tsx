import { AddComment } from "./pages/AddComment";
import { AddStoryRelations } from "./pages/AddStoryRelations";
import { BackfillDeskproLabelsPage, VerifySettingsPage } from "./pages/admin";
import { Create } from "./pages/Create";
import { Edit } from "./pages/Edit";
import { Home } from "./pages/Home";
import { Link } from "./pages/Link";
import { LoadingAppPage } from "./pages/LoadingAppPage";
import { Route, Routes } from "react-router-dom";
import { View } from "./pages/View";

const App = () => {
  return (
    <Routes>
      <Route path="admin">
        <Route path="verify-settings" element={<VerifySettingsPage />} />
        <Route path="backfill-deskpro-labels" element={<BackfillDeskproLabelsPage />} />
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
