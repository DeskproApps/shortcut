import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import cache from "js-cache";
import showdown from "showdown";
import { ApiRequestMethod, CreateStoryData, StorySearchItem } from "./types";

// Shortcut REST API Base URL
const API_BASE_URL = "https://api.app.shortcut.com/api/v3";

// Key for search dependency caching (milliseconds)
const SEARCH_DEPS_CACHE_TTL = 5 * (60 * 1000); // 5 Minutes

const markdownToHtmlConverter = new showdown.Converter();
/**
 * Fetch a single Shortcut story by ID, e.g. "123"
 */
export const getStoryById = async (client: IDeskproClient, id: string) =>
  request(client, "GET", `${API_BASE_URL}/stories/${id}`)
;

/**
 * Add an external link to a story
 */
export const addExternalUrlToStory = async (client: IDeskproClient, id: string, url: string): Promise<void> => {
  const story = await request(client, "GET", `${API_BASE_URL}/stories/${id}`);

  const externalLinks = [
    ...(story.external_links ?? []),
    url,
  ];

  await request(client, "PUT", `${API_BASE_URL}/stories/${id}`, {
    external_links: externalLinks,
  });
};

/**
 * Remove an external link from a story
 */
export const removeExternalUrlToStory = async (client: IDeskproClient, id: string, url: string): Promise<void> => {
  const story = await request(client, "GET", `${API_BASE_URL}/stories/${id}`);

  const externalLinks = (story.external_links ?? []).filter((existing) => existing !== url);

  await request(client, "PUT", `${API_BASE_URL}/stories/${id}`, {
    external_links: externalLinks,
  });
};

/**
 * Search stories in Shortcut
 */
