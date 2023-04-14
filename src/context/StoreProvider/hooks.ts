import { StoryItemRes } from "./types";
import find from "lodash.find";

export const getOtherParamsStory = (
  item: StoryItemRes,
  dataDependencies: any
) => {
  if (!dataDependencies || !item)
    return {
      epic: {},
      state: {},
      iteration: {},
      group: {},
      project: {},
      members: {},
      workflows: {},
      workflow: {},
      owners: [],
    };
  const { groups, epics, workflows, iterations, projects, members } =
    dataDependencies;
  const states = (workflows ?? []).reduce(
    (all: any[], workflow: any) => [...all, ...workflow.states],
    []
  );

  const epic =
    (epics ?? []).filter((e: any) => e.id === item.epic_id)[0] ?? null;
  const state =
    (states ?? []).filter((s: any) => s.id === item.workflow_state_id)[0] ??
    null;
  const iteration =
    (iterations ?? []).filter((i: any) => i.id === item.iteration_id)[0] ??
    null;
  const group =
    (groups ?? []).filter((g: any) => g.id === item.group_id)[0] ?? null;
  const project =
    (projects ?? []).filter((p: any) => p.id === item.project_id)[0] ?? null;

  const stateId = state ? state.id : undefined;
  const workflow =
    (workflows ?? []).filter((w: { states: { id: number }[] }) =>
      find(w.states, { id: stateId })
    )[0] ?? null;

  const owners = (item.owner_ids ?? []).map((ownerId: string) => {
    const member =
      (members ?? []).filter((m: any) => m.id === ownerId)[0] ?? null;
    return {
      id: ownerId,
      name: member.profile.name,
      iconUrl: member.profile?.display_icon?.url,
    };
  });

  return {
    epic,
    state,
    iteration,
    group,
    project,
    workflows,
    workflow,
    stateId,
    members,
    owners,
  };
};
