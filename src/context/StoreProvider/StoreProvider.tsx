import {
  Context,
  LoadingSpinner,
  TargetAction,
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import get from "lodash.get";
import { createContext, FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { __, match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import { isEnableDeskproLabel } from "../../utils";
import { useReplyBox, useRegisterElements } from "../../hooks";
import { removeDeskproLabelFromStory, removeExternalUrlToStory } from "./api";
import { query } from "../../utils/query";

export const StoreContext = createContext([{}, () => {}]);

export interface StoreProviderProps {
  children: ReactNode | JSX.Element;
}

export const StoreProvider: FC<StoreProviderProps> = ({
  children,
}: StoreProviderProps) => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();
  const navigate = useNavigate();
  const { deleteSelectionState } = useReplyBox();

  useRegisterElements(({ registerElement }) => {
    registerElement("refresh", { type: "refresh_button" });
  });

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction) => void>(
    (action: TargetAction) =>
      match<string>(action.name).with("linkTicket", () => navigate("link")),
    200
  );

  const unlinkTicket = ({ id, story, ticketId }: any) => {
    const { ticket }: any = (context as Context).data;

    if (!client || !context?.data.ticket) {
      return;
    }

    if (ticketId !== ticket.id) {
      return;
    }

    client
      ?.getEntityAssociation("linkedShortcutStories", ticket.id)
      .delete(id)
      .then(() =>
        removeExternalUrlToStory(
          client,
          `${id}`,
          context?.data.ticket.permalinkUrl as string
        )
      )
      .then(() =>
        client.entityAssociationCountEntities("linkedShortcutStories", id)
      )
      .then((count) => {
        return isEnableDeskproLabel(context as Context) && count === 0
          ? removeDeskproLabelFromStory(client, id, get(story, ["labels"], []))
          : Promise.resolve();
      })
      .then(() => deleteSelectionState(story.id, "note"))
      .then(() => deleteSelectionState(story.id, "email"))
      .then(() => query.invalidateQueries())
      .then(() => navigate("home"));
  };

  useDeskproAppEvents(
    {
      onShow() {
        client && setTimeout(() => client.resize(), 200);
      },
      onElementEvent(id, type, payload) {
        match<[string, any]>([id, payload])
          .with(["addStory", __], () => navigate("link"))
          .with(["home", __], () => navigate("home"))
          .with(["edit", __], () => navigate("edit/" + payload))
          .with(["viewContextMenu", { action: "unlink", id: __ }], () =>
            unlinkTicket(payload)
          )
          .otherwise(() => {});
      },
      onTargetAction: debounceTargetAction,
    },
    [context?.data]
  );

  if (client === null) {
    return <LoadingSpinner />;
  }

  return <StoreContext.Provider value={[]}>{children}</StoreContext.Provider>;
};
