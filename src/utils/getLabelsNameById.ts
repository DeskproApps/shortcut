import { StoryLabel } from "../context/StoreProvider/types";

const getLabelsNameById = (
    labelIds: Array<StoryLabel["id"]>,
    labels: StoryLabel[],
): Array<StoryLabel["name"]> => {
    if (!Array.isArray(labelIds)) {
        return [];
    }

    if (!Array.isArray(labels) || labels.length === 0) {
        return [];
    }

    const labelsName: Array<StoryLabel["name"] | undefined> = labelIds?.map((labelId) => {
        const label = labels.find(({ id }) => id === labelId)
        return label?.name;
    }) ?? [];

    return labelsName.filter((labelName) => !!labelName) as Array<StoryLabel["name"]>;
};

export { getLabelsNameById };
