import { FC, PropsWithChildren, useCallback, createContext, useContext } from "react";
import get from "lodash.get";
import size from "lodash.size";
import { match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import {
  TargetAction,
  IDeskproClient,
  GetStateResponse,
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { createStoryComment } from "../context/StoreProvider/api";
import { StoryItem, StoryItemRes } from "../context/StoreProvider/types";
import { useLinkedStories } from "./useLinkedStories";
import { APP_PREFIX } from "../constants";

export type ReplyBoxType = "note" | "email";

export type SetSelectionState = (
  entityId: StoryItemRes["id"],
  selected: boolean,
  type: ReplyBoxType
) => Promise<void | { isSuccess: boolean }>;

export type GetSelectionState = (
  entityId: StoryItemRes["id"],
  type: ReplyBoxType
) => Promise<void | Array<GetStateResponse<string>>>;

export type DeleteSelectionState = (
  entityId: StoryItemRes["id"],
  type: ReplyBoxType
) => Promise<boolean | void>;

type ReturnUseReplyBox = {
  setSelectionState: SetSelectionState;
  getSelectionState: GetSelectionState;
  deleteSelectionState: DeleteSelectionState;
};

export const noteKey = (ticketId: string | number, entityId: StoryItemRes["id"] | "*"): string => {
  return `tickets/${ticketId}/${APP_PREFIX}/notes/selection/${entityId}`.toLowerCase();
};

export const emailKey = (ticketId: string | number, entityId: StoryItem["id"] | "*"): string => {
  return `tickets/${ticketId}/${APP_PREFIX}/emails/selection/${entityId}`.toLowerCase();
};

export const registerReplyBoxNotesAdditionsTargetAction = (
  client: IDeskproClient,
  ticketId: string | number,
  stories: StoryItemRes[],
) => {
  if (!ticketId || !size(stories)) {
    return;
  }

  Promise.all(
    stories.map((entity: StoryItemRes) =>
      client.getState<{ selected: boolean }>(noteKey(ticketId, entity.id))
    )
  ).then((flags) => {
    client.registerTargetAction(
      `${APP_PREFIX}ReplyBoxNoteAdditions`,
      "reply_box_note_item_selection",
      {
        title: "Add to Shortcut",
        payload: stories.map((story, idx) => ({
          id: story.id,
          title: story.id,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      }
    );
  });
};

export const registerReplyBoxEmailsAdditionsTargetAction = (
  client: IDeskproClient,
  ticketId: string | number,
  stories: StoryItemRes[],
) => {
  if (!ticketId || !size(stories)) {
    return;
  }

  Promise.all(
    stories.map((task: StoryItemRes) => {
      return client.getState<{ selected: boolean }>(
        emailKey(ticketId, task.id)
      );
    })
  ).then((flags) => {
    return client.registerTargetAction(
      `${APP_PREFIX}ReplyBoxEmailAdditions`,
      "reply_box_email_item_selection",
      {
        title: `Add to Shortcut`,
        payload: stories.map((story, idx) => ({
          id: `${story.id}`.toLowerCase(),
          title: story.id,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      }
    );
  });
};

const useReplyBox = () => useContext<ReturnUseReplyBox>(ReplyBoxContext);

const ReplyBoxContext = createContext<ReturnUseReplyBox>({
  setSelectionState: () => Promise.resolve(),
  getSelectionState: () => Promise.resolve(),
  deleteSelectionState: () => Promise.resolve(),
});

const ReplyBoxProvider: FC<PropsWithChildren> = ({ children }) => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext<{ ticket: { id: number } }, unknown>();
  const { stories } = useLinkedStories();
  const ticketId = get(context, ["data", "ticket", "id"]);

  const isCommentOnNote = get(context, ["settings", "default_comment_on_ticket_note"]) === true;
  const isCommentOnEmail = get(context, ["settings", "default_comment_on_ticket_reply"]) === true;

  const setSelectionState: SetSelectionState = useCallback((entityId, selected, type) => {
    if (!ticketId || !client) {
      return Promise.resolve();
    }

    if (type === "note" && isCommentOnNote) {
      return client.setState(noteKey(ticketId, entityId), {
        id: entityId,
        selected,
      });
    }

    if (type === "email" && isCommentOnEmail) {
      return client.setState(emailKey(ticketId, entityId), {
        id: entityId,
        selected,
      });
    }

    return Promise.resolve();
  }, [client, ticketId]);

  const getSelectionState: GetSelectionState = useCallback((entityId, type) => {
    if (!ticketId || !client) {
      return Promise.resolve();
    }

    const key = type === "email" ? emailKey : noteKey;
    return client?.getState<string>(key(ticketId, entityId));
  }, [client, ticketId]);

  const deleteSelectionState: DeleteSelectionState = useCallback((entityId, type) => {
    if (!ticketId || !client) {
      return Promise.resolve();
    }

    const key = type === "email" ? emailKey : noteKey;
    return client.deleteState(key(ticketId, entityId));
  }, [client, ticketId]);

  useInitialisedDeskproAppClient((client) => {
    if (isCommentOnNote) {
      registerReplyBoxNotesAdditionsTargetAction(client, ticketId!, stories);
      client.registerTargetAction(
        `${APP_PREFIX}OnReplyBoxNote`,
        "on_reply_box_note"
      );
    }

    if (isCommentOnEmail) {
      registerReplyBoxEmailsAdditionsTargetAction(client, ticketId!, stories);
      client.registerTargetAction(
        `${APP_PREFIX}OnReplyBoxEmail`,
        "on_reply_box_email"
      );
    }
  }, [isCommentOnNote, isCommentOnEmail, ticketId, stories]);

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction) => void>(
    (action: TargetAction) =>
      match<string>(action.name)
        .with(`${APP_PREFIX}OnReplyBoxEmail`, () => {
          const subjectTicketId = action.subject;
          const email = action.payload.email;

          if (!ticketId || !email || !client) {
            return;
          }

          if (String(subjectTicketId) !== String(ticketId)) {
            return;
          }

          client.setBlocking(true);
          client.getState<{ id: string; selected: boolean }>(emailKey(subjectTicketId, "*"))
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
            .finally(() => client.setBlocking(false));
        })
        .with(`${APP_PREFIX}OnReplyBoxNote`, () => {
          const subjectTicketId = action.subject;
          const note = action.payload.note;

          if (!subjectTicketId || !note || !client) {
            return;
          }

          if (String(subjectTicketId) !== String(context?.data?.ticket.id)) {
            return;
          }

          client.setBlocking(true);
          client
            .getState<{ id: string; selected: boolean }>(noteKey(subjectTicketId, "*"))
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
            .finally(() => client.setBlocking(false));
        })
        .with(`${APP_PREFIX}ReplyBoxEmailAdditions`, () => {
          (action.payload ?? []).forEach(
            (selection: { id: string; selected: boolean }) => {
              const subjectTicketId = action.subject;

              if (ticketId) {
                client
                  ?.setState(emailKey(subjectTicketId, Number(selection.id)), {
                    id: selection.id,
                    selected: selection.selected,
                  })
                  .then((result) => {
                    if (result.isSuccess) {
                      registerReplyBoxEmailsAdditionsTargetAction(client, subjectTicketId, stories);
                    }
                  });
              }
            }
          );
        })
        .with(`${APP_PREFIX}ReplyBoxNoteAdditions`, () => {
          (action.payload ?? []).forEach(
            (selection: { id: string; selected: boolean }) => {
              const subjectTicketId = action.subject;

              if (ticketId) {
                client
                  ?.setState(noteKey(subjectTicketId, Number(selection.id)), {
                    id: selection.id,
                    selected: selection.selected,
                  })
                  .then((result) => {
                    if (result.isSuccess) {
                      registerReplyBoxNotesAdditionsTargetAction(client, subjectTicketId, stories);
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
    [context?.data]
  );

  return (
    <ReplyBoxContext.Provider value={{
      setSelectionState,
      getSelectionState,
      deleteSelectionState,
    }}>
      {children}
    </ReplyBoxContext.Provider>
  );
};

export { useReplyBox, ReplyBoxProvider };
