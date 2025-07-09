import { IDeskproClient } from "@deskpro/app-sdk"
import { StoryLabel } from "@/context/StoreProvider/types"
import shortcutRequest from "@/api/shortcutRequest"

interface CreateLabelParams {
  name: string,
  color: string,
  apiToken?: string
}

export default async function createLabel(client: IDeskproClient, params: Readonly<CreateLabelParams>) {
  const { name, color, apiToken } = params
  return await shortcutRequest<StoryLabel>(client, {
    method: "POST",
    endpoint: "labels",
    data: {
      name,
      color
    },
    apiToken
  })
}