import type { NextPage } from "next";
import { Fragment } from "react";
import { useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";
import AddTaskForm from "../components/add-task-form";
import { Header, LoginButton, SessionLayout } from "../components/layout";
import { DoDoneTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";
import { usePrefersReducedMotion } from "../utils/window-hooks";

export { getServerSideProps } from "../utils/auth-ssr";

const Home: NextPage = () => {
  return (
    <SessionLayout unauthorized={<LandingPage />} title="Could-Do List">
      <DoDoneTabs />
      <AddTaskForm />
      <TasksTable />
    </SessionLayout>
  );
};

const LandingPage = (): JSX.Element => {
  return (
    <div>
      <Header />
      <main className="w-full p-4 md:p-16 text-xl break-words">
        <IntroAnimation />
        <div className="w-full p-2 md:p-10 flex flex-col gap-6">
          <p>Why do we abandon to-do apps?</p>
          <p>
            To-do apps assume you meet deadlines and maintain a consistent
            schedule. When you don&apos;t, they send a stream of notifications,
            causing anxiety and guilt. If you miss a repeating chore,
            you&apos;ll need to reconfigure the task to stay in sync. It is
            constant work just to manage your work.
          </p>
          <p>
            Most people don&apos;t manage tasks with strict schedules, and your
            to-do list shouldn&apos;t either.
          </p>
          <p />
          <p>
            Introducing <span className="font-mono text-2xl">CouldDo.app</span>,
            a task tracker that understands how people handle tasks.
          </p>
          <p />
          <p>
            <b>Repeating tasks that make sense</b>. Repeating tasks are only
            rescheduled when completed. No fixing missed due dates or worrying
            about duplicate tasks piling up.
          </p>
          <p>
            <b>No notifications</b>. You know you have stuff to do&ndash;you
            don&apos;t need a reminder. Save yourself the stress and anxiety,
            and come back to it on your time.
          </p>
          <p>
            <b>Simple</b>. No complicated menus or configurations.
          </p>
          <p />
          <p>Try it now for free, and take back control of your tasks.</p>
          <p />
          <div className="w-full text-center">
            <LoginButton />
          </div>
        </div>
      </main>
    </div>
  );
};

// Highlight
const Hl = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  return <span className="bg-gray-200">{children}</span>;
};

const introAnimationFrames: [logo: string, tagline: string][] = [
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["ToDoApp", "A task tracker for procrastinators."],
  ["TDoApp", "A task tracker for procrastinators."],
  ["DoApp", "A task tracker for procrastinators."],
  ["DoApp", "A task tracker for procrastinators."],
  ["DoApp", "A task tracker for procrastinators."],
  ["DoApp", "A task tracker for procrastinators."],
  ["CDoApp", "A task tracker for procrastinators."],
  ["CoDoApp", "A task tracker for procrastinators."],
  ["CouDoApp", "A task tracker for procrastinators."],
  ["CoulDoApp", "A task tracker for procrastinators."],
  ["CouldDoApp", "A task tracker for procrastinators."],
  ["CouldDoApp", "A task tracker for procrastinators."],
  ["CouldDoApp", "A task tracker for procrastinators."],
  ["CouldDoApp", "A task tracker for procrastinators."],
  ["CouldDoApp", "A task tracker for procrastinators."],
  ["CouldDo.App", "A task tracker for procrastinators."],
  ["CouldDo.App", "A task tracker for procrastinators."],
  ["CouldDo.App", "A task tracker for procrastinators."],
  ["CouldDo.App", "A task tracker for procrastinators."],
  ["CouldDo.pp", "A task tracker for procrastinators."],
  ["CouldDo.pp", "A task tracker for procrastinators."],
  ["CouldDo.app", "A task tracker for procrastinators."],
  ["CouldDo.app", "A task tracker for procrastinators."],
  ["CouldDo.app", "A task tracker for procrastinators."],
  ["CouldDo.app", "A task tracker for procrastinators."],
  ["CouldDo.app", "A task tracker for [procrastinators]."],
  ["CouldDo.app", "A task tracker for [procrastinators]."],
  ["CouldDo.app", "A task tracker for [procrastinators]."],
  ["CouldDo.app", "A task tracker for [procrastinators]."],
  ["CouldDo.app", "A task tracker for [procrastinators]."],
  ["CouldDo.app", "A task tracker for [procrastinators]."],
  ["CouldDo.app", "A task tracker for ."],
  ["CouldDo.app", "A task tracker for ."],
  ["CouldDo.app", "A task tracker for ."],
  ["CouldDo.app", "A task tracker for ."],
  ["CouldDo.app", "A task tracker for h."],
  ["CouldDo.app", "A task tracker for hu."],
  ["CouldDo.app", "A task tracker for hum."],
  ["CouldDo.app", "A task tracker for huma."],
  ["CouldDo.app", "A task tracker for human."],
  ["CouldDo.app", "A task tracker for humans."],
  ["CouldDo.app", "A task tracker for humans."],
  ["CouldDo.app", "A task tracker for humans."],
  ["CouldDo.app", "A task tracker for humans."],
  ["CouldDo.app", "A task tracker for humans."],
  ["CouldDo.app", "A task tracker for humans."],
  ["CouldDo.app", "A task tracker for humans"],
  ["CouldDo.app", "A task tracker for humans!"],
];

const getIntroAnimationState = (
  frame: number,
): [logo: JSX.Element, tagline: JSX.Element] => {
  const out =
    introAnimationFrames[frame] ??
    introAnimationFrames[introAnimationFrames.length - 1];

  if (!out) throw new Error("introAnimationFrames is empty");

  const [logo, tagline] = out;

  return [
    <>
      {reactStringReplace(logo, /(\.?[aA]pp)/, (match, i) => (
        <Fragment key={i}>
          <wbr />
          {match}
        </Fragment>
      ))}
    </>,
    <>
      {reactStringReplace(tagline, /\[(.*)\]/, (match, i) => (
        <Hl key={i}>{match}</Hl>
      ))}
    </>,
  ];
};

const IntroAnimation = (): JSX.Element => {
  const preferReducedMotion = usePrefersReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const tick = () => {
      // console.log(`animation tick`);

      if (preferReducedMotion) {
        setFrame(introAnimationFrames.length - 1);
        return;
      }

      if (frame >= introAnimationFrames.length - 1) {
        return;
      }

      setFrame(frame + 1);
    };

    const timeout = setTimeout(
      tick,
      preferReducedMotion || frame === 0 ? 0 : 120,
    );

    return () => clearInterval(timeout);
  }, [frame, preferReducedMotion]);

  const [logoText, taglineText] = getIntroAnimationState(frame);
  const [lastLogoText, lastTaglineText] = getIntroAnimationState(
    introAnimationFrames.length - 1,
  );

  return preferReducedMotion || frame === 0 ? (
    <div className="h-24 md:h-48">
      <div className="text-4xl md:text-8xl font-mono">{lastLogoText}</div>
      <div className="text-2xl md:text-6xl text-gray-400">
        {lastTaglineText}
      </div>
    </div>
  ) : (
    <div className="h-24 md:h-48">
      <div className="text-4xl md:text-8xl font-mono">{logoText}</div>
      <div className="text-2xl md:text-6xl text-gray-400">{taglineText}</div>
    </div>
  );
};

export default Home;
