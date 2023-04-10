import { useCallback } from "react";
import get from "lodash.get";
import { match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import {
  TargetAction,
  IDeskproClient,
  GetStateResponse,
  useDeskproAppClient,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { Comment, State, StoryItem } from "../context/StoreProvider/types";
import { createStoryComment } from "../context/StoreProvider/api";
import { addCommentsToStories } from "../utils";

export type ReplyBoxType = "note" | "email";

export type SetSelectionState = (
  entityId: StoryItem["id"],
  selected: boolean,
  type: ReplyBoxType
) => void | Promise<{ isSuccess: boolean }>;

export type GetSelectionState = (
  entityId: StoryItem["id"],
  type: ReplyBoxType
) => void | Promise<Array<GetStateResponse<string>>>;

export type DeleteSelectionState = (
  entityId: StoryItem["id"],
  type: ReplyBoxType
) => void | Promise<boolean>;

type ReturnUseReplyBox = {
  setSelectionState: SetSelectionState;
  getSelectionState: GetSelectionState;
  deleteSelectionState: DeleteSelectionState;
};

export const noteKey = (ticketId: string, entityId: StoryItem["id"]) => {
  return `tickets/${ticketId}/shortcut/notes/selection/${entityId}`.toLowerCase();
};

export const emailKey = (ticketId: string, entityId: StoryItem["id"]) => {
  return `tickets/${ticketId}/shortcut/emails/selection/${entityId}`.toLowerCase();
};

export const registerReplyBoxNotesAdditionsTargetAction = (
  client: IDeskproClient,
  state: State
) => {
  const ticketId = state?.context?.data.ticket.id;
  const entities: Array<StoryItem> = get(
    state,
    ["linkedStoriesResults", "list"],
    []
  );

  if (!ticketId) {
    return;
  }

  Promise.all(
    entities.map((entity: StoryItem) =>
      client.getState<{ selected: boolean }>(noteKey(ticketId, entity.id))
    )
  ).then((flags) => {
    client.registerTargetAction(
      "shortcutReplyBoxNoteAdditions",
      "reply_box_note_item_selection",
      {
        title: "Add to Shortcut",
        payload: entities.map((entity, idx) => ({
          id: entity.id,
          title: entity.id,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      }
    );
  });
};

export const registerReplyBoxEmailsAdditionsTargetAction = (
  client: IDeskproClient,
  state: State
): void => {
  const ticketId = state?.context?.data.ticket.id;
  const entities: Array<StoryItem> = get(
    state,
    ["linkedStoriesResults", "list"],
    []
  );

  if (!ticketId || !client) {
    return;
  }

  Promise.all(
    entities.map((entity: StoryItem) => {
      return client.getState<{ selected: boolean }>(
        emailKey(ticketId, entity.id)
      );
    })
  ).then((flags) => {
    return client.registerTargetAction(
      "shortcutReplyBoxEmailAdditions",
      "reply_box_email_item_selection",
      {
        title: `Add to Shortcut`,
        payload: entities.map((entity, idx) => ({
          id: `${entity.id}`.toLowerCase(),
          title: entity.id,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      }
    );
  });
};

const useReplyBox = (): ReturnUseReplyBox => {
  const [state, dispatch] = useStore();
  const { client } = useDeskproAppClient();
  const ticketId = state?.context?.data.ticket.id;
  const isCommentOnNote =
    state.context?.settings?.default_comment_on_ticket_note === true;
  const isCommentOnEmail =
    state.context?.settings?.default_comment_on_ticket_reply === true;

  const setSelectionState: SetSelectionState = useCallback(
    (entityId, selected, type) => {
      if (!ticketId) {
        return;
      }

      if (type === "note" && isCommentOnNote) {
        return client?.setState(noteKey(ticketId, entityId), {
          id: entityId,
          selected,
        });
      }

      if (type === "email" && isCommentOnEmail) {
        return client?.setState(emailKey(ticketId, entityId), {
          id: entityId,
          selected,
        });
      }
    },
    [client, ticketId]
  );

  const getSelectionState = useCallback(
    (entityId: number, type: string) => {
      if (!ticketId) {
        return;
      }

      const key = type === "email" ? emailKey : noteKey;
      return client?.getState<string>(key(ticketId, entityId));
    },
    [client, ticketId]
  );

  const deleteSelectionState = useCallback(
    (entityId: number, type: string) => {
      if (!ticketId) {
        return;
      }

      const key = type === "email" ? emailKey : noteKey;
      return client?.deleteState(key(ticketId, entityId));
    },
    [client, ticketId]
  );

  useInitialisedDeskproAppClient(
    (client) => {
      if (isCommentOnNote) {
        registerReplyBoxNotesAdditionsTargetAction(client, state);
        client.registerTargetAction(
          "shortcutOnReplyBoxNote",
          "on_reply_box_note"
        );
      }

      if (isCommentOnEmail) {
        registerReplyBoxEmailsAdditionsTargetAction(client, state);
        client.registerTargetAction(
          "shortcutOnReplyBoxEmail",
          "on_reply_box_email"
        );
      }
    },
    [
      get(state, ["linkedStoriesResults", "list"]),
      state?.context?.data,
      isCommentOnNote,
      isCommentOnEmail,
    ]
  );

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction) => void>(
    (action: TargetAction) =>
      match<string>(action.name)
        .with("shortcutOnReplyBoxEmail", () => {
          const ticketId = action.subject;
          const email = action.payload.email;

          if (!ticketId || !email || !client) {
            return;
          }

          if (ticketId !== state.context?.data.ticket.id) {
            return;
          }

          client.setBlocking(true);
          client
            .getState<{ id: string; selected: boolean }>(
              `tickets/${ticketId}/shortcut/emails/selection/*`
            )
            .then((r) => {
              const storyIds = r
                .filter(({ data }) => data?.selected)
                .map(({ data }) => Number(data?.id));

              return Promise.all(
                storyIds.map((storyId) =>
                  createStoryComment(client, storyId, email)
                )
              );
            })
            .then((comments: Comment[]) => {
              const stories = state.linkedStoriesResults?.list ?? [];

              if (stories.length > 0) {
                const list = addCommentsToStories(stories, comments);
                dispatch({ type: "linkedStoriesList", list });
              }
            })
            .finally(() => client.setBlocking(false));
        })
        .with("shortcutOnReplyBoxNote", () => {
          const ticketId = action.subject;
          const note = action.payload.note;

          if (!ticketId || !note || !client) {
            return;
          }

          if (ticketId !== state.context?.data.ticket.id) {
            return;
          }

          client.setBlocking(true);
          client
            .getState<{ id: string; selected: boolean }>(
              `tickets/${ticketId}/shortcut/notes/selection/*`
            )
            .then((r) => {
              const storyIds = r
                .filter(({ data }) => data?.selected)
                .map(({ data }) => Number(data?.id));

              return Promise.all(
                storyIds.map((storyId) =>
                  createStoryComment(client, storyId, note)
                )
              );
            })
            .then((comments: Comment[]) => {
              const stories = state.linkedStoriesResults?.list ?? [];

              if (stories.length > 0) {
                const list = addCommentsToStories(stories, comments);
                dispatch({ type: "linkedStoriesList", list });
              }
            })
            .finally(() => client.setBlocking(false));
        })
        .with("shortcutReplyBoxEmailAdditions", () => {
          (action.payload ?? []).forEach(
            (selection: { id: string; selected: boolean }) => {
              const ticketId = action.subject;

              if (state.context?.data.ticket.id) {
                client
                  ?.setState(emailKey(ticketId, Number(selection.id)), {
                    id: selection.id,
                    selected: selection.selected,
                  })
                  .then((result) => {
                    if (result.isSuccess) {
                      registerReplyBoxEmailsAdditionsTargetAction(
                        client,
                        state
                      );
                    }
                  });
              }
            }
          );
        })
        .with("shortcutReplyBoxNoteAdditions", () => {
          (action.payload ?? []).forEach(
            (selection: { id: string; selected: boolean }) => {
              const ticketId = action.subject;

              if (state.context?.data.ticket.id) {
                client
                  ?.setState(noteKey(ticketId, Number(selection.id)), {
                    id: selection.id,
                    selected: selection.selected,
                  })
                  .then((result) => {
                    if (result.isSuccess) {
                      registerReplyBoxNotesAdditionsTargetAction(client, state);
                    }
                  });
              }
            }
          );
        })
        .run(),
    200
  );

  useDeskproAppEvents(
    {
      onTargetAction: debounceTargetAction,
    },
    [state?.context?.data]
  );

  return {
    setSelectionState,
    getSelectionState,
    deleteSelectionState,
  };
};

export { useReplyBox };
