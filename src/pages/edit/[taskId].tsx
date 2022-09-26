import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SessionLayout } from "../../components/layout";
import { trpc } from "../../utils/trpc";
import DatePicker from "react-datepicker";
import { Button, Checkbox, RadioButton } from "../../components/button";
import { TextAreaInput, TextInput } from "../../components/text-input";
import { Form, FormInput, FormSubmit } from "../../components/form";
import { DurationUnit } from "@prisma/client";
import { durationToDayJsUnit } from "../../utils/task-repeat-util";
import myz from "../../utils/my-zod";
import { parseWrapper } from "../../utils/zod-parse-wrapper";
import { useUpdateTaskMutation } from "../../server/router/util";
import SelectMenu from "../../components/select-menu";
import { ListSelect } from "../../components/list-select";

export { getServerSideProps } from "../../utils/auth-ssr";

// TODO: Move to a util file
const listViewUrl = (listSlug: string | null, isDone: boolean) => {
  if (listSlug && isDone) {
    return `/list/${listSlug}/done`;
  }
  if (listSlug) {
    return `/list/${listSlug}`;
  }
  if (isDone) {
    return "/done";
  }
  return "/";
};

const EditTask: NextPage = () => {
  const router = useRouter();

  const { taskId } = router.query;

  // Query from DB
  const { data: getTaskData, isLoading } = trpc.useQuery(
    ["task.get", { id: typeof taskId === "string" ? taskId : "" }],

    // Don't reload while user is editing
    { refetchOnWindowFocus: false },
  );

  const { data: lists } = trpc.useQuery(["tasklist.getAll"]);

  const taskInput = getTaskData && getTaskData[0];

  const [list, setList] = useState(taskInput?.list || null);
  const [summary, setSummary] = useState(taskInput?.summary || "");
  const [dueAt, setDueAt] = useState(taskInput?.dueAt || null);
  const [repeatAmount, setRepeatAmount] = useState(
    taskInput?.repeatAmount || null,
  );
  const [repeatUnit, setRepeatUnit] = useState(taskInput?.repeatUnit || null);
  const [done, setDone] = useState(taskInput?.done || false);
  const [description, setDescription] = useState(taskInput?.description || "");

  const [errMsg, setErrMsg] = useState("");

  const updateTask = useUpdateTaskMutation({
    path: "task.updateTask",
    listSlug: list?.slug || null,
    taskId: typeof taskId === "string" ? taskId : undefined,
  });

  useEffect(() => {
    if (!taskInput) return;
    setSummary(taskInput.summary);
    setDueAt(taskInput.dueAt);
    setRepeatAmount(taskInput.repeatAmount);
    setRepeatUnit(taskInput.repeatUnit);
    setDone(taskInput.done);
    setDescription(taskInput.description || "");
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

  const backHref = listViewUrl(list?.slug || null, done);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
        description: description || null,
        listSlug: list?.slug || null,
      },
      { labels },
    );

    if (!res.isOk) {
      console.log("User input error:", res.error.originalError);
      setErrMsg(res.error.message);
      return;
    }

    await updateTask.mutateAsync(res.value);

    // Go back to task list view
    router.push(backHref);
  };

  return (
    <SessionLayout title="Edit Task">
      <Form onSubmit={onSubmit}>
        <FormInput title="List">
          <ListSelect
            listSlug={list?.slug || null}
            onChange={(e) => {
              const changeListSlug = e.target.value;
              const changeList = lists?.find(
                (list) => list.slug === changeListSlug,
              );
              setList(changeList || null);
            }}
          />
        </FormInput>

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

          {/* Show/hide repeat-unit selector based on media query */}
          {/* Must render both or hydration will fail */}
          <div className="hidden sm:block">
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
          </div>
          <div className="sm:hidden">
            <SelectMenu
              value={repeatUnit || ""}
              onChange={(ev) =>
                setRepeatUnit(
                  ev.target.value in DurationUnit
                    ? (ev.target.value as DurationUnit)
                    : null,
                )
              }
            >
              {Object.values(DurationUnit).map((unit) => (
                <option key={unit} value={unit}>
                  {durationToDayJsUnit(unit)}s
                </option>
              ))}
            </SelectMenu>
          </div>
        </FormInput>

        <FormInput title="Done">
          <Checkbox checked={done} onChange={() => setDone(!done)} />
        </FormInput>

        <FormInput title="Description">
          <TextAreaInput
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
        </FormInput>

        <FormSubmit errMsg={errMsg} cancelHref={backHref} />
      </Form>
    </SessionLayout>
  );
};

export default EditTask;
