import { useEffect } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";

const useSetBadgeCount = <T>(items: Array<T>) => {
  const { client } = useDeskproAppClient();

  useEffect(() => {
    if (!Array.isArray(items)) {
      client?.setBadgeCount(0);
      return;
    }

    client?.setBadgeCount(items.length);
  }, [client, items]);
};

export { useSetBadgeCount };
