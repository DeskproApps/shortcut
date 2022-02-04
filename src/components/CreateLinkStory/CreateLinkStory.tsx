import { FC } from "react";
import "./CreateLinkStory.css";
import { Button, Stack, useDeskproAppTheme } from "@deskpro/app-sdk";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useStore } from "../../context/StoreProvider/hooks";

export interface CreateLinkStoryProps {
  selected: "link"|"create";
}

export const CreateLinkStory: FC<CreateLinkStoryProps> = ({ selected }: CreateLinkStoryProps) => {
  const { theme: { colors } } = useDeskproAppTheme();
  const [ , dispatch ] = useStore();

  return (
    <Stack className="create-link" justify="space-between" align="center" style={{ backgroundColor: colors.grey10 }}>
      <Button
        text="Find Story"
        intent="secondary"
        icon={faSearch}
        size="large"
        className={`create-link-link ${selected === "create" && "unselected"}`}
        onClick={() => dispatch({ type: "changePage", page: "link" })}
      />
      <Button
        text="Create Story"
        intent="secondary"
        icon={faPlus}
        size="large"
        className={`create-link-create ${selected === "link" && "unselected"}`}
        onClick={() => dispatch({ type: "changePage", page: "create" })}
      />
    </Stack>
  );
};
