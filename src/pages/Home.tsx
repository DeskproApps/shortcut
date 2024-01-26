import { ChangeEvent, FC, useState } from "react";
import size from "lodash.size";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { H3, Input, Stack, IconButton } from "@deskpro/deskpro-ui";
import { LoadingSpinner, HorizontalDivider } from "@deskpro/app-sdk";
import {
  useSetAppTitle,
  useSetBadgeCount,
  useLinkedStories,
  useRegisterElements,
} from "../hooks";
import { LinkedStoryResultItem } from "../components/LinkedStoryResultItem/LinkedStoryResultItem";

export const Home: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isLoading, stories } = useLinkedStories();

  useSetAppTitle("Shortcut Stories");
  useSetBadgeCount(stories);

  useRegisterElements(({ registerElement }) => {
    registerElement("refresh", { type: "refresh_button" });
    registerElement("addStory", { type: "plus_button" });
  });

  if (isLoading) {
    return (
      <LoadingSpinner/>
    );
  }

  return (
    <>
      <Stack>
        <Input
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          leftIcon={faSearch}
          rightIcon={
            <IconButton
              icon={faTimes}
              onClick={() => setSearchQuery("")}
              minimal
            />
          }
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />

      {size(stories)
        ? stories.map((item, idx) => (
          <LinkedStoryResultItem
            key={idx}
            item={item}
            onView={() => navigate("/view/" + item.id)}
          />
        ))
        : (
          <H3>No linked stories found.</H3>
        )
      }
    </>
  );
};
