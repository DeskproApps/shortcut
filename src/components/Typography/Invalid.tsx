import styled from "styled-components";
import { TSpan } from "@deskpro/deskpro-ui";
import type { TProps } from "@deskpro/deskpro-ui";
import type { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<Omit<TProps, "type">> & {
  type?: TProps["type"],
};

const InvalidStyled = styled(TSpan)`
  color: ${({ theme }) => theme.colors.red100};
`;

const Invalid: FC<Props> = ({ type = "p5", ...props }) => (
  <InvalidStyled type={type} {...props} />
);

export { Invalid };
