import type { ChangeEventHandler, MouseEventHandler } from "react";
import { Icon } from "./icon";

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
    <label>
      <input
        className="hidden"
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span className="rounded-sm border-2 border-zinc-500 focus:outline-none cursor-pointer">
        <Icon>
          <span className={checked ? undefined : "invisible"}>✔</span>
        </Icon>
      </span>
    </label>
  );
};
