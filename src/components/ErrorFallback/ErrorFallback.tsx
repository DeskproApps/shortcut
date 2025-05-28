import { Stack, H1, H2, Button } from "@deskpro/deskpro-ui";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FallbackRender } from "@sentry/react";

export const ErrorFallback: FallbackRender = ({
  error,
  resetError,
}) => {
  return (
    <Stack vertical gap={10} role="alert">
      <H1>Something went wrong:</H1>
      <H2>{(error as Error|undefined)?.message}</H2>
      <Button
        text="Reload"
        onClick={resetError}
        icon={faRefresh}
        intent="secondary"
      />
    </Stack>
  );
};
