import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main>Loading...</main>;
  }

  const userId = session?.user?.id;

  if (session && !userId) {
    console.error(`invalid session user id: ${userId}`);
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="text-3xl pt-4">Could-Do List</h1>

      <div className="pt-10">
        {session && userId ? (
          <div>
            <p>Hello, {session.user?.name}</p>

            <button onClick={() => signOut()}>Logout</button>

            <div className="pt-6">
              <AddTaskForm ownerId={userId} />
            </div>

            <div className="pt-10">
              <Tasks />
            </div>
          </div>
        ) : (
          <button onClick={() => signIn("discord")}>Login with Discord</button>
        )}
      </div>
    </main>
  );
};

const Tasks = () => {
  const { data: tasks, isLoading } = trpc.useQuery(["task.getAll"]);

  if (isLoading) return <div>Retrieving tasks...</div>;

  return (
    <div className="flex flex-col gap-4">
      {tasks?.map((task, index) => {
        return (
          <div key={index}>
            <p>
              <span className="font-bold">{task.summary} </span>
              <span className="text-sm">
                (created: {task.createdAt.toLocaleDateString()})
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

const AddTaskForm = ({ ownerId }: { ownerId: string }) => {
  const ctx = trpc.useContext();
  const postMessage = trpc.useMutation("task.postTask", {
    onMutate: () => {
      ctx.cancelQuery(["task.getAll"]);

      const optimisticUpdate = ctx.getQueryData(["task.getAll"]);
      if (optimisticUpdate) {
        ctx.setQueryData(["task.getAll"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["task.getAll"]);
    },
  });

  const [summary, setSummary] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        postMessage.mutate({
          summary,
        });

        setSummary("");
      }}
    >
      <input
        className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none"
        type="text"
        value={summary}
        placeholder="Task"
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <button
        type="submit"
        className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
      >
        Add Task
      </button>
    </form>
  );
};

export default Home;
