import { FC, useEffect, useMemo, useState } from "react";
import capitalize from "lodash/capitalize";
import chunk from "lodash/chunk";
import {
  Pill,
  Stack,
  Property,
  VerticalDivider,
  HorizontalDivider,
  useDeskproAppTheme,
  useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
  useSetAppTitle,
  useFindLinkedStoryById,
  useLoadDataDependencies,
} from "../hooks";
import { getStoryCustomFieldsToShow } from "../utils";
import { Member } from "../context/StoreProvider/types";
import { normalize } from "../utils";
import { ExternalLink } from "../components/ExternalLink/ExternalLink";
import { Label } from "../components/Label/Label";
import { Title } from "../components/Title/Title";
import { Comments } from "../components/Comments/Comments";
import { AnyIcon, RoundedLabelTag } from "@deskpro/deskpro-ui";

export interface ViewProps {
  id: string;
}

export const View: FC<ViewProps> = ({ id }: ViewProps) => {
  const [state, dispatch] = useStore();
  const findStoryById = useFindLinkedStoryById();
  const { theme } = useDeskproAppTheme();
  const { client } = useDeskproAppClient();
  const [customFields, setCustomFields] = useState<Array<any>>([]);
  const [members, setMembers] = useState<Record<Member["id"], Member>>({});

  const story = useMemo(() => findStoryById(id), [id]);

  if (!story) {
    dispatch({ type: "error", error: "Story not found" });
    return (<></>);
  }

  useSetAppTitle(story.id);
  useLoadDataDependencies();

  useEffect(() => {
    client?.deregisterElement("edit");
    client?.registerElement("home", { type: "home_button" });
    client?.registerElement("viewContextMenu", { type: "menu", items: [
        { title: "Unlink Ticket", payload: { action: "unlink", id, story, ticketId: state.context?.data.ticket.id }, },
    ]});
    client?.registerElement("edit", { type: "edit_button", payload: id });
  }, [client]);

  useEffect(() => {
    if (!state.dataDependencies?.customFields) {
      return;
    }

    setCustomFields(getStoryCustomFieldsToShow(
        story.type,
        story.customFields,
        state.dataDependencies.customFields,
    ));
  }, [state.dataDependencies?.customFields]);

  useEffect(() => {
      setMembers(normalize(state.dataDependencies?.members));
  }, [state.dataDependencies?.members]);

  return (
    <>
      <Stack align="start" gap={10}>
        <Stack gap={10} vertical style={{ width: "100%" }}>
          <Title name={story.name} url={story.url} />
          {story.archived && (
            <RoundedLabelTag
              label={"Archived"}
              backgroundColor={theme.colors.grey80}
              textColor={"white"}
              closeIcon={"" as unknown as AnyIcon}
            />
          )}
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
                backgroundColor={theme.colors.cyan100}
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
          <Property title="Description">
            {story.descriptionHtml
                ? <div dangerouslySetInnerHTML={{ __html: story.descriptionHtml }} />
                : <span style={{ color: theme.colors.grey40 }}>---</span>
            }
          </Property>
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
          <HorizontalDivider style={{ width: "100%", marginTop: "8px", marginBottom: "8px" }} />
          {chunk(customFields, 2).map((fields, idx) => {
            return (fields.length === 2)
                ? (
                    <Stack key={idx} align="stretch">
                      <Property title={fields[0].label} width="108px">
                        {fields[0].value}
                      </Property>
                      <VerticalDivider width={1} />
                      <Property title={fields[1].label}>
                        {fields[1].value}
                      </Property>
                    </Stack>
                )
                : (
                    <Property key={idx} title={fields[0].label}>
                      {fields[0].value}
                    </Property>
                )
          })}
        </Stack>
      </Stack>
      <HorizontalDivider style={{ marginTop: "10px", marginBottom: "10px" }}/>
      <Comments
          members={members}
          comments={story.comments}
          onAddComment={() => dispatch({
            type: "changePage",
            page: "add_comment",
            params: { storyId: id },
          })}
      />
    </>
  );
};
