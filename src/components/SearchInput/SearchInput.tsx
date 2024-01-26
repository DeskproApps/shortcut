import { FC } from "react";
import {
  faSearch,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, IconButton, InputProps } from "@deskpro/deskpro-ui";

export type Props = {
  value: string;
  disabled?: boolean;
  isFetching?: boolean;
  onClear: () => void;
  onChange: InputProps["onChange"];
};

const SearchInput: FC<Props> = ({
  value,
  onClear,
  onChange,
  disabled = false,
  isFetching = false,
}) => (
  <Input
    id="search"
    name="search"
    value={value}
    disabled={disabled}
    onChange={onChange}
    leftIcon={isFetching ? <FontAwesomeIcon icon={faSpinner} spin /> : faSearch}
    rightIcon={<IconButton icon={faTimes} minimal onClick={onClear} />}
  />
);

export { SearchInput };
