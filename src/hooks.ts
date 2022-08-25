import { DependencyList, useEffect, useState } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "./context/StoreProvider/hooks";
import { getStoryDependencies, listStories } from "./context/StoreProvider/api";
import { StoryItem } from "./context/StoreProvider/types";

export const useSetAppTitle = (title: string, deps: DependencyList|undefined = []): void => {
  const { client } = useDeskproAppClient();
  useEffect(() => client?.setTitle(title), deps);
};

export const useWhenNoLinkedItems = (onNoLinkedItems: () => void) => {
  const { client } = useDeskproAppClient();
  const [ state ] = useStore();

  useEffect(() => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    client
        .getEntityAssociation("linkedShortcutStories", state.context?.data.ticket.id as string)
        .list()
        .then((items) => items.length === 0 && onNoLinkedItems())
    ;
  }, [client, state.context?.data.ticket.id]);
};

export const useLoadLinkedStories = () => {
  const { client } = useDeskproAppClient();
  const [ state, dispatch ] = useStore();

  return async () => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    try {
      const ids = await client
        .getEntityAssociation("linkedShortcutStories", state.context?.data.ticket.id as string)
        .list();

      const list = await listStories(client, ids);

      client.setBadgeCount(list.length);

      dispatch({ type: "linkedStoriesList", list })
    } catch (e) {
      dispatch({ type: "error", error: `${e}` });
    }
  };
};

export const useFindLinkedStoryById = () => {
  const [ state ] = useStore();

  return (id: string): StoryItem|null => (state.linkedStoriesResults?.list ?? [])
    .filter((r) => r.id === id)[0] ?? null
  ;
}

export const useAssociatedEntityCount = (id: string) => {
  const { client } = useDeskproAppClient();
  const [entityCount, setEntityCount] = useState<number>(0);

  useEffect(() => {
    client?.entityAssociationCountEntities("linkedShortcutStories", id).then(setEntityCount);
  }, [client, id]);

  return entityCount;
}

export const useLoadDataDependencies = () => {
  const { client } = useDeskproAppClient();
  const [ , dispatch ] = useStore();

  useEffect(() => {
    if (!client) {
      return;
    }

    getStoryDependencies(client)
      .then((deps) => dispatch({ type: "loadDataDependencies", deps }))
    ;
  }, [client, dispatch]);
};
