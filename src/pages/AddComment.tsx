import { Button, Label, Stack } from "@deskpro/deskpro-ui";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useFormik } from "formik";
import * as yup from "yup";
import { TextAreaField } from "../components/TextArea/TextArea";
import { createStoryComment } from "../context/StoreProvider/api";
import { useNavigate, useParams } from "react-router-dom";
import { useSetAppTitle, useRegisterElements } from "../hooks";

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

  useSetAppTitle("Add Comment");

  useRegisterElements(({ registerElement }) => {
    registerElement("refresh", { type: "refresh_button" });
    registerElement("home", { type: "home_button" });
  });

  return (
    <form onSubmit={handleSubmit} style={{ padding: "12px" }}>
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
