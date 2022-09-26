import type {
  ChangeEventHandler,
  DetailedHTMLProps,
  InputHTMLAttributes,
} from "react";
import TextareaAutosize from "react-textarea-autosize";

type TextInputProps = {
  type?: "text" | "number";
  className?: never;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const TextInput = ({ type, ...props }: TextInputProps): JSX.Element => {
  return (
    <input
      className="w-full px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none [appearance:textfield]"
      type={type ?? "text"}
      {...props}
    />
  );
};

type TextAreaInputProps = {
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
};

export const TextAreaInput = ({
  value,
  placeholder,
  required,
  onChange,
}: TextAreaInputProps): JSX.Element => {
  return (
    <TextareaAutosize
      className="w-full px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none [appearance:textfield]"
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    />
  );
};
