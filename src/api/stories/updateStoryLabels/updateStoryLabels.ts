import { IDeskproClient } from "@deskpro/app-sdk"
import { Label, StoryLabel } from "@/context/StoreProvider/types"
import shortcutRequest from "@/api/shortcutRequest"

interface UpdateStoryLabelsParams {
  storyId: number,
  // @todo: Stick with a type.
  newLabels: (StoryLabel | Label)[],
  apiToken?: string
}

export default async function updateStoryLabels(client: IDeskproClient, params: Readonly<UpdateStoryLabelsParams>) {
  const { storyId, newLabels, apiToken } = params
  return await shortcutRequest(client, {
    endpoint: `stories/${storyId}`,
    method: "PUT",
    data: {
      labels: newLabels.map(({ name }) => ({ name }))
    },
    apiToken
  })
}