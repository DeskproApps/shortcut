import { P5, Pill, Stack } from "@deskpro/deskpro-ui";
import {
  Title,
  Property,
  TwoProperties,
  HorizontalDivider,
  useDeskproAppTheme,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { AnyIcon, RoundedLabelTag } from "@deskpro/deskpro-ui";
import capitalize from "lodash.capitalize";
import get from "lodash.get";
import isEmpty from "lodash.isempty";
import { FC, useMemo, useCallback, MouseEventHandler } from "react";
import { StoryItemRes } from "../../context/StoreProvider/types";
import { useAssociatedEntityCount } from "../../hooks";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import { ShortcutLogo } from "../ShortcutLogo/ShortcutLogo";
import { Label } from "../Label/Label";
import { Relationships } from "../Relationships/Relationships";
import { Link } from "../Link/Link";
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

  const onClickView: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    e.preventDefault();

    if (onView) {
      onView();
    }
  }, [onView]);

  return (
    <>
      <Title
        title={(
          <Link href="#" onClick={onClickView}>{item.name}</Link>
        )}
        link={item.app_url}
        icon={<ShortcutLogo />}
      />
      {item.archived && (
        <RoundedLabelTag
          label={"Archived"}
          backgroundColor={theme.colors.grey80}
          textColor={"white"}
          closeIcon={"" as unknown as AnyIcon}
        />
      )}
      <TwoProperties
        leftLabel="Story ID"
        leftText={item.id}
        leftCopyText={`${item.id}`}
        rightLabel="Deskpro Tickets"
        rightText={entityCount}
      />
      <Property
        label="Project"
        text={project ? project.name : <P5>None</P5>}
      />
      <Property
        label="Workflow"
        text={workflows ? workflows.name : <P5>None</P5>}
      />
      <Property
        label="State"
        text={state.id ? (
          <Pill
            textColor={theme.colors.white}
            backgroundColor={theme.colors.cyan100}
            label={state.name}
          />
        ) : (
          <P5>None</P5>
        )}
      />
      <Property label="Type" text={capitalize(item.story_type)}/>
      {epic?.id && epic.url && (
        <Property
          label="Epic"
          text={(
            <P5>
              {epic.name} <ExternalLink href={epic.url} />
            </P5>
          )}
        />
      )}
      <Property
        label="Iteration"
        text={iteration?.id ? iteration?.name : <P5>None</P5>}
      />
      {group?.id && <Property label="Team" text={group.name}/>}
      {owners && owners.length > 0 && (
        <Property
          label="Owners"
          text={owners.map((owner, idx) => (
            <P5 key={idx} style={{ marginBottom: "3px" }}>
              {owner.name}
            </P5>
          ))}
        />
      )}
      {item?.labels && item.labels.length > 0 && (
        <Property
          label="Labels"
          text={(
            <Stack gap={2} wrap="wrap">
              {item.labels.map((label, idx) => (
                <Label key={idx} color={label.color}>{label.name}</Label>
              ))}
            </Stack>
          )}
        />
      )}
      {!isEmpty(get(item, ["storyLinks"], [])) && (
        <Property
          label="Relationships"
          text={(
            <Relationships storyLinks={get(item, ["storyLinks"], [])} />
          )}
        />
      )}
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
    </>
  );
};
