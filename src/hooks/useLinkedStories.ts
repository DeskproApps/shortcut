import get from "lodash.get";
import size from "lodash.size";
import {
  useQueryWithClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useQueriesWithClient } from "./useQueriesWithClient";
import { getStoryById } from "../context/StoreProvider/api";
import { StoryItemRes } from "../context/StoreProvider/types";

type UseLinkedStories = () => {
  isLoading: boolean;
  stories: StoryItemRes[];
};

const useLinkedStories: UseLinkedStories = () => {
  const { context } = useDeskproLatestAppContext();
  const ticketId = get(context, ["data", "ticket", "id"]);

  const linkedIds = useQueryWithClient(
    ["linkedStories"],
    (client) => client.getEntityAssociation("linkedShortcutStories", ticketId).list(),
    { enabled: Boolean(ticketId) }
  );

  const stories = useQueriesWithClient((get(linkedIds, ["data"], []) || []).map((storyId) => ({
    queryKey: ["stories", storyId],
    queryFn: (client) => getStoryById(client, storyId),
    enabled: Boolean(size(linkedIds.data)),
    useErrorBoundary: false,
  })));

  return {
    isLoading: [linkedIds, ...stories].some(({ isLoading }) => isLoading),
    stories: stories.map((data) => get(data, ["data"])).filter(Boolean) as StoryItemRes[],
  };
};

export { useLinkedStories };
