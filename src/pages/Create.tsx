import { FC, useEffect, useState } from "react";
import { useLoadLinkedStories, useSetAppTitle } from "../hooks";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { CreateLinkStory } from "../components/CreateLinkStory/CreateLinkStory";
import { StoryForm } from "../components/StoryForm/StoryForm";
import { addExternalUrlToStory, createStory } from "../context/StoreProvider/api";
import { CreateStoryData } from "../context/StoreProvider/types";
import { useStore } from "../context/StoreProvider/hooks";

export const Create: FC = () => {
  const { client } = useDeskproAppClient();
  const [ state, dispatch ] = useStore();
  const loadLinkedStories = useLoadLinkedStories();
  const [loading, setLoading] = useState(false);

  useSetAppTitle("Add Story");

  useEffect(() => {
    client?.deregisterElement("addStory");
    client?.registerElement("home", { type: "home_button" });
  }, [client]);

  const onSubmit = (data: CreateStoryData) => {
    if (!client || !state.context?.data.ticket) {
      return;
    }

    setLoading(true);

    createStory(client, data)
      .then((id: number) => {
        client
          .getEntityAssociation("linkedShortcutStories", state.context?.data.ticket.id as string)
          .set(`${id}`)
        ;

        return id;
      })
      .then((id: number) => addExternalUrlToStory(client, `${id}`, state.context?.data.ticket.permalinkUrl as string))
      .then(() => loadLinkedStories())
      .then(() => {
        setLoading(false);
        dispatch({ type: "changePage", page: "home" });
      })
    ;
  };

  return (
    <>
      <CreateLinkStory selected="create" />
      <StoryForm type="create" onSubmit={onSubmit} loading={loading} />
    </>
  );
};
