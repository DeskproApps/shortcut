import { IDeskproClient, proxyFetch, adminGenericProxyFetch } from "@deskpro/app-sdk";
import showdown from "showdown";
import find from "lodash.find";
import has from "lodash.has";
import {
  Comment,
  StoryItem,
  StoryLabel,
  CreateStoryData,
  StorySearchItem,
  ApiRequestMethod,
  Member,
  StoryItemRes,
  Settings,
  CurrentMember,
} from "./types";
import { removeTagLinksMD } from "../../utils/removeTagLinksMD";

// Shortcut REST API Base URL
const API_BASE_URL = "https://api.app.shortcut.com/api/v3";

export const markdownToHtmlConverter = new showdown.Converter({
  openLinksInNewWindow: true,
  simplifiedAutoLink: true,
  tables: true,
  tasklists: true,
  strikethrough: true,
});

export const getCurrentMember = (
  client: IDeskproClient,
  settings?: Settings,
): Promise<CurrentMember> => {
  return has(settings, ["api_key"])
    ? uninstallrequest(client, "GET", `${API_BASE_URL}/member`, settings as Settings)
    : request(client, "GET", `${API_BASE_URL}/member`);
};

export const getMemberById = async (
  client: IDeskproClient,
  id: string
): Promise<Member> => {
  const res = await request(client, "GET", `${API_BASE_URL}/members/${id}`);

  return res;
};
/**
 * Fetch a single Shortcut story by ID, e.g. "123"
 */
export const getStoryById = async (
  client: IDeskproClient,
  id: string
): Promise<StoryItemRes> => {
  const res = await request(client, "GET", `${API_BASE_URL}/stories/${id}`);

  return {
    ...res,
    descriptionHtml: markdownToHtmlConverter.makeHtml(res.description),
    comments: res.comments.map((comment: Comment) => ({
      ...comment,
      textHtml: markdownToHtmlConverter.makeHtml(comment.text),
    })),
  };
};

/**
 * Add an external link to a story
 */
export const addExternalUrlToStory = async (
  client: IDeskproClient,
  id: number,
  url: string
): Promise<void> => {
  const story = await request(client, "GET", `${API_BASE_URL}/stories/${id}`);

  const externalLinks = [...(story.external_links ?? []), url];

  await request(client, "PUT", `${API_BASE_URL}/stories/${id}`, {
    external_links: externalLinks,
  });
};

/**
 * Remove an external link from a story
 */
export const removeExternalUrlToStory = async (
  client: IDeskproClient,
  id: string,
  url: string
): Promise<void> => {
  const story = await request(client, "GET", `${API_BASE_URL}/stories/${id}`);

  const externalLinks = (story.external_links ?? []).filter(
    (existing: string) => existing !== url
  );

  await request(client, "PUT", `${API_BASE_URL}/stories/${id}`, {
    external_links: externalLinks,
  });
};

/**
 * Search stories in Shortcut
 */
