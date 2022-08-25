import { FC, useMemo, useState, useEffect } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { StoryForm } from "../components/StoryForm/StoryForm";
import { useStore } from "../context/StoreProvider/hooks";
import {useFindLinkedStoryById, useLoadLinkedStories, useSetAppTitle} from "../hooks";
import { getLabelsNameById } from "../utils";
import {
    CreateStoryData,
    ShortcutStoryAssociationProps,
    ShortcutStoryAssociationPropsLabel
} from "../context/StoreProvider/types";
import {addExternalUrlToStory, getStoryDependencies, updateStory} from "../context/StoreProvider/api";
import {find} from "lodash";

export interface EditProps {
    storyId: string;
}

const Edit: FC<EditProps> = ({ storyId }) => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState(false);
    const findStoryById = useFindLinkedStoryById();
    const loadLinkedStories = useLoadLinkedStories();
    const story = useMemo(() => findStoryById(storyId), [storyId]);

    useSetAppTitle("Edit Story");

    useEffect(() => {
        client?.deregisterElement("home");
        client?.deregisterElement("addStory");
        client?.deregisterElement("home");
        client?.deregisterElement("viewContextMenu");
        client?.deregisterElement("edit");

        client?.registerElement("home", { type: "home_button" });
    }, [client]);

    if (!story) {
        dispatch({ type: "error", error: "Story not found" });
        return (<></>);
    }

    const onSubmit = (data: CreateStoryData) => {
        if (!client || !state.context?.data.ticket.id) {
            return;
        }

        const ticketId = state.context?.data.ticket.id as string;
        const permalinkUrl = state.context?.data.ticket.permalinkUrl as string;
        const storyData = {
            ...data,
            labels: getLabelsNameById(data.labels, state.dataDependencies?.labels),
        };

        setLoading(true);

        (async () => {
            let res: any;

            try {
                res = await updateStory(client, storyId, storyData);
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

            await addExternalUrlToStory(client, `${storyId}`, permalinkUrl);
            await loadLinkedStories();

            setLoading(false);
            dispatch({ type: "changePage", page: "view", params: { id: storyId } });
        })();
    };

    const values = {
        name: story.name,
        description: story.description,
        team: story.teamId,
        workflow: story.workflowId,
        state: story.stateId,
        project: story?.projectId ?? "",
        epic: story.epicId,
        iteration: story.iterationId,
        type: story.type,
        requester: story.requesterId,
        owners: story.owners?.map(({ id }) => id) ?? [],
        labels: story.labels?.map(({ id }) => id) ?? [],
        followers: story.followerIds,
    };

    return (
        <StoryForm onSubmit={onSubmit} type="update" values={values} loading={loading} />
    );
};

export { Edit };


