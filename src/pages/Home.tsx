import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../context/StoreProvider/hooks";
import {
  HorizontalDivider,
  IconButton,
  Input,
  LoadingSpinner,
  Stack,
  useDeskproAppClient
} from "@deskpro/app-sdk";
import { useLoadLinkedStories, useSetAppTitle } from "../hooks";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LinkedStoryResultItem } from "../components/LinkedStoryResultItem/LinkedStoryResultItem";

export const Home: FC = () => {
  const searchInputRef = useRef<HTMLInputElement|null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state, dispatch] = useStore();
  const loadLinkedStories = useLoadLinkedStories();
  const { client } = useDeskproAppClient();

  useSetAppTitle("Shortcut Stories");

  useEffect(() => {
    client?.deregisterElement("home");
    client?.deregisterElement("edit");
    client?.deregisterElement("viewContextMenu");
    client?.registerElement("addStory", { type: "plus_button" });
  }, [client]);

  const linkedStories = useMemo(() => {
    if (!searchQuery) {
      return state.linkedStoriesResults?.list || [];
    }

    return (state.linkedStoriesResults?.list || [])
      .filter((item) => item.id.toString().includes(searchQuery));
  }, [state.linkedStoriesResults, searchQuery]);

  useEffect(() => {
    if (state.linkedStoriesResults === undefined) {
      loadLinkedStories();
    }
  }, [state.context?.data, state.linkedStoriesResults]);

  const loading = state.linkedStoriesResults?.loading || state.linkedStoriesResults?.loading === undefined;

  return (
    <>
      <Stack>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          leftIcon={faSearch}
          rightIcon={<IconButton icon={faTimes} onClick={() => setSearchQuery("")} minimal />}
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />

      {loading ?  <LoadingSpinner /> : linkedStories.map((item, idx) => (
        <LinkedStoryResultItem
          key={idx}
          item={item}
          onView={() => dispatch({ type: "changePage", page: "view", params: { id: item.id } })}
        />
      ))}
    </>
  );
};
