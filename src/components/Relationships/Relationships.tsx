import { FC } from "react";
import { match } from "ts-pattern";
import isEmpty from "lodash/isEmpty";
import capitalize from "lodash/capitalize";
import { P5 } from "@deskpro/app-sdk";
import { useFindRelationsStoryById } from "../../hooks";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import { StoryItem } from "../../context/StoreProvider/types";

const Relationships: FC<{ storyLinks?: any[] }> = ({ storyLinks = [] }) => {
    const findStoryById = useFindRelationsStoryById();

    return (
        <div style={{ width: "100%" }}>
            {storyLinks.map((link) => {
                const relationId = (link.type === "object") ? link.subject_id : link.object_id;
                const story = findStoryById(relationId);
                const verb = match([link.verb, link.type])
                    .with(["blocks", "object"], () => "Blocked by")
                    .with(["blocks", "subject"], () => "Blocks")
                    .with(["duplicates", "object"], () => "Duplicated by")
                    .with(["duplicates", "subject"], () => "Duplicates")
                    .otherwise(() => capitalize(link.verb))

                return isEmpty(story) ? null : (
                    <div style={{ marginBottom: "2px" }} key={(story as StoryItem).id}>
                        <P5 key={link.id}>{verb} <strong>{(story as StoryItem).name}</strong></P5>
                        <P5>{story?.id}:<ExternalLink href={(story as StoryItem).url}/></P5>
                    </div>
                )
            })}
        </div>
    );
};

export { Relationships };
