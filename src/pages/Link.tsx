import {
  Button,
  Checkbox,
  H3,
  HorizontalDivider,
  IconButton,
  Input,
  Stack,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
  useDeskproElements,
} from "@deskpro/app-sdk";
import {
  faSearch,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import values from "lodash.values";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { CreateLinkStory } from "../components/CreateLinkStory/CreateLinkStory";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import {
  addDeskproLabelToStory,
  addExternalUrlToStory,
  searchStories,
} from "../context/StoreProvider/api";
import { StorySearchItem } from "../context/StoreProvider/types";
import { useSetAppTitle, useReplyBox } from "../hooks";
import { isEnableDeskproLabel } from "../utils";

export const Link = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [linkedStoriesIds, setLinkedStoriesIds] = useState<{ id: string }[]>(
    []
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [isLinkStoriesLoading, setIsLinkStoriesLoading] =
    useState<boolean>(false);
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();
  const { setSelectionState } = useReplyBox();
  const navigate = useNavigate();

  useSetAppTitle("Add Story");

  useDeskproElements(({ clearElements, registerElement }) => {
    clearElements();
    registerElement("home", { type: "home_button" });
  });

  useInitialisedDeskproAppClient(
    (client) => {
      (async () => {
        const ids = (await client
          .getEntityAssociation(
            "linkedShortcutStories",
            context?.data.ticket.id as string
          )
          ?.list()) as unknown as { id: string }[];

        setLinkedStoriesIds(ids);
      })();
    },
    [context]
  );

  const searchResQuery = useQueryWithClient(
    ["search", searchQuery],
    (client) => searchStories(client, searchQuery),
    {
      enabled: !!searchQuery,
    }
  );

  const searchRes = searchResQuery.data;

  useEffect(() => {
    searchInputRef && searchInputRef.current?.focus();
  }, [searchInputRef]);

  const debounced = useDebouncedCallback<(v: string) => void>((q) => {
    if (!q || !client) {
      return;
    }

    setSearchQuery(q)
  }, 500);

  const search = (q: string) => {
    setText(q);
    debounced(q);
  };

  const toggleSelection = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const clear = () => {
    setSearchQuery("");
  };

  const linkStories = () => {
    const ticketId = context?.data.ticket.id;

    if (!selected.length || !client || !ticketId) {
      return;
    }

    setIsLinkStoriesLoading(true);

    const selectedItems = (searchRes ?? [])
      .filter((item) => selected.includes(item.id))
      .reduce<Record<string, StorySearchItem>>(
        (items, item) => ({ ...items, [item.id]: item }),
        {}
      );

    const updates = selected.map((id: number) =>
      client
        .getEntityAssociation(
          "linkedShortcutStories",
          context?.data.ticket.id as string
        )
        .set<{ id: string }>(`${id}`, { id: `${id}` })
        .then(() => setSelectionState(id, true, "email"))
        .then(() => setSelectionState(id, true, "note"))
    );

    updates.push(
      ...selected.map((id: number) =>
        addExternalUrlToStory(
          client,
          id,
          context?.data.ticket.permalinkUrl as string
        )
      )
    );

    if (isEnableDeskproLabel(context)) {
      updates.push(
        ...values(selectedItems).map(({ id, labels }) => {
          return addDeskproLabelToStory(client, id, labels);
        })
      );
    }

    Promise.allSettled(updates)
      .then(() => navigate("/home"))
      .finally(() => {
        setIsLinkStoriesLoading(false);
      });
  };

  return (
    <>
      <CreateLinkStory selected="link" />
      <Stack>
        <Input
          ref={searchInputRef}
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            search(e.target.value)
          }
          leftIcon={
            searchResQuery?.isFetching ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              faSearch
            )
          }
          rightIcon={<IconButton icon={faTimes} onClick={clear} minimal />}
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      <Stack justify="space-between">
        <Button
          text="Link Stories"
          disabled={selected.length === 0}
          onClick={() => linkStories()}
          loading={isLinkStoriesLoading}
        />
        <Button
          text="Cancel"
          intent="secondary"
          onClick={() => navigate("/home")}
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      {searchRes &&
        searchRes.map((item, idx) => {
          const isLinked = !!(linkedStoriesIds ?? []).filter(
            (s) => Number(s.id) === item.id
          ).length;
          return (
            <SearchResultItem
              key={idx}
              item={item}
              onSelect={() => !isLinked && toggleSelection(item.id)}
              checkbox={
                <Checkbox
                  onChange={() => toggleSelection(item.id)}
                  checked={selected.includes(item.id) || isLinked}
                  disabled={isLinked}
                />
              }
            />
          );
        })}
      {searchRes && !searchRes.length && !searchResQuery.isLoading && (
        <H3>No matching stories found, please try again</H3>
      )}
    </>
  );
};
