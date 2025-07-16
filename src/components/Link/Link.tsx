import { DeskproAppTheme } from "@deskpro/app-sdk";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@deskpro/deskpro-ui";
import styled from "styled-components";
import type { FC } from "react";
import type { IconProps, AnyIcon, ThemeColors } from "@deskpro/deskpro-ui";

export type Props = {
  href?: string,
  color?: keyof ThemeColors,
  size?: IconProps["size"];
};

const Link = styled.a<{ color?: keyof ThemeColors } & DeskproAppTheme>`
  color: ${({ theme, color = "cyan100" }) => theme.colors[color]};
  text-decoration: none;
`;

const LinkIcon: FC<Props> = ({ size = 10, color = "grey40", href, ...props }) => {
  return !href ? <></> : (
    <Link target="_blank" color={color} href={href} {...props}>
      <Icon size={size} icon={faArrowUpRightFromSquare as AnyIcon} />
    </Link>
  )
};

export { Link, LinkIcon };
