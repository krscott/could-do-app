import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SessionLayout } from "../../components/layout";
import { multiMutationOptimisticUpdates } from "../../server/router/util";
import { trpc } from "../../utils/trpc";
import DatePicker from "react-datepicker";
import type { RepeatUnit } from "../../utils/task-repeat-util";
import { repeatUnits, toRepeatUnit } from "../../utils/task-repeat-util";
import { Icon } from "../../components/icon";

const getGoBackUrl = (isDone: boolean) => {
  return isDone ? "/done" : "/";
};

const EditTask: NextPage = () => {
  const router = useRouter();

  const { taskId } = router.query;

  const updateTask = trpc.useMutation(
    "task.updateTask",
    multiMutationOptimisticUpdates([
      "task.getCompleted",
      "task.getUncompleted",
    ]),
  );

  // Query from DB
  const { data: getTaskData, isLoading } = trpc.useQuery([
    "task.get",
    { id: typeof taskId === "string" ? taskId : "" },
  ]);

  const taskInput = getTaskData && getTaskData[0];

  const [summary, setSummary] = useState(taskInput?.summary || "");
  const [dueAt, setDueAt] = useState(taskInput?.dueAt || null);
  const [repeatAmount, setRepeatAmount] = useState(
    taskInput?.repeatAmount || null,
  );
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit | null>(
    toRepeatUnit(taskInput?.repeatUnit),
  );
  const [done, setDone] = useState(taskInput?.done || false);

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!taskInput) return;
    setSummary(taskInput.summary);
    setDueAt(taskInput.dueAt);
    setRepeatAmount(taskInput.repeatAmount);
    setRepeatUnit(toRepeatUnit(taskInput.repeatUnit));
    setDone(taskInput.done);
  }, [taskInput]);

  if (!router.isReady || isLoading || !taskInput) {
    return <div className="w-full text-center text-gray-500">Loading...</div>;
  }

  if (typeof taskId !== "string") {
    throw new Error(`Invalid taskID: ${taskId}`);
  }

  return (
    <SessionLayout title="Edit Task">
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();

          if (!dueAt) {
            setErrMsg("Select due date");
            return;
          }

          updateTask.mutate({
            id: taskId,
            summary,
            dueAt,
            repeatAmount,
            repeatUnit,
            done,
          });

          // Go back to task list view
          router.push(getGoBackUrl(done));
        }}
      >
        <FormInput title="Summary">
          <input
            className="flex-auto px-4 py-2 rounded-md border-2 border-zinc-800
              bg-neutral-900 focus:outline-none"
            type="text"
            value={summary}
            placeholder="Task"
            required
            onChange={(ev) => setSummary(ev.target.value)}
          />
        </FormInput>
        <FormInput title="Due">
          <div>
            <DatePicker selected={dueAt} onChange={(date) => setDueAt(date)} />
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-md border-2 border-zinc-800 focus:outline-none"
            onClick={() => setDueAt(new Date())}
          >
            Today
          </button>
        </FormInput>
        <FormInput title="Repeat">
          <input
            className="w-16 px-4 py-2 rounded-md border-2 border-zinc-800
              bg-neutral-900 focus:outline-none [appearance:textfield]"
            type="number"
            value={repeatAmount || ""}
            onChange={(ev) =>
              setRepeatAmount(Number(ev.target.value.substring(0, 3)))
            }
          />
          {repeatUnits.map((unit) => (
            <label key={unit}>
              <input
                className="hidden peer"
                type="radio"
                name="repeatunit"
                value={repeatUnits[0]}
                checked={repeatUnit === unit}
                onChange={() => setRepeatUnit(unit)}
              />
              <span
                className="px-3 py-2 rounded-full border-2 border-zinc-800
                focus:outline-none peer-checked:bg-zinc-700 cursor-pointer"
              >
                {unit}s
              </span>
            </label>
          ))}
        </FormInput>
        <FormInput title="Done">
          <label>
            <input
              className="hidden"
              type="checkbox"
              name="repeatunit"
              checked={done}
              onChange={() => setDone(!done)}
            />
            <Icon>
              <span
                className="rounded-sm border-2 border-zinc-500
                focus:outline-none cursor-pointer"
              >
                {done ? "✔" : <span className="invisible">🔳</span>}
              </span>
            </Icon>
          </label>
        </FormInput>
        <div className="w-full flex flex-row justify-end space-x-4 p-4 items-baseline">
          <div className="text-red-400">{errMsg}</div>
          <Link href={getGoBackUrl(done)}>Cancel</Link>
          <button
            type="submit"
            className="px-4 py-2 rounded-md border-2 border-zinc-800 focus:outline-none"
          >
            Save
          </button>
        </div>
      </form>
    </SessionLayout>
  );
};

const FormInput = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <label className="w-full h-11 flex gap-2 items-baseline">
      <span className="w-1/6 my-auto">{title}</span>
      <div className="my-auto flex flex-auto gap-2 items-baseline">
        {children}
      </div>
    </label>
  );
};

export default EditTask;
