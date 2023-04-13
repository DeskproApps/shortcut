import {
  Button,
  Label,
  Stack,
  useDeskproAppClient,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useFormik } from "formik";
import * as yup from "yup";
import { TextAreaField } from "../components/TextArea/TextArea";
import { createStoryComment } from "../context/StoreProvider/api";
import { useNavigate, useParams } from "react-router-dom";

const validationSchema = yup.object().shape({
  comment: yup.string(),
});

const initValues = {
  comment: "",
};

const AddComment = () => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const { storyId } = useParams();

  const { handleSubmit, isSubmitting, getFieldProps } = useFormik({
    validationSchema,
    initialValues: initValues,
    onSubmit: async (values) => {
      if (!client || !storyId) {
        return;
      }

      await createStoryComment(client, Number(storyId), values.comment)
        .then(() => {
          navigate("/view/" + storyId);
        })
        .catch((error) => {
          throw new Error(`Can't create comment: ${error}`);
        });
    },
  });

  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("home");
    client.deregisterElement("addStory");
    client.deregisterElement("home");
    client.deregisterElement("viewContextMenu");
    client.deregisterElement("edit");
    client.registerElement("home", { type: "home_button" });

    client.setTitle("Add Comment");
  });

  return (
    <form onSubmit={handleSubmit}>
      <Label label="New comment" style={{ marginBottom: "10px" }}>
        <TextAreaField
          minHeight="auto"
          placeholder="Enter comment"
          {...getFieldProps("comment")}
        />
      </Label>

      <Stack justify="space-between">
        <Button
          type="submit"
          text="Save"
          disabled={isSubmitting}
          loading={isSubmitting}
          style={{ minWidth: "72px", justifyContent: "center" }}
        />
        <Button
          text="Cancel"
          intent="tertiary"
          onClick={() => navigate("/view/" + storyId)}
          style={{ minWidth: "72px", justifyContent: "center" }}
        />
      </Stack>
    </form>
  );
};

export { AddComment };
