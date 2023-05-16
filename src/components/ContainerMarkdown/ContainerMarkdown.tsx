import styled from "styled-components";
import { P1 } from "@deskpro/deskpro-ui";

export const ContainerMarkdown = styled(P1)`
    width: 100%;
    white-space: pre-line;

    p {
        white-space: pre-wrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 0;
    }

    p:first-child {
        margin-top: 0;
    }

    img {
        width: 100%;
        height: auto;
    }
`;
