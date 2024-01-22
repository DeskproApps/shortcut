import { useCallback, MouseEventHandler } from "react";
import { P5, Pill, Stack } from "@deskpro/deskpro-ui";
import {
  Title,
  Property,
  TwoProperties,
  HorizontalDivider,
  useDeskproAppTheme,
} from "@deskpro/app-sdk";
import { FC, ReactElement } from "react";
import { AnyIcon, RoundedLabelTag } from "@deskpro/deskpro-ui";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import { Link } from "../Link/Link";
import { ShortcutLogo } from "../ShortcutLogo/ShortcutLogo";
import "./SearchResultItem.css";
import { StorySearchItem } from "../../context/StoreProvider/types";
import { Label } from "../Label/Label";
import { useAssociatedEntityCount } from "../../hooks";
import capitalize from "lodash.capitalize";

export interface SearchResultItemProps {
  item: StorySearchItem;
  checkbox?: ReactElement;
  onSelect?: () => void;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({
  item,
  checkbox,
  onSelect,
}: SearchResultItemProps) => {
  const { theme } = useDeskproAppTheme();
  const entityCount = useAssociatedEntityCount(item.id);

  const onSelectItem: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    e.preventDefault();

    if (onSelect) {
      onSelect();
    }
  }, [onSelect]);

  return (
    <>
      <Stack align="start" gap={10}>
        {checkbox && checkbox}
        <div style={{ width: "100%" }}>
          <Title
            title={(<Link href="#" onClick={onSelectItem}>{item.name}</Link>)}
            link={item.appUrl}
            icon={<ShortcutLogo />}
          />
          {item.archived && (
            <RoundedLabelTag
              label={"Archived"}
              backgroundColor={theme.colors.grey80}
              textColor="white"
              closeIcon={"" as unknown as AnyIcon}
            />
          )}
          <TwoProperties
            leftLabel="Story ID"
            leftText={item.id}
            rightLabel="Deskpro Tickets"
            rightText={entityCount}
          />
          {item.epicId && item.epicUrl && (
            <Property
              label="Epic"
              text={(
                <P5>
                  {item.epicName} <ExternalLink href={item.epicUrl} />
                </P5>
              )}
            />
          )}
          <Property
            label="State"
            text={item.stateId ? (
              <Pill
                textColor={theme.colors.white}
                backgroundColor={theme.colors.cyan100}
                label={item.stateName}
              />
            ) : (
              <P5>None</P5>
            )}
          />
          <Property label="Type" text={capitalize(item.type)}/>
          <Property label="Iteration" text={item.iterationId ? item.iterationName : <P5>None</P5>}/>
          {item.teamId && <Property label="Team" text={item.teamName}/>}
          {item.owners && item.owners.length > 0 && (
            <Property
              label="Owners"
              text={item.owners.map((owner, idx) => (
                <P5 key={idx} style={{ marginBottom: "3px" }}>
                  {owner.name}
                </P5>
              ))}
            />
          )}
          {item.labels && item.labels.length > 0 && (
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
        </div>
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
    </>
  );
};
