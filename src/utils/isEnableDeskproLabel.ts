import { Context } from "@deskpro/app-sdk";
import get from "lodash.get";

const isEnableDeskproLabel = (context: Context) => {
  const dontAddLabel = get(context, ["settings", "dont_add_deskpro_label"]);

  return dontAddLabel !== true;
};

export { isEnableDeskproLabel };
