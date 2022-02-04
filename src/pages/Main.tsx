import { FC, useEffect } from "react";
import { __, match } from "ts-pattern";
import { TargetAction, useDeskproAppClient, useDeskproAppEvents } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { Home } from "./Home";
import { Link } from "./Link";
import { View } from "./View";
import { Page } from "../context/StoreProvider/types";
import { useDebouncedCallback } from "use-debounce";
import { ErrorBlock } from "../components/Error/ErrorBlock";
import { useLoadLinkedStories } from "../hooks";
import { Create } from "./Create";

export const Main: FC = () => {
  const { client } = useDeskproAppClient();
  const [state, dispatch] = useStore();
  const loadLinkedIssues = useLoadLinkedStories();

  if (state._error) {
    console.error(state._error);
  }

  useEffect(() => {
    client?.registerElement("refresh", { type: "refresh_button" });
  }, [client]);

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction) => void>(
    (action: TargetAction) => match<string>(action.name)
      .with("linkTicket", () => dispatch({ type: "changePage", page: "link" }))
      .run()
    ,
    200
  );

  const unlinkTicket = ({ id }: any) => {
    if (!state?.context?.data.ticket) {
      return;
    }

    const { ticket }: any = state?.context?.data;

    client?.getEntityAssociation("linkedShortcutStories", ticket.id).delete(id).then(() => {
      dispatch({ type: "linkedStoriesListLoading" });
      loadLinkedIssues();
      dispatch({ type: "changePage", page: "home" });
    });
  };

  useDeskproAppEvents({
    onChange(context) {
      context && dispatch({ type: "loadContext", context: context });
    },
    onShow() {
      client && setTimeout(() => client.resize(), 200);
    },
    onElementEvent(id, type, payload) {
      match<[string, any]>([id, payload])
        .with(["addStory", __], () => dispatch({ type: "changePage", page: "link" }))
        .with(["home", __], () => dispatch({ type: "changePage", page: "home" }))
        .with(["viewContextMenu", { action: "unlink", id: __ }], () => unlinkTicket(payload))
        .otherwise(() => {})
      ;
    },
    onTargetAction: debounceTargetAction,
  }, [state.context?.data]);

  const page = match<Page|undefined>(state.page)
    .with("home", () => <Home {...state.pageParams} />)
    .with("link", () => <Link {...state.pageParams} />)
    .with("view", () => <View {...state.pageParams} />)
    .with("create", () => <Create {...state.pageParams} />)
    .otherwise(() => <Home {...state.pageParams} />)
  ;

  return (
    <>
      {state._error && (<ErrorBlock text="An error occurred" />)}
      {page}
    </>
  );
};
