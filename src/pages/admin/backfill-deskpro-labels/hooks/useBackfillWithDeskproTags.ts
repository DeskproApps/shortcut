import { createLabel, getLabels, getStories, updateStoryLabels } from "@/api";
import { isShortcutErrorWithMessage, ShortcutError } from "@/api/shortcutRequest";
import { StoryItemRes } from "@/context/StoreProvider/types";
import { useDeskproAppClient, useDeskproLatestAppContext } from "@deskpro/app-sdk";
import { useCallback, useState } from "react";

function filterStoriesByExternalLink(stories: StoryItemRes[]): StoryItemRes[] {
  return stories.filter((story) => {
    const instanceHostName = window.location.hostname
    return story.external_links.some(link => link.includes(instanceHostName))
  })
}

interface Feedback {
  type: "feedback" | "error"
  message: string
}

export function useBackfillWithDeskproTags() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { context } = useDeskproLatestAppContext<unknown, { api_key?: string }>()
  const { client } = useDeskproAppClient()

  const apiToken = context?.settings?.api_key
  const backfillStories = useCallback(async () => {
    if (!apiToken || !client) {
      return
    }

    try {
      setFeedback(null)
      setIsLoading(true)
      const labels = await getLabels(client, { apiToken })
      let deskproLabel = labels.find((label) => {
        return label.name.toLowerCase() === "deskpro"
      })

      if (!deskproLabel) {

        const newDeskproLabel = await createLabel(client, {
          name: "Deskpro",
          color: "#4196d4",
          apiToken
        })

        deskproLabel = newDeskproLabel
      }

      const stories = await getStories(client, { isArchived: false, apiToken })


      const storiesWithExternalLink = filterStoriesByExternalLink(stories)

      const storiesToUpdate = storiesWithExternalLink.filter((story) => {
        return !story.label_ids.includes(deskproLabel.id)
      }
      )

      if (storiesToUpdate.length < 1) {
        // No story to update
        setFeedback({
          type: "feedback",
          message: `No story to update.`
        })
        return
      }

      const results = await Promise.allSettled(storiesToUpdate.map((story => {
        return updateStoryLabels(client,
          {
            storyId: story.id,
            newLabels: [...story.labels, deskproLabel],
            apiToken
          })
      })))

      const successfulResults = results.filter(
        (result): result is PromiseFulfilledResult<StoryItemRes> =>
          result.status === "fulfilled" && result.value !== null
      )

      setFeedback({
        type: "feedback",
        message: `Stories Updated: ${successfulResults.length}.`
      })
    } catch (e) {

      if (e instanceof ShortcutError) {
        if (e.statusCode === 401) {
          setFeedback({
            type: "error",
            message: "Invalid API key provided."
          })
          return
        }

        if (isShortcutErrorWithMessage(e.data)) {
          setFeedback({
            type: "error",
            message: `An error occurred: ${e.data.message}`
          })
          return
        }

      }

      if (e instanceof Error && e.message.trim() !== "") {
        setFeedback({
          type: "error",
          message: `An error occurred: ${e.message}`
        })
        return
      }

      setFeedback({
        type: "error",
        message: "An unknown error occurred."
      })
    } finally {
      setIsLoading(false)
    }
  }, [apiToken, client])

  return {
    backfillStories,
    isLoading,
    feedback
  }
}