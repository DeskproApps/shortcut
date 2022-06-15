import {
  H1,
  HorizontalDivider, Pill,
  Property,
  Stack, useDeskproAppTheme,
  VerticalDivider
} from "@deskpro/app-sdk";
import { FC } from "react";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import "./LinkedStoryResultItem.css";
import { StoryItem } from "../../context/StoreProvider/types";
import { capitalize } from "lodash";
import { Label } from "../Label/Label";
import { useAssociatedEntityCount } from "../../hooks";

export interface LinkedStoryResultItemProps {
  item: StoryItem;
  onView?: () => void;
}

export const LinkedStoryResultItem: FC<LinkedStoryResultItemProps> = ({ item, onView }: LinkedStoryResultItemProps) => {
  const { theme } = useDeskproAppTheme();
  const entityCount = useAssociatedEntityCount(item.id);

  return (
    <>
      <Stack align="start" gap={10}>
        <Stack gap={10} vertical>
          <div style={{ display: "flex", alignItems: "start" }}>
            <H1 onClick={() => onView && onView()} style={{ color: theme.colors.cyan100, cursor: "pointer", marginRight: "1px" }}>
              {item.name}
            </H1>
            <ExternalLink href={item.url} style={{ position: "relative", top: "-4px" }} />
          </div>
          <Stack align="stretch">
            <Property title="Story ID" width="108px">
              {item.id}
            </Property>
            <VerticalDivider width={1} />
            <Property title="Deskpro Tickets">
              {entityCount}
            </Property>
          </Stack>
          <Property title="Project">
            {item.projectName ? (item.projectName) : (<em>None</em>)}
          </Property>
          <Property title="Workflow">
            {item.workflowName ? (item.workflowName) : (<em>None</em>)}
          </Property>
          <Property title="State">
            {item.stateId ? (
              <Pill
                textColor={theme.colors.white}
                backgroundColor={theme.colors.grey80}
                label={item.stateName}
              />
            ) : (<span>None</span>)}
          </Property>
          <Property title="Type">
            {capitalize(item.type)}
          </Property>
          {(item.epicId && item.epicUrl) && (
              <Property title="Epic">
                {item.epicName}
                <ExternalLink href={item.epicUrl} />
              </Property>
          )}
          <Property title="Iteration">
            {item.iterationId ? (item.iterationName) : (<em>None</em>)}
          </Property>
          {item.teamId && (
            <Property title="Team">
              {item.teamName}
            </Property>
          )}
          {(item.owners && item.owners.length > 0) && (
            <Property title="Owners">
              {item.owners.map((owner, idx) => (
                <div key={idx} style={{ marginBottom: "3px" }}>
                  {owner.name}
                </div>
              ))}
            </Property>
          )}
          {(item.labels && item.labels.length > 0) && (
            <Property title="Labels">
              <Stack gap={2}>
                {item.labels.map((label, idx) => (
                  <Label key={idx} color={label.color}>
                    <span>{label.name}</span>
                  </Label>
                ))}
              </Stack>
            </Property>
          )}
        </Stack>
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
    </>
  );
};
