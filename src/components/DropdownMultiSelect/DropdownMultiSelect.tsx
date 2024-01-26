import {
  DivAsInputWithDisplay,
  Dropdown,
  DropdownTargetProps,
  DropdownValueType,
  Icon,
  Infinite,
  Stack,
  dropdownRenderOptions,
  AnyIcon,
} from "@deskpro/deskpro-ui";
import { useDeskproAppTheme } from "@deskpro/app-sdk";
import {
  faCaretDown,
  faExternalLinkAlt,
  faHandPointer,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FieldHelperProps } from "formik";
import sortedUniq from "lodash.sorteduniq";
import { FC, useState } from "react";
import { Label } from "../Label/Label";

export interface DropdownMultiSelectValueType extends DropdownValueType<any> {
  valueLabel?: string;
  color?: string;
}

export interface DropdownMultiSelectProps {
  helpers: FieldHelperProps<any>;
  options: DropdownMultiSelectValueType[];
  id?: string;
  placeholder?: string;
  values?: any[];
}

export const DropdownMultiSelect: FC<DropdownMultiSelectProps> = ({
  helpers,
  id,
  placeholder,
  values,
  options,
}: DropdownMultiSelectProps) => {
  const {
    theme: { colors },
  } = useDeskproAppTheme();
  const [input, setInput] = useState<string>("");
  const vals = Array.isArray(values) ? values : [];

  const valLabels = vals.map((v) => {
    const option = options.filter((o) => o.value === v)[0];

    if (!option) return [];

    return option.valueLabel
      ? [option.value, option.valueLabel, option.color]
      : [option.value, option.label, option.color];
  });

  const fixedOptions = options.filter((o) => !vals.includes(o.value));

  const filteredOptions = fixedOptions.filter((opt) =>
    (opt.valueLabel as string).toLowerCase().includes(input.toLowerCase())
  );

  return (
    <Dropdown
      showInternalSearch
      inputValue={input}
      onInputChange={setInput}
      options={filteredOptions}
      onSelectOption={(option) => {
        helpers.setTouched(true);
        helpers.setValue(sortedUniq([...vals, option.value]));
      }}
      fetchMoreText="Fetch more"
      autoscrollText="Autoscroll"
      selectedIcon={faHandPointer}
      externalLinkIcon={faExternalLinkAlt}
      optionsRenderer={(
        opts,
        handleSelectOption,
        activeItem,
        activeSubItem,
        setActiveSubItem,
        hideIcons
      ) => (
        <Infinite
          maxHeight={"40vh"}
          anchor={false}
          scrollSideEffect={() => setActiveSubItem(null)}
          fetchMoreText="Fetch more"
          autoscrollText="Autoscroll"
        >
          <div style={{ maxHeight: "40vh" }}>
            {opts.map(
              dropdownRenderOptions({
                handleSelectOption,
                activeItem,
                activeSubItem,
                setActiveSubItem,
                fetchMoreText: "Fetch more",
                autoscrollText: "Autoscroll",
                selectedIcon: faHandPointer as AnyIcon,
                externalLinkIcon: faExternalLinkAlt as AnyIcon,
                hasSelectedItems: false,
                hasExpandableItems: false,
                hideIcons,
                setActiveValueIndex: () => {
                },
                valueOptions: [],
              })
            )}
          </div>
        </Infinite>
      )}
      hideIcons
    >
      {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
        <DivAsInputWithDisplay
          id={id}
          placeholder={placeholder}
          value={
            <Stack align="center" gap={4} wrap="wrap">
              {valLabels.map(([val, label, color], idx: number) => (
                <Label
                  color={color ?? colors.grey20}
                  key={idx}
                  onClick={() =>
                    helpers.setValue(vals.filter((v) => v !== val))
                  }
                >
                  <Stack align="center">
                    <span style={{ marginRight: "4px" }}>{label}</span>
                    <Icon icon={faTimes} />
                  </Stack>
                </Label>
              ))}
            </Stack>
          }
          variant="inline"
          rightIcon={faCaretDown}
          ref={targetRef}
          {...targetProps}
          isVisibleRightIcon
        />
      )}
    </Dropdown>
  );
};
