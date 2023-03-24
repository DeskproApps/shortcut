import { useState, useCallback, useEffect, FC, ChangeEvent } from "react";
import { match } from "ts-pattern";
import * as Yup from "yup";
import { Formik } from "formik";
import { useDebouncedCallback } from "use-debounce";
import {
    H3,
    Label,
    Stack,
    Button,
    Checkbox,
    FormikField,
    HorizontalDivider,
    useDeskproElements,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useSetAppTitle, useLoadLinkedStories } from "../hooks";
import { useStore } from "../context/StoreProvider/hooks";
import { searchStories, addRelationsToStory } from "../context/StoreProvider/api";
import { SearchInput } from "../components/SearchInput";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import { DropdownSelect } from "../components/DropdownSelect/DropdownSelect";
import { StoryItem, StoryLink } from "../context/StoreProvider/types";

interface Props {
    storyId: StoryItem["id"];
}

const AddStoryRelations: FC<Props> = ({ storyId }) => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const loadLinkedStories = useLoadLinkedStories();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selected, setSelected] = useState<string[]>([]);
    const [isLinkStoriesLoading, setIsLinkStoriesLoading] = useState<boolean>(false);

    const debounced = useDebouncedCallback<(v: string) => void>((q) => {
        if (!q || !client) {
            dispatch({ type: "linkStorySearchListReset" });
            return Promise.resolve();
        }

        return searchStories(client, q)
            .then((list) => dispatch({ type: "linkStorySearchList", list }));
    }, 500);

    useEffect(() => {
        dispatch({ type: "linkStorySearchListReset" });
    }, [dispatch]);

    const onClearSearch = () => {
        setSearchQuery("");
        dispatch({ type: "linkStorySearchListReset" });
    };

    const onChangeSearch = useCallback(({ target: { value: q }}: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: "linkStorySearchListLoading" });
        setSearchQuery(q);
        debounced(q);
    }, [client]);

    const toggleSelection = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const onCancel = useCallback(() => {
        dispatch({ type: "changePage", page: "view", params: { id: storyId } })
    }, [dispatch, storyId]);

    const onLinkStories = useCallback(({ type }) => {
        if (!client) {
            return;
        }

        setIsLinkStoriesLoading(true);

        return Promise.all(selected.map((selectedId) => {
            return addRelationsToStory(client, match<
                "relatesTo"|"blocks"|"isBlockedBy"|"duplicates"|"isDuplicatedBy",
                Pick<StoryLink, "object_id"|"subject_id"|"verb">
            >(type)
                .with("relatesTo", () => ({ object_id: storyId, subject_id: selectedId, verb: "relates to" }))
                .with("blocks", () => ({ object_id: selectedId, subject_id: storyId, verb: "blocks" }))
                .with("isBlockedBy", () => ({ object_id: storyId, subject_id: selectedId, verb: "blocks" }))
                .with("duplicates", () => ({ object_id: selectedId, subject_id: storyId, verb: "duplicates" }))
                .with("isDuplicatedBy", () => ({ object_id: storyId, subject_id: selectedId, verb: "duplicates" }))
                .run()
            )
        }))
            .catch(() => true)
            .then(() => loadLinkedStories())
            .then(() => {
                dispatch({ type: "changePage", page: "view", params: { id: storyId } });
            })
            .finally(() => setIsLinkStoriesLoading(false))
    }, [client, storyId, selected]);

    useSetAppTitle("Add Relationship");

    useDeskproElements(({ registerElement, deRegisterElement }) => {
        deRegisterElement("home");
        deRegisterElement("viewContextMenu");
        deRegisterElement("edit");
        deRegisterElement("addStory");

        registerElement("home", { type: "home_button" });
    });

    return (
        <>
            <SearchInput
                value={searchQuery}
                onClear={onClearSearch}
                onChange={onChangeSearch}
                isFetching={Boolean(state.linkStorySearchResults?.loading)}
            />

            <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />

            <Formik
                initialValues={{ type: "" }}
                onSubmit={onLinkStories}
                validationSchema={Yup.object().shape({
                    type: Yup.string().required(),
                })}
            >
                {({ submitForm }) => (
                    <Stack gap={10} vertical align="stretch">
                        <div className="create-form-field">
                            <FormikField<string> name="type">
                                {([field, , helpers], { id, error }) => (
                                    <Label
                                        htmlFor={id}
                                        label="Relationship type"
                                        error={error}
                                        required
                                    >
                                        <DropdownSelect
                                            showInternalSearch={false}
                                            helpers={helpers}
                                            options={[
                                                { key: "relatesTo", value: "relatesTo", label: "Relates to", type: "value" as const },
                                                { key: "blocks", value: "blocks", label: "Blocks", type: "value" as const },
                                                { key: "isBlockedBy", value: "isBlockedBy", label: "Is blocked by", type: "value" as const },
                                                { key: "duplicates", value: "duplicates",  label: "Duplicates", type: "value" as const },
                                                { key: "isDuplicatedBy", value: "isDuplicatedBy", label: "Is duplicated by", type: "value" as const },
                                            ]}
                                            id={id}
                                            placeholder="Select value"
                                            value={field.value}
                                        />
                                    </Label>
                                )}
                            </FormikField>
                        </div>
                        <Stack justify="space-between">
                            <Button
                                type="submit"
                                text="Link Stories"
                                disabled={selected.length === 0}
                                onClick={submitForm}
                                loading={isLinkStoriesLoading}
                            />
                            <Button
                                text="Cancel"
                                intent="secondary"
                                onClick={onCancel}
                            />
                        </Stack>
                    </Stack>
                )}
            </Formik>

            <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />

            {state.linkStorySearchResults && state.linkStorySearchResults.list.map((item, idx) => {
                return (
                    <SearchResultItem
                        key={idx}
                        item={item}
                        onSelect={() => toggleSelection(item.id)}
                        checkbox={(
                            <Checkbox
                                onChange={() => toggleSelection(item.id)}
                                checked={selected.includes(item.id)}
                            />
                        )}
                    />
                );
            })}
            {(state.linkStorySearchResults && !state.linkStorySearchResults.list.length && !state.linkStorySearchResults.loading) && (
                <H3>No matching stories found, please try again</H3>
            )}
        </>
    );
};

export { AddStoryRelations };
