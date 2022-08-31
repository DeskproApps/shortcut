import styled from "styled-components";
import {
    TextAreaWithDisplay,
    TextAreaWithDisplayProps,
} from "@deskpro/deskpro-ui";

type Props = TextAreaWithDisplayProps & {
    fontSize?: number,
    minHeight?: number | string | "auto",
};

const TextAreaField = styled(TextAreaWithDisplay)<Props>`
    min-height: ${({ minHeight = 100 }) => typeof minHeight === "number" ? `${minHeight}px` : minHeight};
    font-size: ${({ fontSize = 11 }) => fontSize}px;
    font-family: ${({ theme }) => theme.fonts.primary};
`;

export { TextAreaField };
