import { FC, useEffect, useState } from "react";
import {find} from "lodash";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useLoadLinkedStories, useSetAppTitle } from "../hooks";
import {
    createStory,
    getStoryDependencies,
    addExternalUrlToStory,
} from "../context/StoreProvider/api";
import { useStore } from "../context/StoreProvider/hooks";
import {
    getLabelsNameById,
    isEnableDeskproLabel,
    getStoryCustomFieldsToSave,
} from "../utils";
import { StoryForm } from "../components/StoryForm/StoryForm";
import { CreateLinkStory } from "../components/CreateLinkStory/CreateLinkStory";
import {
  CreateStoryData,
  ShortcutStoryAssociationProps,
  ShortcutStoryAssociationPropsLabel
} from "../context/StoreProvider/types";

export const Create: FC = () => {
  const { client } = useDeskproAppClient();
  const [ state, dispatch ] = useStore();
  const loadLinkedStories = useLoadLinkedStories();
  const [loading, setLoading] = useState(false);

  useSetAppTitle("Add Story");

  useEffect(() => {
    client?.deregisterElement("edit");
    client?.deregisterElement("addStory");
    client?.registerElement("home", { type: "home_button" });
  }, [client]);

  const onSubmit = (data: CreateStoryData) => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    const ticketId = state.context?.data.ticket.id as string;
    const permalinkUrl = state.context?.data.ticket.permalinkUrl as string;
    const labelNames = getLabelsNameById(data.labels, state.dataDependencies?.labels);
    const storyData = {
        ...data,
        labels: [
            ...labelNames,
            ...((isEnableDeskproLabel(state) && labelNames.includes("Deskpro")) ? [] : ["Deskpro"]),
        ],
        custom_fields: getStoryCustomFieldsToSave(data, state.dataDependencies?.customFields),
    };

    setLoading(true);

    (async () => {
        let res: any;

        try {
            res = await createStory(client, storyData);
        } catch (e) {
            console.error(e);
        }

        if (!res || !res?.id) {
            console.error("Failed to create Shortcut story");
            return;
        }

        const {
            groups,
            epics,
            workflows,
            iterations,
            projects,
        } = await getStoryDependencies(client);

        const states = (workflows ?? []).reduce((all: any[], workflow: any) => [...all, ...workflow.states], []);

        const epic = (epics ?? []).filter((e: any) => e.id === res.epic_id)[0] ?? null;
        const state = (states ?? []).filter((s: any) => s.id === res.workflow_state_id)[0] ?? null;
        const iteration = (iterations ?? []).filter((i: any) => i.id === res.iteration_id)[0] ?? null;
        const group = (groups ?? []).filter((g: any) => g.id === res.group_id)[0] ?? null;
        const project = (projects ?? []).filter((p: any) => p.id === res.project_id)[0] ?? null;

        const stateId = state ? state.id : undefined;
        const workflow = (workflows ?? []).filter((w: { states: { id: number }[] }) => find(w.states, { id: stateId }))[0] ?? null;

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
            labels: ((res?.labels ?? []) as { id: number, name: string }[]).map<ShortcutStoryAssociationPropsLabel>((label) => ({
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

        const id = res.id;

        await addExternalUrlToStory(client, `${id}`, permalinkUrl);
        await loadLinkedStories();

        setLoading(false);

        dispatch({ type: "changePage", page: "home" });
    })();
  };

  return (
    <>
      <CreateLinkStory selected="create" />
      <StoryForm type="create" onSubmit={onSubmit} loading={loading} />
    </>
  );
};
