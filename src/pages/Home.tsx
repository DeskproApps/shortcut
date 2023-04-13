/* eslint-disable no-unsafe-optional-chaining */
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import {
  H3,
  HorizontalDivider,
  IconButton,
  Input,
  LoadingSpinner,
  Stack,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useSetAppTitle } from "../hooks";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LinkedStoryResultItem } from "../components/LinkedStoryResultItem/LinkedStoryResultItem";
import { useNavigate } from "react-router-dom";
import { getStoryById } from "../context/StoreProvider/api";
import { StoryItemRes } from "../context/StoreProvider/types";

export const Home: FC = () => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { context } = useDeskproLatestAppContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [linkedStoriesIds, setLinkedStoriesIds] = useState<string[]>([]);
  const { client } = useDeskproAppClient();
  const navigate = useNavigate();
  useSetAppTitle("Shortcut Stories");

  useEffect(() => {
    client?.deregisterElement("home");
    client?.deregisterElement("edit");
    client?.deregisterElement("viewContextMenu");
    client?.registerElement("addStory", { type: "plus_button" });
  }, [client]);

  useInitialisedDeskproAppClient(
    (client) => {
      (async () => {
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

  const linkedStoriesQuery = useQueryWithClient(
    ["linkedStories", ...linkedStoriesIds],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (client) => {
      return Promise.all(
        linkedStoriesIds.map((id) => getStoryById(client, id))
      );
    },
    {
      enabled: linkedStoriesIds.length > 0,
    }
  );

  const linkedStories = linkedStoriesQuery.data as StoryItemRes[];

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

      {linkedStoriesQuery.isLoading ? (
        <LoadingSpinner />
      ) : linkedStories.length > 0 ? (
        linkedStories.map((item, idx) => (
          <LinkedStoryResultItem
            key={idx}
            item={item}
            onView={() => navigate("/view/" + item.id)}
          />
        ))
      ) : (
        <H3>No linked stories found.</H3>
      )}
    </>
  );
};
