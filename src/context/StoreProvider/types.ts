import { Context } from "@deskpro/app-sdk";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type Page =
  | "home"
  | "link"
  | "view"
  | "create"
  | "edit"
  | "add_comment"
  | "add_story_relations";

export interface TicketContext extends Context {
  data: {
    ticket: { id: string; permalinkUrl: string };
    currentAgent: { primaryEmail: string };
  };
}

export interface Settings {
  api_key?: string;
  default_comment_on_ticket_reply?: boolean;
  default_comment_on_ticket_note?: boolean;
  dont_add_deskpro_label?: boolean;
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
  canonical_name:
    | "technical-area"
    | "skill-set"
    | "product-area"
    | "priority"
    | "severity";
  created_at: DateTime;
  enabled: boolean;
  entity_type: "custom-field";
  field_type: "enum";
  fixed_position: boolean;
  updated_at: DateTime;
  values: CustomFieldValue[];
  story_types?: Array<StoryItem["type"]>;
}

export interface CurrentMember {
  id: string;
  name: string;
  mention_name: string;
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
      entity_type: "user-icon";
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

export interface StoryItemRes {
  descriptionHtml: string;
  app_url: string;
  description: string;
  archived: boolean;
  started: boolean;
  story_links: any[];
  entity_type: string;
  labels: Label[];
  mention_ids: any[];
  member_mention_ids: any[];
  story_type: string;
  custom_fields: any[];
  linked_files: any[];
  workflow_id: number;
  completed_at_override: null;
  started_at: null;
  completed_at: null;
  name: string;
  global_id: string;
  completed: boolean;
  comments: any[];
  blocker: boolean;
  branches: any[];
  epic_id: null;
  story_template_id: null;
  external_links: string[];
  previous_iteration_ids: any[];
  requested_by_id: string;
  iteration_id: null;
  tasks: any[];
  label_ids: number[];
  started_at_override: null;
  group_id: null;
  workflow_state_id: number;
  updated_at: string;
  pull_requests: any[];
  group_mention_ids: any[];
  follower_ids: string[];
  owner_ids: any[];
  external_id: null;
  id: number;
  estimate: null;
  commits: any[];
  files: any[];
  position: number;
  blocked: boolean;
  project_id: null;
  deadline: Date;
  stats: Stats;
  created_at: string;
  moved_at: string;
}

export interface Label {
  app_url: string;
  description: string;
  archived: boolean;
  entity_type: string;
  color: string;
  name: string;
  global_id: string;
  updated_at: string;
  external_id: null;
  id: number;
  created_at: string;
}

export interface Stats {
  num_related_documents: number;
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
  story_id: StoryItem["id"];
  text: MarkdownString;
  textHtml: string;
  updated_at: DateTime;
}

export interface StoryLink {
  entity_type: "story-link";
  id: number;
  object_id: StoryItem["id"];
  subject_id: StoryItem["id"];
  subject_workflow_state_id: number;
  type: "object" | "subject";
  verb: "relates to" | "duplicates" | "blocks";
  created_at: DateTime;
  updated_at: DateTime;
}

export interface StoryItem {
  appUrl: string;
  archived: boolean;
  id: number;
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
  comments: Comment[];
  storyLinks: StoryLink[];
}

export type StorySearchItem = StoryItem;

export interface CreateStoryData {
  name: string;
  description: string;
  type: string;
  labels: Array<StoryLabel["id"]>;
  followers: string[];
  owners: string[];
  team?: string;
  workflow?: string;
  state?: string;
  project?: string;
  epic?: string;
  iteration?: string;
  requester?: string;
  "custom-field-technical-area": string;
  "custom-field-skill-set": string;
  "custom-field-product-area": string;
  "custom-field-priority": string;
  "custom-field-severity": string;
}

export interface ShortcutStoryAssociationPropsLabel {
  id: string;
  name: string;
}

export interface ShortcutStoryAssociationProps {
  archived: boolean;
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
