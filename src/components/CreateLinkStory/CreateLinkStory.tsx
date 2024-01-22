import { FC } from "react";
import "./CreateLinkStory.css";
import { Button, Stack } from "@deskpro/deskpro-ui";
import { useDeskproAppTheme } from "@deskpro/app-sdk";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export interface CreateLinkStoryProps {
  selected: "link" | "create";
}

export const CreateLinkStory: FC<CreateLinkStoryProps> = ({
  selected,
}: CreateLinkStoryProps) => {
  const {
    theme: { colors },
  } = useDeskproAppTheme();
  const navigate = useNavigate();

  return (
    <Stack
      className="create-link"
      justify="space-between"
      align="center"
      style={{ backgroundColor: colors.grey10 }}
    >
      <Button
        text="Find Story"
        intent="secondary"
        icon={faSearch}
        size="large"
        className={`create-link-link ${selected === "create" && "unselected"}`}
        onClick={() => navigate("/link")}
      />
      <Button
        text="Create Story"
        intent="secondary"
        icon={faPlus}
        size="large"
        className={`create-link-create ${selected === "link" && "unselected"}`}
        onClick={() => navigate("/create")}
      />
    </Stack>
  );
};
