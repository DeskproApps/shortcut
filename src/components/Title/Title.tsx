import { FC } from "react";
import styled from "styled-components";
import { H1, Stack } from "@deskpro/deskpro-ui";
import { ExternalLink } from "../ExternalLink/ExternalLink";

type Props = {
  name: string;
  url: string;
  onClick?: () => void;
  width?: "2x" | string;
};

const TitleText = styled(H1)<Pick<Props, "onClick" | "width">>`
  color: ${({ theme, onClick }) =>
    !onClick ? "inherit" : theme.colors.cyan100};
  cursor: ${({ onClick }) => (!onClick ? "auto" : "pointer")};
  max-width: calc(
    100vw - 6px -
      ${({ width }) => (!width ? "2rem" : width === "2x" ? "4rem" : width)}
  );
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Title: FC<Props> = ({ name, url, width, onClick }) => (
  <Stack gap={6}>
    <TitleText
      {...(!onClick ? {} : { onClick })}
      {...(!width ? {} : { width })}
    >
      {name}
    </TitleText>
    <ExternalLink href={url} style={{ position: "relative", top: "-4px" }} />
  </Stack>
);

export { Title };
