import has from "lodash/has";
import { StoryItem, Comment } from "../context/StoreProvider/types";
import { markdownToHtmlConverter } from "../context/StoreProvider/api";
import { normalize } from "./normalize";

const addCommentsToStories = (stories: StoryItem[], comments: Comment[]): StoryItem[] => {
    let list: StoryItem[] = [];
    const normalizeComments = normalize(comments, "story_id");

    if (stories.length > 0) {
        list = stories.map((story) => {
            if (has(normalizeComments, [story.id])) {
                story.comments.push({
                    ...normalizeComments[story.id],
                    textHtml: markdownToHtmlConverter.makeHtml(normalizeComments[story.id].text),
                });
            }
            return story;
        });
    }

    return list;
};

export { addCommentsToStories };
