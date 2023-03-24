import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import values from "lodash/values";
import {
    Button,
    Checkbox, H3,
    HorizontalDivider,
    IconButton,
    Input,
    Stack, useDeskproAppClient
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedCallback } from "use-debounce";
import {
    searchStories,
    addExternalUrlToStory,
    addDeskproLabelToStory,
} from "../context/StoreProvider/api";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import { useLoadLinkedStories, useSetAppTitle } from "../hooks";
import { CreateLinkStory } from "../components/CreateLinkStory/CreateLinkStory";
import {
    ShortcutStoryAssociationProps,
    ShortcutStoryAssociationPropsLabel,
    StorySearchItem
} from "../context/StoreProvider/types";
import { isEnableDeskproLabel } from "../utils";
import { SetSelectionState } from "../hooks/useReplyBox";

type Props = {
    setSelectionState: SetSelectionState,
};

export const Link: FC<Props> = ({ setSelectionState }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isLinkStoriesLoading, setIsLinkStoriesLoading] = useState<boolean>(false);
  const [state, dispatch] = useStore();
  const { client } = useDeskproAppClient();
  const loadLinkedStories = useLoadLinkedStories();

  useSetAppTitle("Add Story");

  useEffect(() => {
    client?.deregisterElement("edit");
    client?.deregisterElement("addStory");
    client?.registerElement("home", { type: "home_button" });
  }, [client]);

  useEffect(
    () => searchInputRef && searchInputRef.current?.focus(),
    [searchInputRef]
  );

  const debounced = useDebouncedCallback<(v: string) => void>((q) => {
    if (!q || !client) {
      return;
    }

    searchStories(client, q)
      .then((list) => dispatch({ type: "linkStorySearchList", list }))
    ;
  },500);

  const search = (q: string) => {
    dispatch({ type: "linkStorySearchListLoading" });
    setSearchQuery(q);
    debounced(q);
  };

  const toggleSelection = (id: string) => {
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
    const permalinkUrl = state.context?.data.ticket.permalinkUrl;

    if (!selected.length || !client || !ticketId) {
      return;
    }

    setIsLinkStoriesLoading(true);

    const selectedItems = (state.linkStorySearchResults?.list ?? [])
        .filter((item) => selected.includes(item.id))
        .reduce<Record<string, StorySearchItem>>((items, item) => ({ ...items, [item.id]: item }), {});

    const updates = selected.map((id: string) => client
      .getEntityAssociation("linkedShortcutStories", state.context?.data.ticket.id as string)
      .set<ShortcutStoryAssociationProps>(`${id}`, {
        archived: selectedItems[id].archived,
        id: `${id}`,
        name: selectedItems[id].name,
        type: selectedItems[id].type,
        projectId: selectedItems[id].projectId ? `${selectedItems[id].projectId}` : undefined,
        projectName: selectedItems[id].projectName,
        workflowId: `${selectedItems[id].workflowId}`,
        workflowName: selectedItems[id].workflowName,
        statusId: selectedItems[id].stateId ? `${selectedItems[id].stateId}` : undefined,
        statusName: selectedItems[id].stateName,
        teamId: selectedItems[id].teamId ? `${selectedItems[id].teamId}` : undefined,
        teamName: selectedItems[id].teamName,
        iterationId: selectedItems[id].iterationId ? `${selectedItems[id].iterationId}` : undefined,
        iterationName: selectedItems[id].iterationName,
        epicId: selectedItems[id].epicId ? `${selectedItems[id].epicId}` : undefined,
        epicName: selectedItems[id].epicName,
        labels: selectedItems[id].labels.map<ShortcutStoryAssociationPropsLabel>((label) => ({
          id: `${label.id}`,
          name: label.name,
        })),
      })
      .then(() => { setSelectionState(id, true, "email") })
      .then(() => { setSelectionState(id, true, "note") })
    );

    updates.push(...selected.map((id: string) => addExternalUrlToStory(
      client,
      id,
      state.context?.data.ticket.permalinkUrl as string
    )));

    if (isEnableDeskproLabel(state)) {
        updates.push(...values(selectedItems).map(({ id, labels }) => {
            return addDeskproLabelToStory(client, id, labels);
        }))
    }

    Promise.all(updates)
      .then(() => loadLinkedStories())
      .then(() => dispatch({ type: "linkStorySearchListReset" }))
      .then(() => dispatch({ type: "changePage", page: "home" }))
      .catch((error) => dispatch({ type: "error", error }))
      .finally(() => {
          dispatch({ type: "linkStorySearchListLoading" });
          setIsLinkStoriesLoading(false)
      });
  };

  return (
    <>
      <CreateLinkStory selected="link" />
      <Stack>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => search(e.target.value)}
          leftIcon={state.linkStorySearchResults?.loading ? <FontAwesomeIcon icon={faSpinner} spin /> : faSearch}
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
          onClick={() => dispatch({ type: "changePage", page: "home" })}
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      {state.linkStorySearchResults && state.linkStorySearchResults.list.map((item, idx) => {
        const isLinked = !!(state.linkedStoriesResults?.list ?? []).filter((s) => s.id === item.id).length;
        return (
          <SearchResultItem
            key={idx}
            item={item}
            onSelect={() => !isLinked && toggleSelection(item.id)}
            checkbox={(
              <Checkbox
                onChange={() => toggleSelection(item.id)}
                checked={selected.includes(item.id) || isLinked}
                disabled={isLinked}
              />
            )}
          />
        );
      })}
      {(state.linkStorySearchResults && !state.linkStorySearchResults.list.length && !state.linkStorySearchResults.loading) && (
        <H3>No matching stories found, please try again</H3>
      )}
    </>
  );
};
