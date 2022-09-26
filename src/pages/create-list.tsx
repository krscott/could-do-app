import cuid from "cuid";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { Form, FormSubmit, FormInput } from "../components/form";
import { SessionLayout } from "../components/layout";
import { TextInput } from "../components/text-input";
import { useCreateTaskListMutation } from "../server/router/util";
import myz from "../utils/my-zod";
import { parseWrapper } from "../utils/zod-parse-wrapper";

export { getServerSideProps } from "../utils/auth-ssr";

const toSlug = (s: string): string | null => {
  const slug = s
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9\-]+/g, "");

  if (!slug) {
    return null;
  }

  return slug;
};

const Done: NextPage = () => {
  const createTaskList = useCreateTaskListMutation();
  const [name, setName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const router = useRouter();

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const labels: { [key: string]: string } = {
      name: "Name",
    };

    const id = cuid();

    const slug = toSlug(name);

    if (!slug) {
      setErrMsg("Name must contain at least one letter");
      return;
    }

    const res = parseWrapper(
      myz.taskListObject(),
      {
        id,
        name,
        slug,
      },
      { labels },
    );

    if (!res.isOk) {
      console.log("User input error", res.error.originalError);
      setErrMsg(res.error.message);
      return;
    }

    await createTaskList.mutateAsync(res.value);

    // Go back to task list view
    router.push(`/list/${slug}`);
  };

  return (
    <SessionLayout title="Create New List">
      <Form onSubmit={onSubmit}>
        <FormInput title="Name">
          <div className="flex-auto">
            <TextInput
              type="text"
              value={name}
              placeholder="New List"
              required
              autoFocus
              onChange={(ev) => setName(ev.target.value)}
            />
          </div>
        </FormInput>
        <FormSubmit cancelHref="/" errMsg={errMsg} />
      </Form>
    </SessionLayout>
  );
};

export default Done;
