import { DependencyList, useEffect, useState } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "./context/StoreProvider/hooks";
import { getStoryDependencies, listStories } from "./context/StoreProvider/api";
import { StoryItem } from "./context/StoreProvider/types";
import { getRelationsStoryIds } from "./utils";

export const useSetAppTitle = (
  title: string,
  deps: DependencyList | undefined = []
): void => {
  const { client } = useDeskproAppClient();
  useEffect(() => {
    client?.setTitle(title);
  }, deps);
};

export const useWhenNoLinkedItems = (onNoLinkedItems: () => void) => {
  const { client } = useDeskproAppClient();
  const [state] = useStore();

  useEffect(() => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    client
      .getEntityAssociation(
        "linkedShortcutStories",
        state.context?.data.ticket.id as string
      )
      .list()
      .then((items) => items.length === 0 && onNoLinkedItems());
  }, [client, state.context?.data.ticket.id]);
};

export const useLoadLinkedStories = () => {
  const { client } = useDeskproAppClient();
  const [state, dispatch] = useStore();

  return async () => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    const ids = (
      await client
        .getEntityAssociation(
          "linkedShortcutStories",
          state.context?.data.ticket.id as string
        )
        .list()
    ).map((e) => Number(e));

    const list = await listStories(client, ids);

    const relations = await listStories(client, getRelationsStoryIds(list));

    client.setBadgeCount(list.length);

    dispatch({ type: "linkedStoriesList", list });
    dispatch({ type: "relationsStoriesList", list: relations });
  };
};

export const useFindLinkedStoryById = () => {
  const [state] = useStore();

  return (id: string): StoryItem | null =>
    (state.linkedStoriesResults?.list ?? []).filter(
      //@ts-ignore
      (r) => r.id === Number(id)
    )[0] ?? null;
};

export const useFindRelationsStoryById = () => {
  const [state] = useStore();

  return (id: number): StoryItem | null =>
    (state.relationsStoriesResults?.list ?? []).filter((r) => r.id === id)[0] ??
    null;
};

export const useAssociatedEntityCount = (id: number) => {
  const { client } = useDeskproAppClient();
  const [entityCount, setEntityCount] = useState<number>(0);

  useEffect(() => {
    client
      ?.entityAssociationCountEntities("linkedShortcutStories", id.toString())
      .then(setEntityCount);
  }, [client, id]);

  return entityCount;
};

export const useLoadDataDependencies = () => {
  const { client } = useDeskproAppClient();
  const [, dispatch] = useStore();

  useEffect(() => {
    if (!client) {
      return;
    }

    getStoryDependencies(client).then((deps) =>
      dispatch({ type: "loadDataDependencies", deps })
    );
  }, [client, dispatch]);
};
