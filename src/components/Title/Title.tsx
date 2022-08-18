import { FC } from "react";
import styled from "styled-components";
import { H1, Stack } from "@deskpro/app-sdk";
import { ExternalLink } from "../ExternalLink/ExternalLink";

type Props = {
    name: string,
    url: string,
    onClick?: () => void,
}

const TitleText = styled(H1)`
  color: ${({ theme, onClick }) => !onClick ? "inherit" : theme.colors.cyan100};
  cursor: ${({ onClick }) => !onClick ? "auto" : "pointer"};
  max-width: calc(100vw - 2rem - 6px);
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Title: FC<Props> = ({ name, url, onClick }) => (
    <Stack gap={6}>
        <TitleText {...(!onClick ? {} : { onClick })}>{name}</TitleText>
        <ExternalLink href={url} style={{ position: "relative", top: "-4px" }} />
    </Stack>
);

export { Title };
