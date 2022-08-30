import { FC } from "react";
import { StoryItem } from "../context/StoreProvider/types";

type Props = {
    storyId: StoryItem["id"]
};

const AddComment: FC<Props> = () => {
    return (
        <>
            AddCommentPage
        </>
    );
};

export { AddComment };
