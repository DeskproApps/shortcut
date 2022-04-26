import { Context } from "@deskpro/app-sdk";
import { Reducer } from "react";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type StoreReducer = Reducer<State, Action>;

export type Dispatch = (action: Action) => void;

export type Page =
  "home"
  | "link"
  | "view"
  | "create"
;

export interface State {
  page?: Page;
  pageParams?: any;
  context?: TicketContext;
  linkStorySearchResults?: { loading: boolean, list: StorySearchItem[] };
  linkedStoriesResults?: { loading: boolean, list: StoryItem[] };
  dataDependencies?: any;

  // ...

  _error?: Error|unknown;
}

export type Action =
  | { type: "changePage", page: Page, params?: object }
  | { type: "loadContext", context: Context }
  | { type: "linkStorySearchListLoading" }
  | { type: "linkStorySearchList", list: StorySearchItem[] }
  | { type: "linkStorySearchListReset" }
  | { type: "linkedStoriesList", list: StoryItem[] }
  | { type: "linkedStoriesListLoading" }
  | { type: "loadDataDependencies", deps: any }

  // ...

  | { type: "error", error: string }
;

export interface TicketContext extends Context {
  data: { ticket: { id: string, permalinkUrl: string }, currentAgent: { primaryEmail: string } }
}

export interface StoryItem {
  id: string;
  url: string;
  name: string;
  type: string;
  epicId?: number;
  epicName?: string;
  epicUrl?: string;
  epicLabels: { id: number; name: string; color: string }[];
  stateId?: number;
  stateName?: string;
  iterationId?: number;
  iterationName?: string;
  teamId?: string;
  teamName?: string;
  teamIconUrl?: string;
  owners: { id: string; name: string; iconUrl?: string }[];
  labels: { id: number; name: string; color: string }[];
  descriptionHtml?: string;
  deadline?: Date;
}

export interface StorySearchItem extends StoryItem {

}

export interface CreateStoryData {
  name: string;
  description: string;
  type: string;
  labels: string[];
  followers: string[],
  owners: string[],
  team?: string;
  workflow?: string;
  state?: string;
  project?: string;
  epic?: string;
  iteration?: string;
  requester?: string;
}
