import Link from "next/link";
import type { FormEventHandler } from "react";
import type { UrlObject } from "url";
import { Button } from "./button";

type FormProps = {
  children?: React.ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export const Form = ({ children, onSubmit }: FormProps): JSX.Element => {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {children}
    </form>
  );
};

type FormInputProps = {
  title: string;
  children?: React.ReactNode;
};

export const FormInput = ({ title, children }: FormInputProps): JSX.Element => {
  return (
    <div className="w-full h-11 flex gap-2 items-baseline">
      <span className="w-1/6 my-auto">{title}</span>
      <div className="my-auto flex flex-auto gap-2 items-baseline">
        {children}
      </div>
    </div>
  );
};

type FormSubmitProps = {
  errMsg?: string;
  cancelHref?: string | UrlObject;
};

export const FormSubmit = ({
  errMsg,
  cancelHref,
}: FormSubmitProps): JSX.Element => {
  return (
    <div className="w-full flex flex-row justify-end space-x-4 items-baseline">
      <div className="text-red-400">{errMsg}</div>
      {cancelHref && <Link href={cancelHref}>Cancel</Link>}
      <Button type="submit">Save</Button>
    </div>
  );
};
