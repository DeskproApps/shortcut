import { FC } from "react";
import { match } from "ts-pattern";
import isEmpty from "lodash.isempty";
import capitalize from "lodash.capitalize";
import { LoadingSpinner, P5, useQueryWithClient } from "@deskpro/app-sdk";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import { StoryItem } from "../../context/StoreProvider/types";
import { getStoryById } from "../../context/StoreProvider/api";

const Relationships: FC<{ storyLinks?: any[] }> = ({ storyLinks = [] }) => {
  const storyQuery = useQueryWithClient(
    ["story", storyLinks.length.toString()],
    (client) => {
      {
        return Promise.all(
          storyLinks.map((link) =>
            getStoryById(
              client,
              link.type === "object" ? link.subject_id : link.object_id
            )
          )
        );
      }
    },
    {
      enabled: storyLinks.length > 0,
    }
  );

  if (storyQuery.isLoading && storyQuery.isFetching) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  return (
    <div style={{ width: "100%" }}>
      {storyLinks.map((link) => {
        const relationId =
          link.type === "object" ? link.subject_id : link.object_id;

        const story = storyQuery.data?.find((e) => e.id === relationId);

        const verb = match([link.verb, link.type])
          .with(["blocks", "object"], () => "Blocked by")
          .with(["blocks", "subject"], () => "Blocks")
          .with(["duplicates", "object"], () => "Duplicated by")
          .with(["duplicates", "subject"], () => "Duplicates")
          .otherwise(() => capitalize(link.verb));

        return isEmpty(story) ? null : (
          <div style={{ marginBottom: "2px" }} key={(story as StoryItem).id}>
            <P5 key={link.id}>
              {verb} <strong>{(story as StoryItem).name}</strong>
            </P5>
            <P5>
              {story?.id}:<ExternalLink href={(story as StoryItem).app_url} />
            </P5>
          </div>
        );
      })}
    </div>
  );
};

export { Relationships };
