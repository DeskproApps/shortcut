/* eslint-disable react-hooks/rules-of-hooks */
import { P5, Pill, Stack, } from "@deskpro/deskpro-ui";
import {
  Title,
  Property,
  TwoProperties,
  LoadingSpinner,
  HorizontalDivider,
  useQueryWithClient,
  useDeskproElements,
  useDeskproAppTheme,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { AnyIcon, RoundedLabelTag } from "@deskpro/deskpro-ui";
import capitalize from "lodash.capitalize";
import chunk from "lodash.chunk";
import get from "lodash.get";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Comments } from "../components/Comments/Comments";
import { ExternalLink } from "../components/ExternalLink/ExternalLink";
import { Label } from "../components/Label/Label";
import { Relationships } from "../components/Relationships/Relationships";
import { ShortcutLogo } from "../components/ShortcutLogo/ShortcutLogo";
import {
  getStoryById,
  getStoryDependencies,
} from "../context/StoreProvider/api";
import { StoryItemRes } from "../context/StoreProvider/types";
import { getStoryCustomFieldsToShow } from "../utils";
import { getOtherParamsStory } from "../context/StoreProvider/hooks";
import { DPNormalize } from "../components/Typography";

export const View = () => {
  const { context } = useDeskproLatestAppContext();
  const { theme } = useDeskproAppTheme();
  const [customFields, setCustomFields] = useState<Array<any>>([]);
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const storyQuery = useQueryWithClient(
    ["story", id],
    (client) => getStoryById(client, id),
    {
      enabled: !!id,
    }
  );

  const dataDependenciesQuery = useQueryWithClient(
    ["dataDependencies"],
    (client) => getStoryDependencies(client)
  );

  const story = storyQuery.data as StoryItemRes;

  const dataDependencies = dataDependenciesQuery.data;

  const { group, workflows, state, project, epic, iteration, stateId, owners } =
    getOtherParamsStory(story, dataDependencies);

  useInitialisedDeskproAppClient(
    (client) => {
      storyQuery.isSuccess && client?.setTitle(story.id.toString());
    },
    [storyQuery.isSuccess]
  );

  useDeskproElements(({ registerElement, clearElements }) => {
    clearElements();

    registerElement("home", { type: "home_button" });
    registerElement("edit", { type: "edit_button", payload: id });
    registerElement("viewContextMenu", {
      type: "menu",
      items: [
        {
          title: "Unlink Ticket",
          payload: {
            action: "unlink",
            id,
            story,
            ticketId: context?.data.ticket.id,
          },
        },
      ],
    });
  }, [context, id, story]);

  useEffect(() => {
    if (!dataDependencies?.customFields || storyQuery.isLoading) {
      return;
    }

    setCustomFields(
      getStoryCustomFieldsToShow(
        story.story_type,
        story.custom_fields,
        dataDependencies.customFields
      ) || []
    );
  }, [dataDependencies?.customFields, storyQuery.isLoading]);

  if (storyQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (storyQuery.error) {
    throw new Error("Story not found");
  }

  return (
    <>
      <Title
        title={story.name}
        link={story.app_url}
        icon={<ShortcutLogo />}
      />
      {story.archived && (
        <RoundedLabelTag
          label={"Archived"}
          backgroundColor={theme.colors.grey80}
          textColor={"white"}
          closeIcon={"" as unknown as AnyIcon}
        />
      )}
      <Property label="Story ID" text={story.id}/>
      <Property label="Project" text={project?.name ?? <P5>None</P5>}/>
      <Property label="Workflow" text={workflows?.name ?? <P5>None</P5>}/>
      <Property
        label="State"
        text={stateId ? (
          <Pill
            textColor={theme.colors.white}
            backgroundColor={theme.colors.cyan100}
            label={state.name}
          />
        ) : (
          <P5>None</P5>
        )}
      />
      <Property label="Type" text={capitalize(story.story_type)}/>
      {epic?.id && epic?.url && (
        <Property
          label="Epic"
          text={(
            <P5>{epic.name} <ExternalLink href={epic.url} /></P5>
          )}
        />
      )}
      <Property
        label="Description"
        text={<DPNormalize text={story?.descriptionHtml}/>}
      />
      <Property
        label="Iteration"
        text={iteration?.id ? iteration.name : <P5>None</P5>}
      />
      {group?.id && (
        <Property label="Team" text={group.name}/>
      )}
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
      {story?.deadline && (
        <Property
          label="Due Date"
          text={story.deadline.toLocaleDateString()}
        />
      )}
      {story?.labels && story.labels.length > 0 && (
        <Property
          label="Labels"
          text={(
            <Stack gap={2} wrap="wrap">
              {story.labels.map((label, idx) => (
                <Label key={idx} color={label.color}>{label.name}</Label>
              ))}
            </Stack>
          )}
        />
      )}
      {epic?.labels && epic.labels.length > 0 && (
        <Property
          label="Epic Labels"
          text={(
            <Stack gap={2} wrap="wrap">
              {epic.labels.map((
                label: { id: string; color: string; name: string },
                idx: number,
              ) => (
                <Label key={idx} color={label.color}>{label.name}</Label>
              ))}
            </Stack>
          )}
        />
      )}
      {Boolean(customFields?.length) && (
        <HorizontalDivider
          style={{ width: "100%", marginTop: "8px", marginBottom: "8px" }}
        />
      )}
      {chunk(customFields, 2).map((fields, idx) => (fields.length === 2)
        ? (
          <TwoProperties
            key={idx}
            leftLabel={fields[0].label}
            leftText={fields[0].value}
            rightLabel={fields[1].label}
            rightText={fields[1].value}
          />
        )
        : (
          <Property
            key={idx}
            label={fields[0].label}
            text={fields[0].value}
          />
        ))
      }

      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }}/>

      <Title
        title={`Relationships (${get(story, ["storyLinks"], []).length})`}
        onClick={() => navigate("/add/storyrelations/" + id)}
      />

      <Relationships storyLinks={get(story, ["storyLinks"], [])} />

      <HorizontalDivider style={{ marginTop: "10px", marginBottom: "10px" }} />

      <Comments
        comments={story.comments}
        onAddComment={() => navigate("/add/comment/" + id)}
      />
    </>
  );
};
