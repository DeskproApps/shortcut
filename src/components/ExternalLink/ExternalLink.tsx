import { CSSProperties, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { useDeskproAppTheme } from "@deskpro/app-sdk";
import "./ExternalLink.css";

export interface ExternalLinkProps {
  href: string;
  style?: CSSProperties;
}

export const ExternalLink: FC<ExternalLinkProps> = ({ href, style }: ExternalLinkProps) => {
  const { theme } = useDeskproAppTheme();

  return (
    <a href={href} target="_blank" style={{ color: theme.colors.grey40, ...(style ?? {}) }} className="external-link">
      <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
    </a>
  );
};
