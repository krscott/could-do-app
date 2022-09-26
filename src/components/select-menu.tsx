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
    <div className="rounded-md border-2 border-zinc-800">
      <select
        // border-* styles used to move dropdown arrow inward
        className="w-full p-2 bg-neutral-900 border-r-8 border-neutral-900 focus:outline-none"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      >
        {children}
      </select>
    </div>
  );
};

export default SelectMenu;
