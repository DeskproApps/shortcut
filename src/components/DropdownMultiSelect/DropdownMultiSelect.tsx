import { FC } from "react";
import {
  DivAsInputWithDisplay,
  Dropdown,
  DropdownTargetProps,
  DropdownValueType, Stack, Icon, useDeskproAppTheme,
  dropdownRenderOptions,
  Infinite
} from "@deskpro/app-sdk";
import { faCaretDown, faTimes, faHandPointer, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FieldHelperProps } from "formik";
import { Label } from "../Label/Label";
import { sortedUniq } from "lodash";

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

export const DropdownMultiSelect: FC<DropdownMultiSelectProps> = ({ helpers, id, placeholder, values, options }: DropdownMultiSelectProps) => {
  const { theme: { colors } } = useDeskproAppTheme();
  const vals = (Array.isArray(values) ? values : []);

  const valLabels = vals.map((v) => {
    const option = options.filter((o) => o.value === v)[0];
    return option.valueLabel
      ? [option.value, option.valueLabel, option.color]
      : [option.value, option.label, option.color]
    ;
  });

  return (
    <Dropdown
      options={options.filter((o) => !vals.includes(o.value))}
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
              dropdownRenderOptions(
                handleSelectOption,
                activeItem,
                activeSubItem,
                setActiveSubItem,
                "Fetch more",
                "Autoscroll",
                  faHandPointer,
                  faExternalLinkAlt,
                hideIcons,
                0
              )
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
                <Label color={color ?? colors.grey20} key={idx} onClick={() => helpers.setValue(vals.filter((v) => v !== val))}>
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
}
