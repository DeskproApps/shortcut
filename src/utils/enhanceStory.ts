import { StoryItemRes } from "../context/StoreProvider/types";
import find from "lodash.find";

const enhanceStory = (item: StoryItemRes, dataDependencies: any) => {
  if (!dataDependencies || !item) {
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
  }

  const { groups, epics, workflows, iterations, projects, members } = dataDependencies;

  const states = (workflows ?? []).reduce((all: any[], workflow: any) => {
    return [...all, ...workflow.states];
  }, []);

  const epic = find(epics, { id: item.epic_id });
  const state = find(states, { id: item.workflow_state_id });
  const iteration = find(iterations, { id: item.iteration_id });
  const group = find(groups, { id: item.group_id });
  const project = find(projects, { id: item.project_id });
  const stateId = state?.id;
  const workflow = find(workflows, { id: item.workflow_id });
  const owners = (item.owner_ids ?? []).map((ownerId: string) => {
    const member = find(members, { id: ownerId });
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

export { enhanceStory };
