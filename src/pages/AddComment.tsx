import { FC } from "react";
import * as yup from "yup";
import has from "lodash/has";
import { useFormik } from "formik";
import {
    Label,
    Stack,
    Button,
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { StoryItem } from "../context/StoreProvider/types";
import { useStore } from "../context/StoreProvider/hooks";
import { createStoryComment, markdownToHtmlConverter } from "../context/StoreProvider/api";
import { useSetAppTitle } from "../hooks";
import { TextAreaField } from "../components/TextArea/TextArea";

type Props = {
    storyId: StoryItem["id"]
};

const validationSchema = yup.object().shape({
    comment: yup.string(),
});

const initValues = {
    comment: "",
};

const AddComment: FC<Props> = ({ storyId }) => {
    const [state, dispatch] = useStore();
    const { client } = useDeskproAppClient();

    const {
        handleSubmit,
        isSubmitting,
        getFieldProps,
    } = useFormik({
        validationSchema,
        initialValues: initValues,
        onSubmit: async (values) => {
            if (!client || !storyId) {
                return;
            }

            await createStoryComment(client, storyId, values.comment)
                .then((comment) => {
                    const stories = state.linkedStoriesResults?.list ?? [];

                    if (stories.length > 0) {
                        const list = stories.map((story) => {
                            if (story.id === storyId) {
                                story.comments.push({
                                    ...comment,
                                    textHtml: markdownToHtmlConverter.makeHtml(comment.text),
                                });
                            }
                            return story;
                        });
                        dispatch({ type: "linkedStoriesList", list });
                    }
                    dispatch({
                        type: "changePage",
                        page: "view",
                        params: { id: storyId }
                    })
                })
                .catch((error) => dispatch({
                    type: "error",
                    error: `Can't create comment: ${error}`,
                }));
        },
    });

    useSetAppTitle("Add Comment");

    useInitialisedDeskproAppClient((client) => {
        client.deregisterElement("home");
        client.deregisterElement("addStory");
        client.deregisterElement("home");
        client.deregisterElement("viewContextMenu");
        client.deregisterElement("edit");

        client.registerElement("home", { type: "home_button" });
    });

    return (
        <form onSubmit={handleSubmit}>
            <Label label="New comment" style={{ marginBottom: "10px" }}>
                <TextAreaField
                    minHeight="auto"
                    placeholder="Enter comment"
                    {...getFieldProps("comment")}
                />
            </Label>

            <Stack justify="space-between">
                <Button
                    type="submit"
                    text="Save"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    style={{ minWidth: "72px", justifyContent: "center" }}
                />
                <Button
                    text="Cancel"
                    intent="tertiary"
                    onClick={() => dispatch({ type: "changePage", page: "view", params: { id: storyId } })}
                    style={{ minWidth: "72px", justifyContent: "center" }}
                />
            </Stack>
        </form>
    );
};

export { AddComment };
