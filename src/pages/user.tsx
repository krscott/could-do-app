import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Form, FormInput, FormSubmit } from "../components/form";
import { SessionLayout } from "../components/layout";
import TextInput from "../components/text-input";
import { trpc } from "../utils/trpc";

const UserSettings: NextPage = () => {
  const { data: session } = useSession();

  const updateUser = trpc.useMutation("user.updateUser");

  const [errMsg, setErrMsg] = useState("");

  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const sessionDisplayName = session?.user?.name;

    if (!sessionDisplayName) return;

    setDisplayName(sessionDisplayName);
  }, [session]);

  return (
    <SessionLayout title="User Settings">
      <Form
        onSubmit={(event) => {
          event.preventDefault();

          const name = displayName.trim();
          if (!name) {
            setErrMsg("'Name' cannot be blank");
            return;
          }

          updateUser.mutate({ name });

          // TODO: Is there a way to reload session without hard-reload?
          // Force a refresh to make sure session is reloaded from server with changes
          window.location.assign("/");
        }}
      >
        <FormInput title="Name">
          <div className="flex-auto">
            <TextInput
              type="text"
              value={displayName}
              placeholder="Task"
              required
              onChange={(ev) => setDisplayName(ev.target.value)}
            />
          </div>
        </FormInput>
        <FormSubmit cancelHref="/" errMsg={errMsg} />
      </Form>
    </SessionLayout>
  );
};

export default UserSettings;
