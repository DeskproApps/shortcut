import { FC, ReactElement } from "react";
import "./Label.css";

export interface LabelProps {
  children: ReactElement | JSX.Element| string;
  color: string;
  onClick?: () => void;
}

export const Label: FC<LabelProps> = ({ children, color, onClick }: LabelProps) => (
  <span className="sc-label" style={{ borderColor: color }} onClick={onClick}>
      {children}
  </span>
);
