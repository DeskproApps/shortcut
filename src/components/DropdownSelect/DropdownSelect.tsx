import { FC } from "react";
import {
  DivAsInputWithDisplay,
  Dropdown,
  dropdownRenderOptions,
  DropdownTargetProps,
  DropdownValueType, Infinite
} from "@deskpro/app-sdk";
import { faCaretDown, faTimes, faHandPointer, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FieldHelperProps } from "formik";

export interface DropdownSelectProps {
  helpers: FieldHelperProps<any>;
  options: DropdownValueType<any>[];
  id?: string;
  placeholder?: string;
  value?: any;
}

export const DropdownSelect: FC<DropdownSelectProps> = ({ helpers, id, placeholder, value, options }: DropdownSelectProps) => {
  const selectedValue = options
    .filter((o) => o.value === value)[0]
    ?.label ?? ""
  ;

  return (
    <Dropdown
      options={options}
      onSelectOption={(option) => {
        helpers.setTouched(true);
        helpers.setValue(option.value);
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
          maxHeight={"30vh"}
          anchor={false}
          scrollSideEffect={() => setActiveSubItem(null)}
          fetchMoreText="Fetch more"
          autoscrollText="Autoscroll"
        >
          <div style={{ maxHeight: "30vh" }}>
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
          value={selectedValue}
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
