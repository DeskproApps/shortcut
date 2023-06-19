import { FC } from "react";
import { LoadingSpinner } from "@deskpro/app-sdk";
import { useWhenNoLinkedItems } from "../hooks";

const LoadingAppPage: FC = () => {
  useWhenNoLinkedItems();

  return (
    <LoadingSpinner/>
  );
};

export { LoadingAppPage };
