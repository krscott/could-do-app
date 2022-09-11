import type { ChangeEventHandler } from "react";

type TextInputProps = {
  type?: "text" | "number";
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const TextInput = ({
  type,
  value,
  placeholder,
  required,
  onChange,
}: TextInputProps): JSX.Element => {
  return (
    <input
      className="w-full px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none [appearance:textfield]"
      type={type ?? "text"}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    />
  );
};

export default TextInput;
