import {
  Button,
  DropdownValueType,
  FormikField,
  HorizontalDivider,
  Input,
  Label,
  LoadingSpinner,
  Stack,
  TextArea,
  TooltipCommonIcon,
  useDeskproAppTheme,
} from "@deskpro/app-sdk";
import { Formik, FormikHelpers } from "formik";
import capitalize from "lodash.capitalize";
import isEmpty from "lodash.isempty";
import orderBy from "lodash.orderby";
import { FC } from "react";
import { IntlProvider } from "react-intl";
import { useStore } from "../../context/StoreProvider/hooks";
import { CustomField } from "../../context/StoreProvider/types";
import { useLoadDataDependencies } from "../../hooks";
import { isStoryType } from "../../utils";
import {
  DropdownMultiSelect,
  DropdownMultiSelectValueType,
} from "../DropdownMultiSelect/DropdownMultiSelect";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { ErrorBlock } from "../Error/ErrorBlock";
import { Label as StorybookLabel } from "../Label/Label";
import "./StoryForm.css";
import {
  ShortcutEpic,
  ShortcutIteration,
  ShortcutLabel,
  ShortcutMember,
  ShortcutProject,
  ShortcutState,
  ShortcutTeam,
  ShortcutWorkflow,
  storyTypes,
} from "./types";
import { schema } from "./validation";

export interface StoryFormProps {
  onSubmit: (
    values: any,
    formikHelpers: FormikHelpers<any>
  ) => void | Promise<any>;
  values?: any;
  loading?: boolean;
  type: "create" | "update";
}

const getNoneOption = () => ({
  key: `-1`,
  label: "None",
  value: "",
  type: "value" as const,
});

