import { FC, useEffect } from "react";
import { __, match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import { TargetAction, useDeskproAppClient, useDeskproAppEvents } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { Page } from "../context/StoreProvider/types";
import {useLoadLinkedStories, useWhenNoLinkedItems} from "../hooks";
import {
    createStoryComment,
    removeExternalUrlToStory,
} from "../context/StoreProvider/api";
import { Home } from "./Home";
import { Link } from "./Link";
import { View } from "./View";
import { ErrorBlock } from "../components/Error/ErrorBlock";
import { Create } from "./Create";
import { Edit } from "./Edit";
import { AddComment } from "./AddComment";
import { getLinkedComment } from "../utils";
import { useReplyBox } from "../hooks/useReplyBox";

export const Main: FC = () => {
  const { client } = useDeskproAppClient();
  const [state, dispatch] = useStore();
  const loadLinkedIssues = useLoadLinkedStories();
  const { setSelectionState } = useReplyBox();

  if (state._error) {
    console.error(state._error);
  }

  useWhenNoLinkedItems(() => dispatch({ type: "changePage", page: "link" }));

  useEffect(() => {
    client?.registerElement("refresh", { type: "refresh_button" });
  }, [client]);

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction) => void>(
    (action: TargetAction) => match<string>(action.name)
      .with("linkTicket", () => dispatch({ type: "changePage", page: "link" }))
    ,
    200
  );

  const unlinkTicket = ({ id }: any) => {
    if (!client || !state?.context?.data.ticket) {
      return;
    }

    const { ticket }: any = state?.context?.data;

    client?.getEntityAssociation("linkedShortcutStories", ticket.id).delete(id)
        .then(() => dispatch({ type: "linkedStoriesListLoading" }))
        .then(() => removeExternalUrlToStory(client, `${id}`, state.context?.data.ticket.permalinkUrl as string))
        .then(loadLinkedIssues)
        .then(() => createStoryComment(
            client,
            id,
            getLinkedComment(ticket.id, state.context?.data.ticket.permalinkUrl, "unlink")),
        )
        .then(() => dispatch({ type: "changePage", page: "home" }))
    ;
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
        .with(["edit", __], () => dispatch({
          type: "changePage",
          page: "edit",
          params: { storyId: payload },
        }))
        .with(["viewContextMenu", { action: "unlink", id: __ }], () => unlinkTicket(payload))
        .otherwise(() => {})
      ;
    },
    onTargetAction: debounceTargetAction,
  }, [state.context?.data]);

  const page = match<Page|undefined>(state.page)
    .with("home", () => <Home {...state.pageParams} />)
    .with("link", () => <Link {...state.pageParams} setSelectionState={setSelectionState} />)
    .with("view", () => <View {...state.pageParams} />)
    .with("create", () => <Create {...state.pageParams} />)
    .with("edit", () => <Edit {...state.pageParams} />)
    .with("add_comment", () => <AddComment {...state.pageParams} />)
    .otherwise(() => <Home {...state.pageParams} />)
  ;

  return (
    <>
      {state._error && (<ErrorBlock text="An error occurred" />)}
      {page}
    </>
  );
};
