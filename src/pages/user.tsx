import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Form, FormInput, FormSubmit } from "../components/form";
import { SessionLayout } from "../components/layout";
import { TextInput } from "../components/text-input";
import myz from "../utils/my-zod";
import { trpc } from "../utils/trpc";
import { parseWrapper } from "../utils/zod-parse-wrapper";

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

          const labels = {
            name: "Name",
          };

          const res = parseWrapper(
            myz.updateUserObject(),
            {
              name: displayName,
            },
            { labels },
          );

          if (!res.isOk) {
            console.log("User input error", res.error.originalError);
            setErrMsg(res.error.message);
            return;
          }

          updateUser.mutate(res.value);

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
