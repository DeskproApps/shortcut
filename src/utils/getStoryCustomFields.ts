import { StoryItem, CustomField, CustomFieldValue } from "../context/StoreProvider/types";
import cloneDeep from "lodash/cloneDeep";

const isStoryType = (
    storyType: StoryItem["type"],
    storyTypes: CustomField["story_types"],
): boolean => {
    if (!Array.isArray(storyTypes)) {
        return true;
    }

    return storyTypes.includes(storyType);
}

type NormalizeFieldValues = Record<CustomFieldValue["id"], CustomFieldValue>;

type NormalizeField = Record<
    CustomField["id"],
    Omit<CustomField, "values"> & { values: NormalizeFieldValues }
>;

type StoryCustomField = {
    label: CustomField["name"],
    value: CustomFieldValue["value"],
};

const normalizeFieldValues = (
    acc: NormalizeFieldValues,
    value: CustomFieldValue,
): NormalizeFieldValues => {
    acc[value.id] = value;
    return acc;
};

const normalizeFields = (
    acc: NormalizeField,
    field: CustomField,
): NormalizeField => {
    // @ts-ignore
    acc[field.id] = field;

    if (Array.isArray(field?.values)) {
        acc[field.id]["values"] = field.values.reduce(normalizeFieldValues, {});
    } else {
        acc[field.id]["values"] = {};
    }

    return acc;
};

const getStoryCustomFields = (
    storyType: StoryItem["type"],
    storyCustomFields: StoryItem["customFields"],
    customFields: CustomField[],
): StoryCustomField[] => {
    const fieldsByStoryType = cloneDeep(customFields)
        .filter(({ enabled, story_types }) => enabled && isStoryType(storyType, story_types))
        .reduce(normalizeFields, {});

    return storyCustomFields.reduce<StoryCustomField[]>((acc, { field_id, value_id }) => {
        if (!!fieldsByStoryType[field_id]) {
            acc.push({
                label: fieldsByStoryType[field_id]["name"],
                value: fieldsByStoryType[field_id]["values"][value_id]["value"],
            });
        }
        return acc;
    }, []);
};

export { getStoryCustomFields };
