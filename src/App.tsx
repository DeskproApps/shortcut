import { useMemo } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AddComment } from "./pages/AddComment";
import { AddStoryRelations } from "./pages/AddStoryRelations";
import { Create } from "./pages/Create";
import { Edit } from "./pages/Edit";
import { Home } from "./pages/Home";
import { Link } from "./pages/Link";
import { View } from "./pages/View";
import { VerifySettings } from "./pages/VerifySettings";
import { LoadingAppPage } from "./pages/LoadingAppPage";

const App = () => {
  const { pathname } = useLocation();
  const isAdmin = useMemo(() => pathname.includes("/admin/"), [pathname]);

  return (
    <>
      <Routes>
        <Route path="/admin/verify_settings" element={<VerifySettings/>} />
        <Route path="home" element={<Home/>}/>
        <Route path="view/:id" element={<View/>}/>
        <Route path="create" element={<Create/>}/>
        <Route path="edit/:storyId" element={<Edit/>}/>
        <Route path="link" element={<Link/>}/>
        <Route path="add">
          <Route path="comment/:storyId" element={<AddComment/>}/>
          <Route path="storyrelations/:storyId" element={<AddStoryRelations/>}/>
        </Route>
        <Route index element={<LoadingAppPage/>}/>
      </Routes>
      {!isAdmin && (<><br/><br/><br/></>)}
    </>
  );
}

export { App };
