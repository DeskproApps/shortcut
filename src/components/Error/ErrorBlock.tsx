import { FC } from "react";
import "./ErrorBlock.css";
import { Stack, useDeskproAppTheme } from "@deskpro/app-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { capitalize } from "lodash";

export interface ErrorBlockProps {
  text: string|string[];
}

export const ErrorBlock: FC<ErrorBlockProps> = ({ text }: ErrorBlockProps) => {
  const { theme } = useDeskproAppTheme();

  return (
    <Stack className="error-block" style={{ backgroundColor: theme.colors.red100 }}>
      <FontAwesomeIcon icon={faExclamation} style={{ marginRight: "6px", paddingTop: "2px" }} />
      <div className="error-block-messages">
        {Array.isArray(text) ? text.map((msg, idx) => (
          <div className="error-block-message" key={idx}>{capitalize(msg)}</div>
        )) : text}
      </div>
    </Stack>
  );
};
