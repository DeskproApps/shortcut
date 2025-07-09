import { IDeskproClient } from "@deskpro/app-sdk"
import { StoryItemRes } from "@/context/StoreProvider/types"
import shortcutRequest from "@/api/shortcutRequest"

interface GetStoriesParams {
  isArchived: boolean
  apiToken?: string
}

export default async function getStories(client: IDeskproClient, params?: Readonly<GetStoriesParams>): Promise<StoryItemRes[]> {
  const { isArchived = false, apiToken } = params?? {}

  return await shortcutRequest<StoryItemRes[]>(client,
    {
      apiToken,
      endpoint: "stories/search ",
      method: "POST",
      data: {
        archived: isArchived
      }
    })
}