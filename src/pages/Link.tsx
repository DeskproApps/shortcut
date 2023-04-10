import {
  Button,
  Checkbox,
  H3,
  HorizontalDivider,
  IconButton,
  Input,
  Stack,
  useDeskproAppClient,
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
import { useStore } from "../context/StoreProvider/hooks";
import {
  ShortcutStoryAssociationProps,
  ShortcutStoryAssociationPropsLabel,
  StorySearchItem,
} from "../context/StoreProvider/types";
import { useLoadLinkedStories, useSetAppTitle } from "../hooks";
import { useReplyBox } from "../hooks/useReplyBox";
import { isEnableDeskproLabel } from "../utils";

export const Link = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [isLinkStoriesLoading, setIsLinkStoriesLoading] =
    useState<boolean>(false);
  const [state, dispatch] = useStore();
  const { client } = useDeskproAppClient();
  const loadLinkedStories = useLoadLinkedStories();
  const { setSelectionState } = useReplyBox();
  const navigate = useNavigate();

  useSetAppTitle("Add Story");

  useEffect(() => {
    client?.deregisterElement("edit");
    client?.deregisterElement("addStory");
    client?.registerElement("home", { type: "home_button" });
  }, [client]);

  useEffect(() => {
    searchInputRef && searchInputRef.current?.focus();
  }, [searchInputRef]);

  const debounced = useDebouncedCallback<(v: string) => void>((q) => {
    if (!q || !client) {
      return;
    }

    searchStories(client, q).then((list) =>
      dispatch({ type: "linkStorySearchList", list })
    );
  }, 500);

  const search = (q: string) => {
    dispatch({ type: "linkStorySearchListLoading" });
    setSearchQuery(q);
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
    dispatch({ type: "linkStorySearchListReset" });
  };

  const linkStories = () => {
    const ticketId = state.context?.data.ticket.id;

    if (!selected.length || !client || !ticketId) {
      return;
    }

    setIsLinkStoriesLoading(true);

    const selectedItems = (state.linkStorySearchResults?.list ?? [])
      .filter((item) => selected.includes(item.id))
      .reduce<Record<string, StorySearchItem>>(
        (items, item) => ({ ...items, [item.id]: item }),
        {}
      );

    const updates = selected.map((id: number) =>
      client
        .getEntityAssociation(
          "linkedShortcutStories",
          state.context?.data.ticket.id as string
        )
        .set<ShortcutStoryAssociationProps>(`${id}`, {
          archived: selectedItems[id].archived,
          id: `${id}`,
          name: selectedItems[id].name,
          type: selectedItems[id].type,
          projectId: selectedItems[id].projectId
            ? `${selectedItems[id].projectId}`
            : undefined,
          projectName: selectedItems[id].projectName,
          workflowId: `${selectedItems[id].workflowId}`,
          workflowName: selectedItems[id].workflowName,
          statusId: selectedItems[id].stateId
            ? `${selectedItems[id].stateId}`
            : undefined,
          statusName: selectedItems[id].stateName,
          teamId: selectedItems[id].teamId
            ? `${selectedItems[id].teamId}`
            : undefined,
          teamName: selectedItems[id].teamName,
          iterationId: selectedItems[id].iterationId
            ? `${selectedItems[id].iterationId}`
            : undefined,
          iterationName: selectedItems[id].iterationName,
          epicId: selectedItems[id].epicId
            ? `${selectedItems[id].epicId}`
            : undefined,
          epicName: selectedItems[id].epicName,
          labels: selectedItems[
            id
          ].labels.map<ShortcutStoryAssociationPropsLabel>((label) => ({
            id: `${label.id}`,
            name: label.name,
          })),
        })
        .then(() => {
          setSelectionState(id, true, "email");
        })
        .then(() => {
          setSelectionState(id, true, "note");
        })
    );

    updates.push(
      ...selected.map((id: number) =>
        addExternalUrlToStory(
          client,
          id,
          state.context?.data.ticket.permalinkUrl as string
        )
      )
    );

    if (isEnableDeskproLabel(state)) {
      updates.push(
        ...values(selectedItems).map(({ id, labels }) => {
          return addDeskproLabelToStory(client, id, labels);
        })
      );
    }

    Promise.allSettled(updates)
      .then(() => loadLinkedStories())
      .then(() => dispatch({ type: "linkStorySearchListReset" }))
      .then(() => navigate("/home"))
      .catch((error) => dispatch({ type: "error", error }))
      .finally(() => {
        dispatch({ type: "linkStorySearchListLoading" });
        setIsLinkStoriesLoading(false);
      });
  };

  return (
    <>
      <CreateLinkStory selected="link" />
      <Stack>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            search(e.target.value)
          }
          leftIcon={
            state.linkStorySearchResults?.loading ? (
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
      {state.linkStorySearchResults &&
        state.linkStorySearchResults.list.map((item, idx) => {
          const isLinked = !!(state.linkedStoriesResults?.list ?? []).filter(
            (s) => s.id === item.id
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
      {state.linkStorySearchResults &&
        !state.linkStorySearchResults.list.length &&
        !state.linkStorySearchResults.loading && (
          <H3>No matching stories found, please try again</H3>
        )}
    </>
  );
};
