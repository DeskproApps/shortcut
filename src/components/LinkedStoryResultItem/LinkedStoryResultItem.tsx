import {
  HorizontalDivider,
  Pill,
  Property,
  Stack,
  VerticalDivider,
  useDeskproAppTheme,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { AnyIcon, RoundedLabelTag } from "@deskpro/deskpro-ui";
import capitalize from "lodash.capitalize";
import get from "lodash.get";
import isEmpty from "lodash.isempty";
import { FC, useMemo } from "react";
import { StoryItemRes } from "../../context/StoreProvider/types";
import { useAssociatedEntityCount } from "../../hooks";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import { Label } from "../Label/Label";
import { Relationships } from "../Relationships/Relationships";
import { Title } from "../Title/Title";
import "./LinkedStoryResultItem.css";
import { getStoryDependencies } from "../../context/StoreProvider/api";
import { getOtherParamsStory } from "../../context/StoreProvider/hooks";
export interface LinkedStoryResultItemProps {
  item: StoryItemRes;
  onView?: () => void;
}

export const LinkedStoryResultItem: FC<LinkedStoryResultItemProps> = ({
  item,
  onView,
}: LinkedStoryResultItemProps) => {
  const { theme } = useDeskproAppTheme();
  const entityCount = useAssociatedEntityCount(item.id);

  const dataDependenciesQuery = useQueryWithClient(
    ["dataDependencies"],
    (client) => getStoryDependencies(client)
  );

  const dataDependencies = dataDependenciesQuery.data;

  const { project, workflows, state, epic, iteration, group, owners } = useMemo(
    () => getOtherParamsStory(item, dataDependencies),
    [item, dataDependencies]
  );
  console.log(owners);
  return (
    <>
      <Stack align="start" gap={10}>
        <Stack gap={10} vertical>
          <Title name={item.name} url={item.app_url} onClick={onView} />
          {item.archived && (
            <RoundedLabelTag
              label={"Archived"}
              backgroundColor={theme.colors.grey80}
              textColor={"white"}
              closeIcon={"" as unknown as AnyIcon}
            />
          )}
          <Stack align="stretch">
            <Property title="Story ID" width="108px">
              {item.id}
            </Property>
            <VerticalDivider width={1} />
            <Property title="Deskpro Tickets">{entityCount}</Property>
          </Stack>
          <Property title="Project">
            {project ? project.name : <em>None</em>}
          </Property>
          <Property title="Workflow">
            {workflows ? workflows.name : <em>None</em>}
          </Property>
          <Property title="State">
            {state.id ? (
              <Pill
                textColor={theme.colors.white}
                backgroundColor={theme.colors.cyan100}
                label={state.name}
              />
            ) : (
              <span>None</span>
            )}
          </Property>
          <Property title="Type">{capitalize(item.story_type)}</Property>
          {epic?.id && epic.url && (
            <Property title="Epic">
              {epic.name}
              <ExternalLink href={epic.url} />
            </Property>
          )}
          <Property title="Iteration">
            {iteration?.id ? iteration?.name : <em>None</em>}
          </Property>
          {group?.id && <Property title="Team">{group.name}</Property>}
          {owners && owners.length > 0 && (
            <Property title="Owners">
              {owners.map((owner, idx) => (
                <div key={idx} style={{ marginBottom: "3px" }}>
                  {owner.name}
                </div>
              ))}
            </Property>
          )}
          {item?.labels && item.labels.length > 0 && (
            <Property title="Labels">
              <Stack gap={2} wrap="wrap">
                {item.labels.map((label, idx) => (
                  <Label key={idx} color={label.color}>
                    <span>{label.name}</span>
                  </Label>
                ))}
              </Stack>
            </Property>
          )}
          {!isEmpty(get(item, ["storyLinks"], [])) && (
            <Property title="Relationships">
              <Relationships storyLinks={get(item, ["storyLinks"], [])} />
            </Property>
          )}
        </Stack>
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
    </>
  );
};
