export type StoryType = "bug" | "chore" | "feature";

export const storyTypes: StoryType[] = ["bug", "chore", "feature"];

export interface ShortcutMember {
  id: string;
  disabled: boolean;
  profile: { name: string; };
}

export interface ShortcutLabel {
  id: number;
  name: string;
  color: string;
  archived: boolean;
}

export interface ShortcutIteration {
  id: string;
  name: string;
}

export interface ShortcutEpic {
  id: string;
  name: string;
  project_ids: string[];
  archived: boolean;
}

export interface ShortcutProject {
  id: string;
  name: string;
  archived: boolean;
  workflow_id: string;
}

export interface ShortcutState {
  id: string;
  name: string;
}

export interface ShortcutWorkflow {
  id: string;
  name: string;
}

export interface ShortcutTeam {
  id: string;
  name: string;
  archived: boolean;
}
