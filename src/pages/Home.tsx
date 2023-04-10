import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../context/StoreProvider/hooks";
import {
  H3,
  HorizontalDivider,
  IconButton,
  Input,
  LoadingSpinner,
  Stack,
  useDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useLoadLinkedStories, useSetAppTitle } from "../hooks";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LinkedStoryResultItem } from "../components/LinkedStoryResultItem/LinkedStoryResultItem";
import { useNavigate } from "react-router-dom";

export const Home: FC = () => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state] = useStore();
  const loadLinkedStories = useLoadLinkedStories();
  const { client } = useDeskproAppClient();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState<boolean>(false);
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

    return (state.linkedStoriesResults?.list || []).filter((item) =>
      item.id.toString().includes(searchQuery)
    );
  }, [state.linkedStoriesResults, searchQuery]);

  const query = useQueryWithClient(
    ["linkedStories"],
    () => {
      setHasChecked(true);
      return loadLinkedStories;
    },
    { enabled: state.linkedStoriesResults === undefined || !hasChecked }
  );

  const loading = query.isLoading;

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

      {loading ? (
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
