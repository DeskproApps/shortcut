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
;

export interface State {
  page?: Page;
  pageParams?: any;
  context?: TicketContext;
  linkStorySearchResults?: { loading: boolean, list: StorySearchItem[] };
  linkedStoriesResults?: { loading: boolean, list: StoryItem[] };
  dataDependencies?: any; // ToDo: need types

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

export interface CustomFieldValue {
  id: string;
  value: string;
  position: number;
  color_key: string;
  enabled: boolean;
  entity_type: "custom-field-enum-value";
}

export interface CustomField {
  id: string;
  name: string;
  description: string;
  canonical_name: "technical-area" | "skill-set" | "product-area" | "priority" | "severity";
  created_at: DateTime;
  enabled: boolean;
  entity_type: "custom-field";
  field_type: "enum";
  fixed_position: boolean;
  updated_at: DateTime;
  values: CustomFieldValue[];
  story_types?: Array<StoryItem["type"]>;
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
  customFields: Array<{
    field_id: CustomField["id"];
    value: CustomFieldValue["value"];
    value_id: CustomFieldValue["id"];
  }>;
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