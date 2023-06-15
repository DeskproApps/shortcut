import { useState } from "react";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";

const useAssociatedEntityCount = (id: number) => {
  const [entityCount, setEntityCount] = useState<number>(0);

  useInitialisedDeskproAppClient((client) => {
    client
      .entityAssociationCountEntities("linkedShortcutStories", `${id}`)
      .then(setEntityCount);
  }, [id]);

  return entityCount;
};

export { useAssociatedEntityCount };
