import type { ZodError, ZodType, ZodTypeDef } from "zod";
import type { Result } from "./result";
import { err, ok } from "./result";

export type ParseWrapperParams = {
  labels: { [key: string]: string };
};

export type ParseWrapperError<E> = {
  originalError: ZodError<E>;
  message: string;
};

export const parseWrapper = <Output, Def extends ZodTypeDef, Input>(
  zodType: ZodType<Output, Def, Input>,
  obj: unknown,
  { labels }: ParseWrapperParams,
): Result<Output, ParseWrapperError<Input>> => {
  const res = zodType.safeParse(obj, {
    errorMap: (issue, _ctx) => {
      console.log(issue);
      console.log(_ctx);

      const path = issue.path[0];

      if (typeof path !== "string") {
        return { message: _ctx.defaultError };
      }

      const name = labels[path] ?? path;

      let message = _ctx.defaultError;

      if (name !== undefined) {
        if (message.startsWith("String ")) {
          message = message.replace("String ", "");
        }

        message = `${name} ${message}`;
      }

      return { message };
    },
  });

  if (!res.success) {
    let message = "Input error";

    const issue = res.error.issues[0];
    if (issue) {
      message = issue.message;
    }

    return err({ originalError: res.error, message });
  }

  return ok(res.data);
};
