import { FC, useEffect, useMemo } from "react";
import { useFindLinkedStoryById, useSetAppTitle } from "../hooks";
import { useStore } from "../context/StoreProvider/hooks";
import {
  H1,
  Pill,
  Property,
  Stack, useDeskproAppClient, useDeskproAppTheme,
} from "@deskpro/app-sdk";
import { ExternalLink } from "../components/ExternalLink/ExternalLink";
import { capitalize } from "lodash";
import { Label } from "../components/Label/Label";

export interface ViewProps {
  id: string;
}

export const View: FC<ViewProps> = ({ id }: ViewProps) => {
  const [, dispatch] = useStore();
  const findStoryById = useFindLinkedStoryById();
  const { theme } = useDeskproAppTheme();
  const { client } = useDeskproAppClient();

  const story = useMemo(() => findStoryById(id), [id]);

  if (!story) {
    dispatch({ type: "error", error: "Story not found" });
    return (<></>);
  }

  useSetAppTitle(story.id);

  useEffect(() => {
    client?.registerElement("home", { type: "home_button" });
    client?.registerElement("viewContextMenu", { type: "menu", items: [
        { title: "Unlink Ticket", payload: { action: "unlink", id }, },
    ] });
  }, [client]);

  return (
    <>
      <Stack align="start" gap={10}>
        <Stack gap={10} vertical>
          <div style={{ display: "flex", alignItems: "start" }}>
            <H1 style={{ marginRight: "1px" }}>
              {story.name}
            </H1>
            <ExternalLink href={story.url} style={{ position: "relative", top: "-4px" }} />
          </div>
          <Property title="Story ID">
            {story.id}
          </Property>
          <Property title="Project">
            {story.projectName ?? (<em>None</em>)}
          </Property>
          <Property title="Workflow">
            {story.workflowName ?? (<em>None</em>)}
          </Property>
          <Property title="State">
            {story.stateId ? (
              <Pill
                textColor={theme.colors.white}
                backgroundColor={theme.colors.grey80}
                label={story.stateName}
              />
            ) : (<span>None</span>)}
          </Property>
          <Property title="Type">
            {capitalize(story.type)}
          </Property>
          {(story.epicId && story.epicUrl) && (
              <Property title="Epic">
                {story.epicName}
                <ExternalLink href={story.epicUrl} />
              </Property>
          )}
          {story.descriptionHtml && (
            <Property title="Description">
              <div dangerouslySetInnerHTML={{ __html: story.descriptionHtml }} />
            </Property>
          )}
          <Property title="Iteration">
            {story.iterationId ? (story.iterationName) : (<em>None</em>)}
          </Property>
          {story.teamId && (
            <Property title="Team">
              {story.teamName}
            </Property>
          )}
          {(story.owners && story.owners.length > 0) && (
            <Property title="Owners">
              {story.owners.map((owner, idx) => (
                <div key={idx} style={{ marginBottom: "3px" }}>
                  {owner.name}
                </div>
              ))}
            </Property>
          )}
          {story.deadline && (
            <Property title="Due Date">
              {story.deadline.toLocaleDateString()}
            </Property>
          )}
          {(story.labels && story.labels.length > 0) && (
            <Property title="Labels">
              <Stack gap={2}>
                {story.labels.map((label, idx) => (
                  <Label key={idx} color={label.color}>
                    <span>{label.name}</span>
                  </Label>
                ))}
              </Stack>
            </Property>
          )}
          {(story.epicLabels && story.epicLabels.length > 0) && (
            <Property title="Epic Labels">
              <Stack gap={2}>
                {story.epicLabels.map((label, idx) => (
                  <Label key={idx} color={label.color}>
                    <span>{label.name}</span>
                  </Label>
                ))}
              </Stack>
            </Property>
          )}
        </Stack>
      </Stack>
    </>
  );
};