export const searchStories = async (
  client: IDeskproClient,
  q: string
): Promise<StorySearchItem[]> => {
  const { data: stories } = await request(
    client,
    "GET",
    `${API_BASE_URL}/search/stories?query=${q}&page_size=25`
  );

  const { groups, epics, members, workflows, iterations, projects } =
    await getStoryDependencies(client);

  const states = (workflows ?? []).reduce(
    (all: any[], workflow: any) => [...all, ...workflow.states],
    []
  );

  return (stories ?? []).map((story: any) => {
    const epic =
      (epics ?? []).filter((e: any) => e.id === story.epic_id)[0] ?? null;
    const state =
      (states ?? []).filter((s: any) => s.id === story.workflow_state_id)[0] ??
      null;
    const iteration =
      (iterations ?? []).filter((i: any) => i.id === story.iteration_id)[0] ??
      null;
    const group =
      (groups ?? []).filter((g: any) => g.id === story.group_id)[0] ?? null;
    const project =
      (projects ?? []).filter((p: any) => p.id === story.project_id)[0] ?? null;

    const stateId = state ? state.id : undefined;
    const workflow =
      (workflows ?? []).filter((w: { states: { id: number }[] }) =>
        find(w.states, { id: stateId })
      )[0] ?? null;

    return {
      archived: story.archived,
      id: story.id,
      name: story.name,
      appUrl: story.app_url,
      type: story.story_type,
      workflowId: workflow.id,
      workflowName: workflow.name,
      projectId: project ? project.id : undefined,
      projectName: project ? project.name : undefined,
      epicId: epic ? epic.id : undefined,
      epicName: epic ? epic.name : undefined,
      epicUrl: epic ? epic.app_url : undefined,
      stateId: stateId,
      stateName: state ? state.name : undefined,
      iterationId: iteration ? iteration.id : undefined,
      iterationName: iteration ? iteration.name : undefined,
      teamId: group ? group.id : undefined,
      teamName: group ? group.name : undefined,
      teamIconUrl: group?.display_icon?.url
        ? group.display_icon.url
        : undefined,
      owners: (story.owner_ids ?? []).map((ownerId: string) => {
        const member =
          (members ?? []).filter((m: any) => m.id === ownerId)[0] ?? null;
        return {
          id: ownerId,
          name: member.profile.name,
          iconUrl: member.profile?.display_icon?.url,
        };
      }),
      labels: (story.labels ?? []).map((label: any) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
    } as StorySearchItem;
  });
};

/**
 * List stories by ID from Shortcut
 */
export const listStories = async (
  client: IDeskproClient,
  ids: number[]
): Promise<StorySearchItem[]> => {
  const requests = ids.map((id) => [
    request(client, "GET", `${API_BASE_URL}/stories/${id}`),
    id,
  ]);

  const stories = [];
  for (const [req, id] of requests) {
    try {
      stories.push(await req);
    } catch (e) {
      console.warn(
        `Failed to find Shortcut story ID [${id}], this story may have been deleted`
      );
    }
  }

  const { groups, epics, members, workflows, iterations, projects } =
    await getStoryDependencies(client);

  const states = (workflows ?? []).reduce(
    (all: any[], workflow: any) => [...all, ...workflow.states],
    []
  );

  return (stories ?? []).map((story: any) => {
    const epic =
      (epics ?? []).filter((e: any) => e.id === story.epic_id)[0] ?? null;
    const state =
      (states ?? []).filter((s: any) => s.id === story.workflow_state_id)[0] ??
      null;
    const iteration =
      (iterations ?? []).filter((i: any) => i.id === story.iteration_id)[0] ??
      null;
    const group =
      (groups ?? []).filter((g: any) => g.id === story.group_id)[0] ?? null;
    const project =
      (projects ?? []).filter((p: any) => p.id === story.project_id)[0] ?? null;

    const stateId = state ? state.id : undefined;
    const workflow =
      (workflows ?? []).filter((w: { states: { id: number }[] }) =>
        find(w.states, { id: stateId })
      )[0] ?? null;

    return {
      archived: story.archived,
      id: story.id,
      url: story.app_url,
      name: story.name,
      type: story.story_type,
      workflowId: workflow.id,
      workflowName: workflow.name,
      projectId: project ? project.id : undefined,
      projectName: project ? project.name : undefined,
      epicId: epic ? epic.id : undefined,
      epicName: epic ? epic.name : undefined,
      epicUrl: epic ? epic.app_url : undefined,
      epicLabels: (epic?.labels ?? []).map((label: any) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      stateId,
      stateName: state ? state.name : undefined,
      iterationId: iteration ? iteration.id : undefined,
      iterationName: iteration ? iteration.name : undefined,
      teamId: group ? group.id : undefined,
      teamName: group ? group.name : undefined,
      teamIconUrl: group?.display_icon?.url
        ? group.display_icon.url
        : undefined,
      owners: (story.owner_ids ?? []).map((ownerId: string) => {
        const member =
          (members ?? []).filter((m: any) => m.id === ownerId)[0] ?? null;
        return {
          id: ownerId,
          name: member.profile.name,
          iconUrl: member.profile?.display_icon?.url,
        };
      }),
      labels: (story.labels ?? []).map((label: any) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      storyLinks: story.story_links,
      requesterId: story.requested_by_id,
      followerIds: story.follower_ids,
      description: story.description,
      descriptionHtml: markdownToHtmlConverter.makeHtml(story.description),
      deadline: story?.deadline ? new Date(story.deadline) : undefined,
      customFields: story?.custom_fields,
      comments: (story?.comments ?? [])
        .filter(({ deleted }: Comment) => !deleted)
        .map((comment: Comment) => ({
          ...comment,
          textHtml: markdownToHtmlConverter.makeHtml(
            removeTagLinksMD(comment.text)
          ),
        })),
    } as StorySearchItem;
  });
};

export const createStory = async (
  client: IDeskproClient,
  data: Omit<CreateStoryData, "labels"> & {
    labels: Array<StoryLabel["name"]>;
    custom_fields: StoryItem["customFields"];
  }
): Promise<any> => {
  const body: any = {
    name: data.name,
    description: data.description,
    labels: (data.labels ?? []).map((label) => ({ name: label })),
    story_type: data.type,
    custom_fields: data.custom_fields,
    ...(!data.followers
      ? {}
      : {
          follower_ids: (data.followers ?? []).map((follower) => `${follower}`),
        }),
    ...(!data.owners
      ? {}
      : { owner_ids: (data.owners ?? []).map((owner) => `${owner}`) }),
    ...(!data.team ? {} : { group_id: data.team }),
    ...(!data.state ? {} : { workflow_state_id: data.state }),
    ...(!data.project ? {} : { project_id: data.project }),
    ...(!data.epic ? {} : { epic_id: data.epic }),
    ...(!data.iteration ? {} : { iteration_id: data.iteration }),
    ...(!data.requester ? {} : { requested_by_id: data.requester }),
  };

  return await request(client, "POST", `${API_BASE_URL}/stories`, body);
};

export const updateStory = async (
  client: IDeskproClient,
  storyId: StoryItem["id"],
  data: Omit<CreateStoryData, "labels"> & {
    labels: Array<StoryLabel["name"]>;
    custom_fields: StoryItem["customFields"];
  }
): Promise<any> => {
  return await request(client, "PUT", `${API_BASE_URL}/stories/${storyId}`, {
    name: data.name,
    description: data.description,
    labels: (data.labels ?? []).map((label) => ({ name: label })),
    story_type: data.type,
    custom_fields: data.custom_fields,
    ...(!data.followers
      ? {}
      : {
          follower_ids: (data.followers ?? []).map((follower) => `${follower}`),
        }),
    ...(!data.owners
      ? {}
      : { owner_ids: (data.owners ?? []).map((owner) => `${owner}`) }),
    ...(!data.team ? {} : { group_id: data.team }),
    ...(!data.state ? {} : { workflow_state_id: data.state }),
    ...(!data.project ? {} : { project_id: data.project }),
    ...(!data.epic ? {} : { epic_id: data.epic }),
    ...(!data.iteration ? {} : { iteration_id: data.iteration }),
    ...(!data.requester ? {} : { requested_by_id: data.requester }),
  });
};

export const createStoryComment = (
  client: IDeskproClient,
  storyId: StoryItem["id"],
  comment: Comment["text"]
) => {
  const body = { text: comment };
  return request(
    client,
    "POST",
    `${API_BASE_URL}/stories/${storyId}/comments`,
    body
  );
};

export const createLabel = (
  client: IDeskproClient,
  data: {
    name: string;
    color?: string;
    description?: string;
  }
) => {
  return request(client, "POST", `${API_BASE_URL}/labels`, data);
};

export const addDeskproLabelToStory = async (
  client: IDeskproClient,
  storyId: StoryItem["id"],
  labels: Array<Partial<StoryLabel>>
) => {
  if (!labels.some(({ name }) => name === "Deskpro")) {
    const allLabels: StoryLabel[] = await request(
      client,
      "GET",
      `${API_BASE_URL}/labels`
    );

    if (!allLabels.some(({ name }) => name === "Deskpro")) {
      try {
        const label: StoryLabel = await createLabel(client, {
          name: "Deskpro",
          color: "#4196d4",
        });
        labels.push({ name: label.name });
      } catch (e) {
        null;
      }
    } else {
      const label = allLabels.find(({ name }) => name === "Deskpro");
      !!label && labels.push({ name: label.name });
    }
  }

  return request(client, "PUT", `${API_BASE_URL}/stories/${storyId}`, {
    labels: labels.map(({ name }) => ({ name })),
  });
};

export const removeDeskproLabelFromStory = (
  client: IDeskproClient,
  storyId: StoryItem["id"],
  labels: StoryLabel[]
) => {
  if (labels.some(({ name }) => name === "Deskpro")) {
    labels = labels.filter(({ name }) => name !== "Deskpro");
  }

  if (Array.isArray(labels) && labels.length > 0) {
    return request(client, "PUT", `${API_BASE_URL}/stories/${storyId}`, {
      labels: labels.map(({ name }) => ({ name })),
    });
  } else {
    return Promise.resolve();
  }
};

export const addRelationsToStory = (
  client: IDeskproClient,
  data: {
    object_id: StoryItem["id"];
    subject_id: StoryItem["id"];
    verb: "relates to" | "duplicates" | "blocks";
  }
) => {
  return request(client, "POST", `${API_BASE_URL}/story-links`, data);
};

export const getStoryDependencies = async (client: IDeskproClient) => {
  const [
    groups,
    epics,
    members,
    workflows,
    iterations,
    projects,
    labels,
    customFields,
  ] = await Promise.all([
    request(client, "GET", `${API_BASE_URL}/groups`),
    request(client, "GET", `${API_BASE_URL}/epics`),
    request(client, "GET", `${API_BASE_URL}/members`),
    request(client, "GET", `${API_BASE_URL}/workflows`),
    request(client, "GET", `${API_BASE_URL}/iterations`),
    request(client, "GET", `${API_BASE_URL}/projects`),
    request(client, "GET", `${API_BASE_URL}/labels`),
    request(client, "GET", `${API_BASE_URL}/custom-fields`),
  ]);

  return {
    groups,
    epics,
    members,
    workflows,
    iterations,
    projects,
    labels,
    customFields,
  };
};

const request = async (
  client: IDeskproClient,
  method: ApiRequestMethod,
  url: string,
  body?: any
) => {
  const dpFetch = await proxyFetch(client);
  const res = await dpFetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Shortcut-Token": "__api_key__",
      "Content-Type": "application/json",
    },
  });

  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${method} ${url}: Response Status [${res.status}]`);
  }

  return res.json();
};

const uninstallrequest = async (
  client: IDeskproClient,
  method: ApiRequestMethod,
  url: string,
  settings: Settings,
) => {
  const dpFetch = await adminGenericProxyFetch(client);
  const res = await dpFetch(url, {
    method,
    headers: {
      "Shortcut-Token": settings?.api_key || "",
      "Content-Type": "application/json",
    },
  });

  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${method} ${url}: Response Status [${res.status}]`);
  }

  return res.json();
};
