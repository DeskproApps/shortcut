/* eslint-disable react-hooks/rules-of-hooks */
import {
  HorizontalDivider,
  LoadingSpinner,
  Pill,
  Property,
  Stack,
  Title as TitleUI,
  VerticalDivider,
  useDeskproAppTheme,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
  useDeskproElements,
  Title,
} from "@deskpro/app-sdk";
import { AnyIcon, H2, RoundedLabelTag } from "@deskpro/deskpro-ui";
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
import { ContainerMarkdown } from "../components/ContainerMarkdown/ContainerMarkdown";

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
      <Stack align="start" gap={10}>
        <Stack gap={10} vertical align="stretch" style={{ width: "100%" }}>
          <Title
            title={story.name}
            link={story.app_url}
            icon={<ShortcutLogo />}
            marginBottom={0}
          />
          {story.archived && (
            <RoundedLabelTag
              label={"Archived"}
              backgroundColor={theme.colors.grey80}
              textColor={"white"}
              closeIcon={"" as unknown as AnyIcon}
            />
          )}
          <Property title="Story ID">{story.id}</Property>
          <Property title="Project">{project?.name ?? <em>None</em>}</Property>
          <Property title="Workflow">
            {workflows?.name ?? <em>None</em>}
          </Property>
          <Property title="State">
            {stateId ? (
              <Pill
                textColor={theme.colors.white}
                backgroundColor={theme.colors.cyan100}
                label={state.name}
              />
            ) : (
              <span>None</span>
            )}
          </Property>
          <Property title="Type">{capitalize(story.story_type)}</Property>
          {epic?.id && epic?.url && (
            <Property title="Epic">
              {epic.name}
              <ExternalLink href={epic.url} />
            </Property>
          )}
          <Stack vertical>
            <H2 style={{ color: theme.colors.grey80 }}>Description</H2>
            <ContainerMarkdown
              dangerouslySetInnerHTML={{ __html: story?.descriptionHtml || "-" }}
            />
          </Stack>
          <Property title="Iteration">
            {iteration?.id ? iteration.name : <em>None</em>}
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
          {story?.deadline && (
            <Property title="Due Date">
              {story.deadline.toLocaleDateString()}
            </Property>
          )}
          {story?.labels && story.labels.length > 0 && (
            <Property title="Labels">
              <Stack gap={2} wrap="wrap">
                {story.labels.map((label, idx) => (
                  <Label key={idx} color={label.color}>
                    <span>{label.name}</span>
                  </Label>
                ))}
              </Stack>
            </Property>
          )}
          {epic?.labels && epic.labels.length > 0 && (
            <Property title="Epic Labels">
              <Stack gap={2}>
                {epic.labels.map(
                  (
                    label: { id: string; color: string; name: string },
                    idx: number
                  ) => (
                    <Label key={idx} color={label.color}>
                      <span>{label.name}</span>
                    </Label>
                  )
                )}
              </Stack>
            </Property>
          )}

          {Boolean(customFields?.length) && (
            <HorizontalDivider
              style={{ width: "100%", marginTop: "8px", marginBottom: "8px" }}
            />
          )}
          {chunk(customFields, 2).map((fields, idx) => {
            return fields.length === 2 ? (
              <Stack key={idx} align="stretch">
                <Property title={fields[0].label} width="108px">
                  {fields[0].value}
                </Property>
                <VerticalDivider width={1} />
                <Property title={fields[1].label}>{fields[1].value}</Property>
              </Stack>
            ) : (
              <Property key={idx} title={fields[0].label}>
                {fields[0].value}
              </Property>
            );
          })}

          <HorizontalDivider
            style={{ width: "100%", marginTop: "8px", marginBottom: "8px" }}
          />

          <TitleUI
            title={`Relationships (${get(story, ["storyLinks"], []).length})`}
            onClick={() => navigate("/add/storyrelations/" + id)}
            marginBottom={0}
          />

          <Relationships storyLinks={get(story, ["storyLinks"], [])} />
        </Stack>
      </Stack>
      <HorizontalDivider style={{ marginTop: "10px", marginBottom: "10px" }} />
      <Comments
        comments={story.comments}
        onAddComment={() => navigate("/add/comment/" + id)}
      />
    </>
  );
};
