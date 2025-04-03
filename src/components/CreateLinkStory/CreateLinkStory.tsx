import { FC } from "react";
import { TwoButtonGroup } from "@deskpro/app-sdk";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export interface CreateLinkStoryProps {
  selected: "link" | "create";
}

export const CreateLinkStory: FC<CreateLinkStoryProps> = ({
  selected,
}: CreateLinkStoryProps) => {
  const navigate = useNavigate();


  return (
    <TwoButtonGroup
      selected={selected === "link" ? "one" : "two"}
      oneLabel="Find Story"
      twoLabel="Create Story"
      oneIcon={faSearch}
      twoIcon={faPlus}
      oneOnClick={() => navigate("/link")}
      twoOnClick={() => navigate("/create")}
    />
  )
};
