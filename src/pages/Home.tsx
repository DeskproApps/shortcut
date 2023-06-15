import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  H3,
  HorizontalDivider,
  IconButton,
  Input,
  LoadingSpinner,
  Stack,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
  useDeskproElements,
} from "@deskpro/app-sdk";
import { useSetAppTitle, useSetBadgeCount } from "../hooks";
import { LinkedStoryResultItem } from "../components/LinkedStoryResultItem/LinkedStoryResultItem";
import { getStoryById } from "../context/StoreProvider/api";
import { StoryItemRes } from "../context/StoreProvider/types";

export const Home: FC = () => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { context } = useDeskproLatestAppContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [linkedStoriesIds, setLinkedStoriesIds] = useState<string[] | null>(
    null
  );
  const navigate = useNavigate();

  const linkedStoriesQuery = useQueryWithClient(
    ["linkedStories", ...((linkedStoriesIds as string[]) || [])],
    (client) => {
      return Promise.all(
        (linkedStoriesIds as string[]).map((id) => getStoryById(client, id))
      );
    },
    {
      enabled: !!linkedStoriesIds && linkedStoriesIds.length > 0,
    }
  );

  const linkedStories = linkedStoriesQuery.data as StoryItemRes[];

  useSetAppTitle("Shortcut Stories");
  useSetBadgeCount(linkedStories);

  useDeskproElements(({ clearElements, registerElement }) => {
    clearElements();
    registerElement("addStory", { type: "plus_button" });
  });

  useInitialisedDeskproAppClient(
    (client) => {
      (async () => {
        if (!context?.data.ticket?.id) return;

        const ids = await client
          .getEntityAssociation(
            "linkedShortcutStories",
            context?.data.ticket.id as string
          )
          ?.list();

        setLinkedStoriesIds(ids);
      })();
    },
    [context]
  );

  return (
    <>
      <Stack>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          leftIcon={faSearch}
          rightIcon={
            <IconButton
              icon={faTimes}
              onClick={() => setSearchQuery("")}
              minimal
            />
          }
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />

      {linkedStoriesQuery.isFetching ? (
        <LoadingSpinner />
      ) : linkedStories?.length > 0 ? (
        linkedStories.map((item, idx) => (
          <LinkedStoryResultItem
            key={idx}
            item={item}
            onView={() => navigate("/view/" + item.id)}
          />
        ))
      ) : (
        linkedStoriesIds?.length === 0 && <H3>No linked stories found.</H3>
      )}
    </>
  );
};
