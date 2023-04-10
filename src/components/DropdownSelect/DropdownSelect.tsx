import { FC, useState } from "react";
import {
  DivAsInputWithDisplay,
  Dropdown,
  dropdownRenderOptions,
  DropdownTargetProps,
  DropdownValueType,
  Infinite,
} from "@deskpro/app-sdk";
import {
  faCaretDown,
  faHandPointer,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FieldHelperProps } from "formik";

export interface DropdownSelectProps {
  helpers: FieldHelperProps<any>;
  options: DropdownValueType<any>[];
  id?: string;
  placeholder?: string;
  value?: any;
  disabled?: boolean;
  showInternalSearch?: boolean;
}

export const DropdownSelect: FC<DropdownSelectProps> = ({
  helpers,
  id,
  placeholder,
  value,
  options,
  showInternalSearch = true,
  ...props
}: DropdownSelectProps) => {
  const [input, setInput] = useState<string>("");

  const selectedValue =
    options.filter((o) => o.value === value)[0]?.label ?? "";
  const filteredOptions = options.filter((opt) =>
    (opt.label as string).toLowerCase().includes(input.toLowerCase())
  );

  return (
    <Dropdown
      {...props}
      showInternalSearch={showInternalSearch}
      options={filteredOptions}
      inputValue={input}
      onInputChange={setInput}
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
