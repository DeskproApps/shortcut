import uniq from "lodash.uniq";
import flattenDeep from "lodash.flattendeep";
import { StoryItem } from "../context/StoreProvider/types";

const getRelationsStoryIds = (
  stories: StoryItem[] = []
): Array<StoryItem["id"]> => {
  return uniq(
    flattenDeep(
      stories.map(({ storyLinks }) => {
        return storyLinks.map(({ object_id, subject_id }) => [
          `${object_id}`,
          `${subject_id}`,
        ]);
      })
    )
  );
};

export { getRelationsStoryIds };
