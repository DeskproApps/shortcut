import {
  Button,
  Checkbox,
  FormikField,
  H3,
  HorizontalDivider,
  Label,
  Stack,
  useDeskproAppClient,
  useDeskproElements,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { Formik } from "formik";
import { ChangeEvent, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import * as Yup from "yup";
import { DropdownSelect } from "../components/DropdownSelect/DropdownSelect";
import { SearchInput } from "../components/SearchInput";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import {
  addRelationsToStory,
  searchStories,
} from "../context/StoreProvider/api";
import { StoryLink } from "../context/StoreProvider/types";
import { useSetAppTitle } from "../hooks";

const AddStoryRelations = () => {
  const { client } = useDeskproAppClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [isLinkStoriesLoading, setIsLinkStoriesLoading] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const storyId = Number(useParams().storyId);

  const searchResQuery = useQueryWithClient(
    ["search", searchQuery],
    (client) => searchStories(client, searchQuery),
    {
      enabled: !!searchQuery,
    }
  );

  const searchRes = searchResQuery.data;

  const debounced = useDebouncedCallback<(v: string) => void>((q) => {
    if (!q || !client) {
      return;
    }

    setSearchQuery(q);
  }, 500);

  const onClearSearch = () => {
    setSearchQuery("");
  };

  const onChangeSearch = useCallback(
    ({ target: { value: q } }: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(q);
      debounced(q);
    },
    [client]
  );

  const toggleSelection = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const onCancel = useCallback(() => {
    navigate("/view/" + storyId);
  }, [storyId]);

  const onLinkStories = useCallback(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    ({ type }) => {
      if (!client) {
        return;
      }

      setIsLinkStoriesLoading(true);

      return Promise.all(
        selected.map((selectedId) => {
          return addRelationsToStory(
            client,
            match<
              | "relatesTo"
              | "blocks"
              | "isBlockedBy"
              | "duplicates"
              | "isDuplicatedBy",
              Pick<StoryLink, "object_id" | "subject_id" | "verb">
            >(type)
              .with("relatesTo", () => ({
                object_id: storyId,
                subject_id: selectedId,
                verb: "relates to",
              }))
              .with("blocks", () => ({
                object_id: selectedId,
                subject_id: storyId,
                verb: "blocks",
              }))
              .with("isBlockedBy", () => ({
                object_id: storyId,
                subject_id: selectedId,
                verb: "blocks",
              }))
              .with("duplicates", () => ({
                object_id: selectedId,
                subject_id: storyId,
                verb: "duplicates",
              }))
              .with("isDuplicatedBy", () => ({
                object_id: storyId,
                subject_id: selectedId,
                verb: "duplicates",
              }))
              .run()
          );
        })
      )
        .catch(() => true)
        .then(() => {
          navigate("/view/" + storyId);
        })
        .finally(() => setIsLinkStoriesLoading(false));
    },
    [client, storyId, selected]
  );

  useSetAppTitle("Add Relationship");

  useDeskproElements(({ registerElement, clearElements }) => {
    clearElements();
    registerElement("home", { type: "home_button" });
  });

  return (
    <>
      <SearchInput
        value={searchQuery}
        onClear={onClearSearch}
        onChange={onChangeSearch}
        isFetching={Boolean(searchResQuery?.isFetching)}
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
                        {
                          key: "relatesTo",
                          value: "relatesTo",
                          label: "Relates to",
                          type: "value" as const,
                        },
                        {
                          key: "blocks",
                          value: "blocks",
                          label: "Blocks",
                          type: "value" as const,
                        },
                        {
                          key: "isBlockedBy",
                          value: "isBlockedBy",
                          label: "Is blocked by",
                          type: "value" as const,
                        },
                        {
                          key: "duplicates",
                          value: "duplicates",
                          label: "Duplicates",
                          type: "value" as const,
                        },
                        {
                          key: "isDuplicatedBy",
                          value: "isDuplicatedBy",
                          label: "Is duplicated by",
                          type: "value" as const,
                        },
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
              <Button text="Cancel" intent="secondary" onClick={onCancel} />
            </Stack>
          </Stack>
        )}
      </Formik>

      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />

      {searchRes &&
        searchRes.map((item, idx) => {
          return (
            <SearchResultItem
              key={idx}
              item={item}
              onSelect={() => toggleSelection(item.id)}
              checkbox={
                <Checkbox
                  onChange={() => toggleSelection(item.id)}
                  checked={selected.includes(item.id)}
                />
              }
            />
          );
        })}
      {searchRes && !searchRes.length && !searchResQuery.isLoading && (
        <H3>No matching stories found, please try again</H3>
      )}
    </>
  );
};

export { AddStoryRelations };
