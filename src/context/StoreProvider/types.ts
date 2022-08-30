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
  | "edit"
  | "add_comment"
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

// Shortcut types
export type DateTime = string; // eg. 2022-08-24T15:23:51Z
export type MarkdownString = string;

export interface StoryLabel {
  id: number;
  name: string;
  app_url: string;
  archived: boolean;
  color: string;
  created_at: DateTime;
  description: string;
  entity_type: "label";
  external_id: string;
  global_id: string;
  updated_at: DateTime;
  stats: Record<string, number>;
}

export interface Member {
  created_at: DateTime;
  created_without_invite: boolean;
  disabled: boolean;
  entity_type: "member";
  global_id: string;
  group_ids: string[];
  id: string;
  profile: {
    deactivated: boolean;
    display_icon?: {
      id: string;
      url: string;
      entity_type: "user-icon"
      created_at: DateTime;
      updated_at: DateTime;
    };
    email_address?: string;
    entity_type: "profile";
    gravatar_hash?: string;
    id: string;
    mention_name: string;
    name: string;
  };
  role: string;
  state: string;
  updated_at: DateTime;
}

export interface Comment {
  app_url: string;
  author_id: Member["id"];
  created_at: DateTime;
  deleted: boolean;
  entity_type: "story-comment";
  external_id?: string;
  group_mention_ids: string[];
  id: number;
  member_mention_ids: Array<Member["id"]>;
  mention_ids: Array<Member["id"]>;
  position: number;
  reactions: any[];
  story_id: 29
  text: MarkdownString;
  textHtml: string;
  updated_at: DateTime;
}

export interface StoryItem {
  id: string;
  url: string;
  name: string;
  type: string;
  projectId?: number;
  projectName?: string;
  workflowId: number;
  workflowName: string;
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
  labels: StoryLabel[];
  description?: string;
  descriptionHtml?: string;
  deadline?: Date;
  requesterId: string;
  followerIds: string[];
  comments: Comment[];
}

export interface StorySearchItem extends StoryItem {

}

export interface CreateStoryData {
  name: string;
  description: string;
  type: string;
  labels: Array<StoryLabel["id"]>;
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

export interface ShortcutStoryAssociationPropsLabel {
  id: string;
  name: string;
}

export interface ShortcutStoryAssociationProps {
  id: string;
  name: string;
  type: string;
  projectId?: string;
  projectName?: string;
  workflowId: string;
  workflowName: string;
  statusId?: string;
  statusName?: string;
  teamId?: string;
  teamName?: string;
  iterationId?: string;
  iterationName?: string;
  epicId?: string;
  epicName?: string;
  labels: ShortcutStoryAssociationPropsLabel[];
}