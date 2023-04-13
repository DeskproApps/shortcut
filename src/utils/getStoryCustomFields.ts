import cloneDeep from "lodash.clonedeep";
import has from "lodash.has";
import {
  StoryItem,
  CustomField,
  CreateStoryData,
  CustomFieldValue,
} from "../context/StoreProvider/types";

type NormalizeFieldValues = Record<CustomFieldValue["id"], CustomFieldValue>;

type NormalizeField = Record<
  CustomField["id"],
  Omit<CustomField, "values"> & { values: NormalizeFieldValues }
>;

type StoryCustomField = {
  label: CustomField["name"];
  value: CustomFieldValue["value"];
};

const isStoryType = (
  storyType: StoryItem["type"],
  storyTypes: CustomField["story_types"]
): boolean => {
  if (!Array.isArray(storyTypes)) {
    return true;
  }

  return storyTypes.includes(storyType);
};

const normalizeFieldValues = (
  acc: NormalizeFieldValues,
  value: CustomFieldValue
): NormalizeFieldValues => {
  acc[value.id] = value;
  return acc;
};

const normalizeFields = (
  acc: NormalizeField,
  field: CustomField
): NormalizeField => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  acc[field.id] = field;

  if (Array.isArray(field?.values)) {
    acc[field.id]["values"] = field.values.reduce(normalizeFieldValues, {});
  } else {
    acc[field.id]["values"] = {};
  }

  return acc;
};

const normalizeCustomFields = (customFields: CustomField[]): NormalizeField => {
  return cloneDeep(customFields).reduce(normalizeFields, {});
};

const getStoryCustomFieldsToShow = (
  storyType: StoryItem["type"],
  storyCustomFields: StoryItem["customFields"],
  customFields: CustomField[]
): StoryCustomField[] => {
  const fieldsByStoryType = cloneDeep(customFields)
    .filter(
      ({ enabled, story_types }) =>
        enabled && isStoryType(storyType, story_types)
    )
    ?.reduce(normalizeFields, {});

  return storyCustomFields?.reduce<StoryCustomField[]>(
    (acc, { field_id, value_id }) => {
      if (fieldsByStoryType[field_id]) {
        acc.push({
          label: fieldsByStoryType[field_id]["name"],
          value: fieldsByStoryType[field_id]["values"][value_id]["value"],
        });
      }
      return acc;
    },
    []
  );
};

const getStoryCustomFieldsToSave = (
  data: CreateStoryData,
  customFields: CustomField[]
): StoryItem["customFields"] => {
  if (!data || !customFields) {
    return [];
  }

  const fields = normalizeCustomFields(cloneDeep(customFields));
  const availableFields = cloneDeep(customFields).filter(
    ({ enabled, story_types }) => enabled && isStoryType(data.type, story_types)
  );

  const selected: StoryItem["customFields"] = [];

  availableFields.forEach(({ canonical_name, id: fieldId }) => {
    const valueId = data[`custom-field-${canonical_name}`];

    if (has(fields, [fieldId, "values", valueId])) {
      selected.push({
        field_id: fieldId,
        value: fields[fieldId]["values"][valueId]["value"],
        value_id: valueId,
      });
    }
  });

  return selected;
};

export {
  isStoryType,
  normalizeCustomFields,
  getStoryCustomFieldsToShow,
  getStoryCustomFieldsToSave,
};
