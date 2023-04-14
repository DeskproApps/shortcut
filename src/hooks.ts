import { DependencyList, useEffect, useState } from "react";
import {
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";

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
  const { context } = useDeskproLatestAppContext();

  useEffect(() => {
    if (!client || !context?.data.ticket.id) {
      return;
    }

    client
      .getEntityAssociation(
        "linkedShortcutStories",
        context?.data.ticket.id as string
      )
      .list()
      .then((items) => items.length === 0 && onNoLinkedItems());
  }, [client, context?.data.ticket.id]);
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
