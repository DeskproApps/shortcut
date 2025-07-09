import { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import get from "lodash.get";
import { P1, Stack, Button as ButtonUI, ButtonProps } from "@deskpro/deskpro-ui";
import { useDeskproAppEvents, useDeskproAppClient } from "@deskpro/app-sdk";
import { nbsp } from "@/constants";
import { Invalid } from "@/components/Typography";
import { getCurrentMember } from "@/context/StoreProvider/api";
import type { FC } from "react";
import type { CurrentMember, Settings } from "@/context/StoreProvider/types";

export const Button: FC<ButtonProps> = styled(ButtonUI)`
  min-width: 72px;
  justify-content: center;
`;

export default function VerifySettings() {
  const { client } = useDeskproAppClient();

  const [currentUser, setCurrentUser] = useState<CurrentMember | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const errorMessage = useMemo(() => "Failed to connect to Shortcut, settings seem to be invalid", []);

  const onVerifySettings = useCallback(() => {
    if (!client || !get(settings, ["api_key"])) {
      return;
    }

    setIsLoading(true);
    setError("");
    setCurrentUser(null);

    return getCurrentMember(client, settings)
      .then((member) => setCurrentUser(member))
      .catch(() => setError(errorMessage))
      .finally(() => setIsLoading(false));
  }, [client, settings, errorMessage]);

  useDeskproAppEvents({
    onAdminSettingsChange: setSettings,
  }, [client]);

  return (
    <Stack align="baseline">
      <Button
        text="Verify Settings"
        intent="secondary"
        onClick={onVerifySettings}
        loading={isLoading}
        disabled={!get(settings, ["api_key"]) || isLoading}
      />
      {nbsp}
      {currentUser
        ? <P1>Verified as {currentUser?.name}</P1>
        : <Invalid type="p1">{error}</Invalid>
      }
    </Stack>
  );
};