import type { ChangeEventHandler, MouseEventHandler } from "react";
import SquareSvg from "../../lib/tabler-icons/square.svg";
import SquareCheckSvg from "../../lib/tabler-icons/square-check.svg";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
};

export const Button = ({
  type,
  onClick,
  children,
}: ButtonProps): JSX.Element => {
  return (
    <button
      className="px-4 py-2 rounded-md border-2 border-zinc-800 focus:outline-none"
      type={type ?? "button"}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

type RadioButtonProps = {
  children: React.ReactNode;
  name?: string;
  value?: string;
  checked?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const RadioButton = ({
  children,
  name,
  value,
  checked,
  onChange,
}: RadioButtonProps): JSX.Element => {
  return (
    <label>
      <input
        className="hidden peer"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="px-3 py-2 rounded-full border-2 border-zinc-800 focus:outline-none peer-checked:bg-zinc-700 cursor-pointer">
        {children}
      </span>
    </label>
  );
};

type CheckboxProps = {
  name?: string;
  value?: string;
  checked?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const Checkbox = ({
  name,
  checked,
  onChange,
}: CheckboxProps): JSX.Element => {
  return (
    <label className="cursor-pointer">
      <input
        className="hidden"
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />

      <span className={"grayscale brightness-50 hover:brightness-100"}>
        {checked ? (
          <SquareCheckSvg className="scale-110" />
        ) : (
          <SquareSvg className="scale-110" />
        )}
      </span>
    </label>
  );
};
