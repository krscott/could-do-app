import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SessionLayout } from "../../components/layout";
import { trpc } from "../../utils/trpc";
import DatePicker from "react-datepicker";
import { Button, Checkbox, RadioButton } from "../../components/button";
import TextInput from "../../components/text-input";
import { Form, FormInput, FormSubmit } from "../../components/form";
import { DurationUnit } from "@prisma/client";
import { durationToDayJsUnit } from "../../utils/task-repeat-util";
import myz from "../../utils/my-zod";
import { parseWrapper } from "../../utils/zod-parse-wrapper";
import { useUpdateTaskMutation } from "../../server/router/util";

const getGoBackUrl = (isDone: boolean) => {
  return isDone ? "/done" : "/";
};

const EditTask: NextPage = () => {
  const router = useRouter();

  const { taskId } = router.query;

  const updateTask = useUpdateTaskMutation(
    "task.updateTask",
    typeof taskId === "string" ? taskId : undefined,
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
  const [repeatUnit, setRepeatUnit] = useState(taskInput?.repeatUnit || null);
  const [done, setDone] = useState(taskInput?.done || false);

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!taskInput) return;
    setSummary(taskInput.summary);
    setDueAt(taskInput.dueAt);
    setRepeatAmount(taskInput.repeatAmount);
    setRepeatUnit(taskInput.repeatUnit);
    setDone(taskInput.done);
  }, [taskInput]);

  if (!router.isReady || isLoading || !taskInput) {
    return (
      <SessionLayout title="Edit Task">
        <div className="w-full text-center text-gray-500">Loading...</div>
      </SessionLayout>
    );
  }

  if (typeof taskId !== "string") {
    throw new Error(`Invalid taskID: ${taskId}`);
  }

  return (
    <SessionLayout title="Edit Task">
      <Form
        onSubmit={async (event) => {
          event.preventDefault();

          const labels: { [key: string]: string } = {
            summary: "Summary",
            dueAt: "Start",
            repeatAmount: "Repeat Amount",
            repeatUnit: "Repeat Unit",
            done: "Done",
          };

          const res = parseWrapper(
            myz.taskObject(),
            {
              id: taskId,
              summary,
              dueAt,
              repeatAmount: repeatAmount || null,
              repeatUnit,
              done,
            },
            { labels },
          );

          if (!res.isOk) {
            console.log("User input error", res.error.originalError);
            setErrMsg(res.error.message);
            return;
          }

          await updateTask.mutateAsync(res.value);

          // Go back to task list view
          router.push(getGoBackUrl(done));
        }}
      >
        <FormInput title="Summary">
          <div className="flex-auto">
            <TextInput
              type="text"
              value={summary}
              placeholder="Task"
              required
              onChange={(ev) => setSummary(ev.target.value)}
            />
          </div>
        </FormInput>
        <FormInput title="Start">
          <div>
            <DatePicker selected={dueAt} onChange={(date) => setDueAt(date)} />
          </div>
          <Button onClick={() => setDueAt(new Date())}>Today</Button>
        </FormInput>
        <FormInput title="Repeat">
          <div className="w-16">
            <TextInput
              type="number"
              value={repeatAmount || ""}
              onChange={(ev) =>
                setRepeatAmount(Number(ev.target.value.substring(0, 3)))
              }
            />
          </div>
          {Object.values(DurationUnit).map((unit) => (
            <RadioButton
              key={unit}
              name="repeatunit"
              value={unit}
              checked={repeatUnit === unit}
              onChange={() => setRepeatUnit(unit)}
            >
              {durationToDayJsUnit(unit)}s
            </RadioButton>
          ))}
        </FormInput>
        <FormInput title="Done">
          <Checkbox checked={done} onChange={() => setDone(!done)} />
        </FormInput>
        <FormSubmit errMsg={errMsg} cancelHref={getGoBackUrl(done)} />
      </Form>
    </SessionLayout>
  );
};

export default EditTask;
