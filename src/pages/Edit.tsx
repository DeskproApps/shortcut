import { useMemo, useState } from "react";
import isEmpty from "lodash.isempty";
import omit from "lodash.omit";
import _values from "lodash.values";
import {
  LoadingSpinner,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { StoryForm } from "../components/StoryForm/StoryForm";
import { useSetAppTitle, useRegisterElements } from "../hooks";
import {
  normalize,
  getLabelsNameById,
  normalizeCustomFields,
  getStoryCustomFieldsToSave,
} from "../utils";
import {
  CreateStoryData,
  CustomField,
  ShortcutStoryAssociationProps,
  ShortcutStoryAssociationPropsLabel,
  StoryItemRes,
} from "../context/StoreProvider/types";
import {
  updateStory,
  getStoryDependencies,
  addExternalUrlToStory,
  getStoryById,
} from "../context/StoreProvider/api";
import { useNavigate, useParams } from "react-router-dom";
import { getOtherParamsStory } from "../context/StoreProvider/hooks";

const Edit = () => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();
  const [loading, setLoading] = useState(false);
  const { storyId } = useParams() as { storyId: string };

  const storyQuery = useQueryWithClient(
    ["story", storyId],
    (client) => getStoryById(client, storyId),
    {
      enabled: !!storyId,
    }
  );

  const dataDependenciesQuery = useQueryWithClient(
    ["dataDependencies"],
    (client) => getStoryDependencies(client)
  );

  const dataDependencies = dataDependenciesQuery.data;

  const story = storyQuery.data as StoryItemRes;

  const navigate = useNavigate();

  const customFields = useMemo(() => {
    return isEmpty(dataDependencies?.customFields)
      ? {}
      : normalizeCustomFields(dataDependencies.customFields);
  }, [dataDependencies?.customFields]);

  const selectedCustomFields = useMemo(
    () => normalize(storyQuery.data?.custom_fields, "field_id"),
    [storyQuery.data?.custom_fields]
  );
  const notSelectedCustomFields = useMemo(
    () => omit(customFields, Object.keys(selectedCustomFields)),
    [selectedCustomFields]
  ) as CustomField[];

  useSetAppTitle("Edit Story");

  useRegisterElements(({ registerElement }) => {
    registerElement("refresh", { type: "refresh_button" });
    registerElement("home", { type: "home_button" });
  });

  if (storyQuery.isLoading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  if (storyQuery.error) {
    throw new Error("Story not found");
  }

  const onSubmit = (data: CreateStoryData) => {
    if (!client || !context?.data.ticket.id) {
      return;
    }

    const ticketId = context?.data.ticket.id as string;
    const permalinkUrl = context?.data.ticket.permalinkUrl as string;
    const storyData = {
      ...data,
      labels: getLabelsNameById(data.labels, dataDependencies?.labels),
      custom_fields: getStoryCustomFieldsToSave(
        data,
        dataDependencies?.customFields
      ),
    };

    setLoading(true);

    (async () => {
      let res: any;

      try {
        res = await updateStory(client, Number(storyId), storyData);
      } catch (e) {
        console.error(e);
      }

      if (!res || !res?.id) {
        console.error("Failed to create Shortcut story");
        return;
      }

      const { workflow, stateId, state, group, iteration, epic } =
        getOtherParamsStory(res, dataDependencies);

      const metadata: ShortcutStoryAssociationProps = {
        archived: res.archived,
        id: `${res.id}`,
        name: res.name,
        type: res.story_type,
        projectId: res?.project_id ? `${res.project_id}` : undefined,
        projectName: project?.name,
        workflowId: `${workflow.id}`,
        workflowName: workflow.name,
        statusId: `${stateId}`,
        statusName: state.name,
        teamId: group?.id ? `${group.id}` : undefined,
        teamName: group?.name,
        iterationId: iteration?.id ? `${iteration.id}` : undefined,
        iterationName: iteration?.name,
        epicId: epic?.id ? `${epic.id}` : undefined,
        epicName: epic?.name,
        labels: (
          (res?.labels ?? []) as { id: number; name: string }[]
        ).map<ShortcutStoryAssociationPropsLabel>((label) => ({
          id: `${label.id}`,
          name: label.name,
        })),
      };

      try {
        await client
          .getEntityAssociation("linkedShortcutStories", ticketId)
          .set<ShortcutStoryAssociationProps>(`${res.id}`, metadata);
      } catch (e) {
        console.error(e);
      }

      await addExternalUrlToStory(client, Number(storyId), permalinkUrl);

      setLoading(false);
      navigate("/view/" + storyId);
    })();
  };

  const { group, workflows, state, project, epic, iteration } =
    getOtherParamsStory(story, dataDependencies);

  if (storyQuery.isLoading || dataDependenciesQuery.isLoading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  const values = {
    archived: story.archived,
    name: story.name,
    description: story.description,
    team: group?.id,
    workflow: workflows?.id,
    state: state?.id,
    project: project?.id ?? "",
    epic: epic?.id,
    iteration: iteration?.id,
    type: story.story_type,
    requester: story.requested_by_id,
    owners: story.owner_ids?.map(({ id }) => `${id}`) ?? [],
    labels: story.labels?.map(({ id }) => id) ?? [],
    followers: story.follower_ids?.map((id) => `${id}`) ?? [],
    ...(isEmpty(selectedCustomFields)
      ? {}
      : (_values(selectedCustomFields).reduce((acc, { field_id, value_id }) => {
          const key = `custom-field-${customFields[field_id]["canonical_name"]}`;
          acc[key] = value_id;
          return acc;
        }, {}) as Record<string, string>)),
    ...(isEmpty(notSelectedCustomFields)
      ? {}
      : _values(notSelectedCustomFields).reduce(
          (acc: Record<string, string>, { canonical_name }) => {
            acc[`custom-field-${canonical_name}`] = "";
            return acc;
          },
          {}
        )),
  };

  return (
    <StoryForm
      onSubmit={onSubmit}
      type="update"
      values={values}
      loading={loading}
    />
  );
};

export { Edit };
