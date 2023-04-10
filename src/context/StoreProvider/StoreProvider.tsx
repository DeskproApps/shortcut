import {
  LoadingSpinner,
  TargetAction,
  useDeskproAppClient,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import get from "lodash.get";
import { createContext, FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { __, match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import { useLoadLinkedStories, useWhenNoLinkedItems } from "../../hooks";
import { isEnableDeskproLabel } from "../../utils";
import { removeDeskproLabelFromStory, removeExternalUrlToStory } from "./api";
import { useStoreReducer } from "./hooks";
import { initialState, reducer } from "./reducer";
import { Dispatch, State } from "./types";

export const StoreContext = createContext<[State, Dispatch]>([
  initialState,
  () => {},
]);

export interface StoreProviderProps {
  children: ReactNode | JSX.Element;
}

export const StoreProvider: FC<StoreProviderProps> = ({
  children,
}: StoreProviderProps) => {
  const { client } = useDeskproAppClient();

  const [state, dispatch] = useStoreReducer(reducer, initialState);

  const loadLinkedIssues = useLoadLinkedStories();
  const navigate = useNavigate();

  if (state._error) {
    console.error(state._error);
  }

  useWhenNoLinkedItems(() => navigate("/link"));

  useInitialisedDeskproAppClient((client) => {
    client?.registerElement("refresh", { type: "refresh_button" });
  });

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction) => void>(
    (action: TargetAction) =>
      match<string>(action.name).with("linkTicket", () => navigate("/link")),
    200
  );

  const unlinkTicket = ({ id, story, ticketId }: any) => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { ticket }: any = state?.context?.data;

    if (!client || !state?.context?.data.ticket) {
      return;
    }

    if (ticketId !== ticket.id) {
      return;
    }

    client
      .getEntityAssociation("linkedShortcutStories", ticket.id)
      .delete(id)
      .then(() =>
        removeExternalUrlToStory(
          client,
          `${id}`,
          state.context?.data.ticket.permalinkUrl as string
        )
      )
      .then(() =>
        client.entityAssociationCountEntities("linkedShortcutStories", id)
      )
      .then((count) => {
        return isEnableDeskproLabel(state) && count === 0
          ? removeDeskproLabelFromStory(client, id, get(story, ["labels"], []))
          : Promise.resolve();
      })
      .then(() => loadLinkedIssues())
      .then(() => navigate("home"));
  };

  useDeskproAppEvents(
    {
      onChange(context) {
        context && dispatch({ type: "loadContext", context: context });
      },
      onShow() {
        client && setTimeout(() => client.resize(), 200);
      },
      onElementEvent(id, type, payload) {
        match<[string, any]>([id, payload])
          .with(["addStory", __], () => navigate("/link"))
          .with(["home", __], () => navigate("/home"))
          .with(["edit", __], () => navigate("/edit/" + payload))
          .with(["viewContextMenu", { action: "unlink", id: __ }], () =>
            unlinkTicket(payload)
          )
          .otherwise(() => {});
      },
      onTargetAction: debounceTargetAction,
    },
    [state.context?.data]
  );

  if (client === null) {
    return <LoadingSpinner />;
  }

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};
