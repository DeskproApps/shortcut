import * as Yup from "yup";
import { storyTypes } from "./types";

export const schema = Yup.object().shape({
  name: Yup.string().min(1).max(512).required(),
  description: Yup.string().min(1).max(100000).required(),
  type: Yup.string().oneOf(storyTypes).required(),
  workflow: Yup.number().notRequired(),
  state: Yup.number().notRequired().when("workflow", {
    is: (workflow) => !!workflow,
    then: Yup.number().required(),
    otherwise: Yup.number().notRequired(),
  }),
  requester: Yup.string().required(),
});
