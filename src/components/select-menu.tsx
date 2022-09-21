import type { ChangeEventHandler } from "react";

type SelectMenuProps = {
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  children?: React.ReactNode;
};

const SelectMenu = ({
  value,
  placeholder,
  required,
  onChange,
  children,
}: SelectMenuProps): JSX.Element => {
  return (
    <select
      className="w-full p-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none"
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    >
      {children}
    </select>
  );
};

export default SelectMenu;