export const searchStories = async (client: IDeskproClient, q: string): Promise<StorySearchItem[]> => {
  const { data: stories } = await request(client, "GET", `${API_BASE_URL}/search/stories?query=${q}&page_size=25`);

  const {
    groups,
    epics,
    members,
    workflows,
    iterations,
  } = await getStoryDependencies(client);

  const states = (workflows ?? []).reduce((all: any[], workflow: any) => [...all, ...workflow.states], []);

  return (stories ?? []).map((story: any) => {
    const epic = (epics ?? []).filter((e: any) => e.id === story.epic_id)[0] ?? null;
    const state = (states ?? []).filter((s: any) => s.id === story.workflow_state_id)[0] ?? null;
    const iteration = (iterations ?? []).filter((i: any) => i.id === story.iteration_id)[0] ?? null;
    const group = (groups ?? []).filter((g: any) => g.id === story.group_id)[0] ?? null;

    return {
      id: story.id,
      url: story.app_url,
      name: story.name,
      type: story.story_type,
      epicId: epic ? epic.id : undefined,
      epicName: epic ? epic.name : undefined,
      epicUrl: epic ? epic.app_url : undefined,
      stateId: state ? state.id : undefined,
      stateName: state ? state.name : undefined,
      iterationId: iteration ? iteration.id : undefined,
      iterationName: iteration ? iteration.name : undefined,
      teamId: group ? group.id : undefined,
      teamName: group ? group.name : undefined,
      teamIconUrl: group?.display_icon?.url ? group.display_icon.url : undefined,
      owners: (story.owner_ids ?? []).map((ownerId: string) => {
        const member = (members ?? []).filter((m: any) => m.id === ownerId)[0] ?? null;
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
}

/**
 * List stories by ID from Shortcut
 */
export const listStories = async (client: IDeskproClient, ids: string[]): Promise<StorySearchItem[]> => {
  const requests = ids.map((id) => [request(client, "GET", `${API_BASE_URL}/stories/${id}`), id]);

  const stories = [];
  for (const [req, id] of requests) {
    try {
      stories.push(await req);
    } catch (e) {
      console.warn(`Failed to find Shortcut story ID [${id}], this story may have been deleted`);
    }
  }

  const {
    groups,
    epics,
    members,
    workflows,
    iterations,
  } = await getStoryDependencies(client);

  const states = (workflows ?? []).reduce((all: any[], workflow: any) => [...all, ...workflow.states], []);

  return (stories ?? []).map((story: any) => {
    const epic = (epics ?? []).filter((e: any) => e.id === story.epic_id)[0] ?? null;
    const state = (states ?? []).filter((s: any) => s.id === story.workflow_state_id)[0] ?? null;
    const iteration = (iterations ?? []).filter((i: any) => i.id === story.iteration_id)[0] ?? null;
    const group = (groups ?? []).filter((g: any) => g.id === story.group_id)[0] ?? null;

    return {
      id: story.id,
      url: story.app_url,
      name: story.name,
      type: story.story_type,
      epicId: epic ? epic.id : undefined,
      epicName: epic ? epic.name : undefined,
      epicUrl: epic ? epic.app_url : undefined,
      epicLabels: (epic?.labels ?? []).map((label: any) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      stateId: state ? state.id : undefined,
      stateName: state ? state.name : undefined,
      iterationId: iteration ? iteration.id : undefined,
      iterationName: iteration ? iteration.name : undefined,
      teamId: group ? group.id : undefined,
      teamName: group ? group.name : undefined,
      teamIconUrl: group?.display_icon?.url ? group.display_icon.url : undefined,
      owners: (story.owner_ids ?? []).map((ownerId: string) => {
        const member = (members ?? []).filter((m: any) => m.id === ownerId)[0] ?? null;
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
      descriptionHtml: markdownToHtmlConverter.makeHtml(story.description),
      deadline: story?.deadline ? new Date(story.deadline) : undefined,
    } as StorySearchItem;
  });
}

export const createStory = async (client: IDeskproClient, data: CreateStoryData): Promise<number> => {
  const body: any = {
    name: data.name,
    description: data.description,
    labels: (data.labels ?? []).map((label: string) => ({
      name: label,
    })),
    story_type: data.type,
  };

  if (data.followers) {
    body.follower_ids = (data.followers ?? [])
      .map((follower) => `${follower}`)
    ;
  }

  if (data.owners) {
    body.owner_ids = (data.owners ?? [])
        .map((owner) => `${owner}`)
    ;
  }

  if (data.team) {
    body.group_id = data.team;
  }

  if (data.state) {
    body.workflow_state_id = data.state;
  }

  if (data.project) {
    body.project_id = data.project;
  }

  if (data.epic) {
    body.epic_id = data.epic;
  }

  if (data.iteration) {
    body.iteration_id = data.iteration;
  }

  if (data.requester) {
    body.requested_by_id = data.requester;
  }

  const createRes = await request(client, "POST", `${API_BASE_URL}/stories`, body);
  const newStoryId = createRes?.id;

  if (!newStoryId) {
    throw new Error("Failed to create story, could not get new story ID");
  }

  return newStoryId;
};

export const getStoryDependencies = async (client: IDeskproClient) => {
  const cache_key = "data_deps";

  if (!cache.get(cache_key)) {
    const dependencies = [
      request(client, "GET", `${API_BASE_URL}/groups`),
      request(client, "GET", `${API_BASE_URL}/epics`),
      request(client, "GET", `${API_BASE_URL}/members`),
      request(client, "GET", `${API_BASE_URL}/workflows`),
      request(client, "GET", `${API_BASE_URL}/iterations`),
      request(client, "GET", `${API_BASE_URL}/projects`),
      request(client, "GET", `${API_BASE_URL}/labels`),
    ];

    const [
      groups,
      epics,
      members,
      workflows,
      iterations,
      projects,
      labels,
    ] = await Promise.all(dependencies);

    const resolved = {
      groups,
      epics,
      members,
      workflows,
      iterations,
      projects,
      labels,
    };

    cache.set(cache_key, resolved, SEARCH_DEPS_CACHE_TTL);
  }

  return cache.get(cache_key);
};

const request = async (client: IDeskproClient, method: ApiRequestMethod, url: string, body?: any) => {
  const dpFetch = await proxyFetch(client);
  const res = await dpFetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Shortcut-Token": "__api_key__",
      "Content-Type": "application/json",
    }
  });

  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${method} ${url}: Response Status [${res.status}]`);
  }

  return res.json();
};
