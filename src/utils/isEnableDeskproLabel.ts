import get from "lodash/get";
import { State } from "../context/StoreProvider/types";

const isEnableDeskproLabel = (state: State) => {
    const dontAddLabel = get(state, ["context", "settings", "dont_add_deskpro_label"]);

    return dontAddLabel !== true;
};

export { isEnableDeskproLabel };
