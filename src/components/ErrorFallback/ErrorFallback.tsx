import { isShortcutErrorWithMessage, ShortcutError } from "@/api/shortcutRequest";
import { Stack, H1, H2, Button } from "@deskpro/deskpro-ui";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FallbackRender } from "@sentry/react";

export const ErrorFallback: FallbackRender = ({
  error,
  resetError,
}) => {
  let errorMessage = "An unknown error occurred."

  if (error instanceof ShortcutError && isShortcutErrorWithMessage(error.data)) {
    errorMessage = error.data.message
  } else if (error instanceof Error && error.message.trim() !== "") {
    errorMessage = error.message
  }
  return (
    <Stack vertical gap={10} padding={12} role="alert">
      <H1>Something went wrong:</H1>
      <H2>{errorMessage}</H2>
      <Button
        text="Reload"
        onClick={resetError}
        icon={faRefresh}
        intent="secondary"
      />
    </Stack>
  );
};
