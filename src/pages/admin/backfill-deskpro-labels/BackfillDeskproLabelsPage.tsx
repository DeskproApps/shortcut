import { Button, P1, Stack } from "@deskpro/deskpro-ui";
import { useBackfillWithDeskproTags } from "./hooks";
import { useDeskproAppTheme } from "@deskpro/app-sdk";

export default function BackfillDeskproLabelsPage(): JSX.Element {

  const { isLoading, feedback, backfillStories } = useBackfillWithDeskproTags()
  const { theme } = useDeskproAppTheme()

  return (
    <Stack vertical gap={12}>
      <P1>Retrospectively add tags</P1>
      <Stack vertical gap={3}>
        <P1 style={{ color: theme.colors.grey80 }}>
          To add the "Deskpro" tag to stories that are already linked, please use the button below.
        </P1>
        <P1 style={{ color: theme.colors.grey80 }}>
          <span style={{ color: theme.colors.red100 }}>Note: </span> Depending on the amount of data, this could take some time.
        </P1>
      </Stack>

      <Button
        intent="secondary"
        text={`Retrospectively Add "Deskpro" Tag`}
        loading={isLoading}
        disabled={isLoading}
        onClick={backfillStories}
      />

      {feedback && (
        <Stack>
          <em>
            <P1 style={{ color: theme.colors[feedback.type === "error" ? "red80" : "brandShade80"] }}>{feedback.message}</P1>
          </em>
        </Stack>
      )}

    </Stack>
  )
}