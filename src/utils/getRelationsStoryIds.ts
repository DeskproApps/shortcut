import { uniq, flattenDeep } from "lodash";
import { StoryItem } from "../context/StoreProvider/types";

const getRelationsStoryIds = (stories: StoryItem[] = []): Array<StoryItem["id"]> => {
    return uniq(
            flattenDeep(
                stories.map(({ storyLinks }) => {
                    return storyLinks.map(({ object_id, subject_id }) => [`${object_id}`, `${subject_id}`])
                })
            )
        );
};

export { getRelationsStoryIds };
