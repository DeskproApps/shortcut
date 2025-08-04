import { IDeskproClient } from "@deskpro/app-sdk"
import { StoryLabel } from "@/context/StoreProvider/types"
import shortcutRequest from "@/api/shortcutRequest"

interface GetLabelsParams {
  apiToken?: string
  isSlim?: boolean
}

export default async function getLabels(client: IDeskproClient, params?: Readonly<GetLabelsParams>) {
  const { apiToken, isSlim = true } = params ?? {}

  return await shortcutRequest<StoryLabel[]>(client,
    {
      endpoint: `labels?slim=${isSlim}`,
      method: "GET",
      apiToken
    })
}