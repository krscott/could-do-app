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
    <form onSubmit={onSubmit}>
      <table className="w-full border-separate border-spacing-2">
        <tbody>{children}</tbody>
      </table>
    </form>
  );
};

type FormInputProps = {
  title: string;
  children?: React.ReactNode;
};

export const FormInput = ({ title, children }: FormInputProps): JSX.Element => {
  return (
    <tr className="h-12">
      <td>
        <span className="my-auto">{title}</span>
      </td>
      <td>
        <div className="my-auto flex flex-auto gap-2 items-baseline">
          {children}
        </div>
      </td>
    </tr>
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
    <tr>
      <td colSpan={2}>
        <div className="w-full flex flex-row justify-end space-x-4 items-baseline">
          <div className="text-red-400">{errMsg}</div>
          {cancelHref && <Link href={cancelHref}>Cancel</Link>}
          <Button type="submit">Save</Button>
        </div>
      </td>
    </tr>
  );
};