export const StoryForm: FC<StoryFormProps> = ({
  onSubmit,
  values,
  type,
  loading = false,
}: StoryFormProps) => {
  const {
    theme: { colors },
  } = useDeskproAppTheme();
  const [state] = useStore();

  useLoadDataDependencies();

  if (!state.dataDependencies) {
    return <LoadingSpinner />;
  }

  const initialValues = values ?? {
    name: "",
    description: "",
    team: "",
    workflow: "",
    state: "",
    project: "",
    epic: "",
    iteration: "",
    type: "",
    requester: "",
    "custom-field-priority": "",
    "custom-field-product-area": "",
    "custom-field-severity": "",
    "custom-field-skill-set": "",
    "custom-field-technical-area": "",
  };

  const teams = orderBy(
    state.dataDependencies.groups ?? [],
    (t) => t.name.toLowerCase(),
    ["asc"]
  );
  const workflows = orderBy(
    state.dataDependencies.workflows ?? [],
    (w) => w.name.toLowerCase(),
    ["asc"]
  );
  const projects = orderBy(
    state.dataDependencies.projects ?? [],
    (p) => p.name.toLowerCase(),
    ["asc"]
  );
  const epics = orderBy(
    state.dataDependencies.epics ?? [],
    (e) => e.name.toLowerCase(),
    ["asc"]
  );
  const iterations = orderBy(
    state.dataDependencies.iterations ?? [],
    (i) => i.name.toLowerCase(),
    ["asc"]
  );
  const members = orderBy(
    state.dataDependencies.members ?? [],
    (m) => m.profile.name.toLowerCase(),
    ["asc"]
  );
  const labels = orderBy(
    state.dataDependencies.labels ?? [],
    (l) => l.name.toLowerCase(),
    ["asc"]
  );

  const currentAgentEmail =
    state?.context?.data.currentAgent.primaryEmail ?? null;

  const currentRequester = values
    ? undefined
    : (members ?? []).filter(
        (m: { profile: { email_address: string } }) =>
          `${m.profile.email_address}`.toLowerCase() ===
          `${currentAgentEmail}`.toLowerCase()
      )[0];

  if (currentRequester) {
    initialValues.requester = currentRequester.id;
  }

  const typeOptions = storyTypes.map((type: string, idx: number) => ({
    key: `${idx}`,
    label: capitalize(type),
    value: type,
    type: "value" as const,
  })) as DropdownValueType<any>[];

  const teamOptions = teams
    .filter((t: ShortcutTeam) => !t.archived)
    .map((team: ShortcutTeam, idx: number) => ({
      key: `${idx}`,
      label: team.name,
      value: team.id,
      type: "value" as const,
    })) as DropdownValueType<any>[];

  const buildWorkflowOptions = (teamId?: string): DropdownValueType<any>[] =>
    workflows
      .map((workflow: ShortcutWorkflow, idx: number) => ({
        key: `${idx}`,
        label: workflow.name,
        value: workflow.id,
        type: "value" as const,
      }))
      .filter((option: { value: string }) => {
        if (!teamId) {
          return true;
        }

        return (
          teams.filter((t: { id: string }) => t.id === teamId)[0]
            .workflow_ids ?? []
        ).includes(option.value);
      });

  const buildStateOptions = (workflowId: string): DropdownValueType<any>[] => {
    const workflow = workflows.filter(
      (w: { id: string }) => w.id === workflowId
    )[0];

    return (workflow.states ?? []).map((state: ShortcutState, idx: number) => ({
      key: `${idx}`,
      label: state.name,
      value: state.id,
      type: "value" as const,
    }));
  };

  const buildProjectOptions = (
    workflowId?: string
  ): DropdownValueType<any>[] => [
    getNoneOption(),
    ...projects
      .filter((p: ShortcutProject) => !p.archived)
      .map((project: ShortcutProject, idx: number) => ({
        key: `${idx}`,
        label: project.name,
        value: project.id,
        type: "value" as const,
      }))
      .filter((option: { value: string }) => {
        if (!workflowId) {
          return true;
        }

        return projects
          .filter((p: ShortcutProject) => p.workflow_id === workflowId)
          .map((p: ShortcutProject) => p.id)
          .includes(option.value);
      }),
  ];

  const buildEpicOptions = (projectId?: string): DropdownValueType<any>[] => [
    getNoneOption(),
    ...epics
      .filter((e: ShortcutEpic) => !e.archived)
      .filter((e: ShortcutEpic) =>
        projectId
          ? (e.project_ids ?? []).includes(projectId)
          : (e.project_ids ?? []).length === 0
      )
      .map((epic: ShortcutEpic, idx: number) => ({
        key: `${idx}`,
        label: epic.name,
        value: epic.id,
        type: "value" as const,
      })),
  ];

  const buildIterationOptions = (): DropdownValueType<any>[] => [
    getNoneOption(),
    ...iterations.map((iteration: ShortcutIteration, idx: number) => ({
      key: `${idx}`,
      label: iteration.name,
      value: iteration.id,
      type: "value" as const,
    })),
  ];

  const buildRequesterOptions = (): DropdownValueType<any>[] =>
    members
      .filter((m: ShortcutMember) => !m.disabled)
      .map((member: ShortcutMember, idx: number) => ({
        key: `${idx}`,
        label: member.profile.name,
        value: member.id,
        type: "value" as const,
      }));

  const buildFollowerOptions = (): DropdownMultiSelectValueType[] =>
    members
      .filter((m: ShortcutMember) => !m.disabled)
      .map((member: ShortcutMember, idx: number) => ({
        key: `${idx}`,
        label: member.profile.name,
        valueLabel: member.profile.name,
        value: member.id,
        type: "value" as const,
      }));

  const buildOwnersOptions = (): DropdownMultiSelectValueType[] =>
    members
      .filter((m: ShortcutMember) => !m.disabled)
      .map((member: ShortcutMember) => ({
        key: `${member.id}`,
        label: member.profile.name,
        valueLabel: member.profile.name,
        value: member.id,
        type: "value" as const,
      }));

  const buildLabelOptions = (): DropdownMultiSelectValueType[] =>
    labels
      .filter((l: ShortcutLabel) => !l.archived)
      .map((label: ShortcutLabel) => ({
        key: `${label.id}`,
        label: (
          <StorybookLabel color={label.color ?? colors.grey20}>
            {label.name}
          </StorybookLabel>
        ),
        valueLabel: label.name,
        color: label.color,
        value: label.id,
        type: "value" as const,
      }));

  const buildCustomFieldOptions = (
    fieldValues: CustomField["values"]
  ): DropdownValueType<any>[] => {
    if (isEmpty(fieldValues)) {
      return [];
    }

    return [
      getNoneOption(),
      ...fieldValues.map(({ id, value }) => ({
        key: id,
        value: id,
        label: value,
        type: "value" as const,
      })),
    ];
  };

  return (
    <IntlProvider locale="en">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={schema}
      >
        {({ values, submitForm, resetForm, errors, submitCount }) => (
          <Stack gap={10} vertical>
            {Object.values(errors).length > 0 && submitCount > 0 && (
              <ErrorBlock text={Object.values(errors) as string | string[]} />
            )}
            <div className="create-form-field">
              <FormikField<string> name="name">
                {([field], { id, error }) => (
                  <Label htmlFor={id} label="Name" error={error} required>
                    <Input
                      id={id}
                      {...field}
                      variant="inline"
                      placeholder="Add value"
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="description">
                {([field], { id, error }) => (
                  <Label
                    htmlFor={id}
                    label={
                      <Stack gap={6} align="center">
                        <span>Description</span>
                        <TooltipCommonIcon content="Please input Markdown or plain text" />
                      </Stack>
                    }
                    error={error}
                  >
                    <TextArea
                      id={id}
                      {...field}
                      variant="inline"
                      placeholder="Add Value"
                      rows={5}
                      className="description-field"
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="team">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Team" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={teamOptions}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="workflow">
                {([field, , helpers], { id, error }) => (
                  <Label required htmlFor={id} label="Workflow" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={buildWorkflowOptions(values.team)}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            {values.workflow && (
              <div className="create-form-field">
                <FormikField<string> name="state">
                  {([field, , helpers], { id, error }) => (
                    <Label required htmlFor={id} label="State" error={error}>
                      <DropdownSelect
                        helpers={helpers}
                        options={buildStateOptions(values.workflow)}
                        id={id}
                        placeholder="Select value"
                        value={field.value}
                      />
                    </Label>
                  )}
                </FormikField>
              </div>
            )}
            <div className="create-form-field">
              <FormikField<string> name="project">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Project" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={buildProjectOptions(values.workflow)}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="epic">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Epic" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={buildEpicOptions(values.project)}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="iteration">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Iteration" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={buildIterationOptions()}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="type">
                {([field, , helpers], { id, error }) => (
                  <Label required htmlFor={id} label="Type" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={typeOptions}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string> name="requester">
                {([field, , helpers], { id, error }) => (
                  <Label required htmlFor={id} label="Requester" error={error}>
                    <DropdownSelect
                      helpers={helpers}
                      options={buildRequesterOptions()}
                      id={id}
                      placeholder="Select value"
                      value={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string[]> name="owners">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Owners" error={error}>
                    <DropdownMultiSelect
                      helpers={helpers}
                      options={buildOwnersOptions()}
                      id={id}
                      placeholder="Select values"
                      values={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string[]> name="followers">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Followers" error={error}>
                    <DropdownMultiSelect
                      helpers={helpers}
                      options={buildFollowerOptions()}
                      id={id}
                      placeholder="Select values"
                      values={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            <div className="create-form-field">
              <FormikField<string[]> name="labels">
                {([field, , helpers], { id, error }) => (
                  <Label htmlFor={id} label="Labels" error={error}>
                    <DropdownMultiSelect
                      helpers={helpers}
                      options={buildLabelOptions()}
                      id={id}
                      placeholder="Select values"
                      values={field.value}
                    />
                  </Label>
                )}
              </FormikField>
            </div>
            {values.type &&
            Array.isArray(state.dataDependencies.customFields) &&
            state.dataDependencies.customFields.length > 0 ? (
              state.dataDependencies.customFields.map(
                (customField: CustomField) => {
                  return customField.enabled &&
                    isStoryType(values.type, customField.story_types) ? (
                    <div
                      className="create-form-field"
                      key={customField.canonical_name}
                    >
                      <FormikField<string>
                        name={`custom-field-${customField.canonical_name}`}
                      >
                        {([field, , helpers], { id, error }) => (
                          <Label
                            htmlFor={id}
                            label={customField.name}
                            error={error}
                          >
                            <DropdownSelect
                              helpers={helpers}
                              options={buildCustomFieldOptions(
                                customField.values
                              )}
                              id={id}
                              placeholder="Select value"
                              value={field.value}
                            />
                          </Label>
                        )}
                      </FormikField>
                    </div>
                  ) : null;
                }
              )
            ) : (
              <></>
            )}

            <HorizontalDivider />
            <div className="create-form-field">
              <Stack justify="space-between">
                <Button
                  text={type === "create" ? "Create" : "Save"}
                  onClick={() => submitForm()}
                  loading={loading}
                  style={{ minWidth: "72px", justifyContent: "center" }}
                />
                {type === "create" && (
                  <Button
                    text="Reset"
                    intent="secondary"
                    onClick={() => resetForm()}
                    style={{ minWidth: "72px", justifyContent: "center" }}
                  />
                )}
              </Stack>
            </div>
          </Stack>
        )}
      </Formik>
    </IntlProvider>
  );
};
