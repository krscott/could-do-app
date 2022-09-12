import type { NextPage } from "next";
import { useEffect, useState } from "react";
import AddTaskForm from "../components/add-task-form";
import { Header, LoginButton, SessionLayout } from "../components/layout";
import { DoDoneTabs } from "../components/link-tabs";
import { TasksTable } from "../components/tasks-table";

const Home: NextPage = () => {
  return (
    <SessionLayout unauthorized={<LandingPage />}>
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
      <main className="w-full p-16 text-xl">
        <IntroAnimation />
        <div className="w-full p-10 flex flex-col gap-6">
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
            Introducing <span className="font-mono text-2xl">CouldDoApp</span>,
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

const introAnimationFrames: [
  logo: React.ReactNode,
  tagline: React.ReactNode,
][] = [
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
  ["CouldDoApp", "A task tracker for procrastinators."],
  [
    "CouldDoApp",
    <>
      A task tracker for <Hl>procrastinators</Hl>.
    </>,
  ],
  [
    "CouldDoApp",
    <>
      A task tracker for <Hl>procrastinators</Hl>.
    </>,
  ],
  [
    "CouldDoApp",
    <>
      A task tracker for <Hl>procrastinators</Hl>.
    </>,
  ],
  [
    "CouldDoApp",
    <>
      A task tracker for <Hl>procrastinators</Hl>.
    </>,
  ],
  [
    "CouldDoApp",
    <>
      A task tracker for <Hl>procrastinators</Hl>.
    </>,
  ],
  [
    "CouldDoApp",
    <>
      A task tracker for <Hl>procrastinators</Hl>.
    </>,
  ],
  ["CouldDoApp", "A task tracker for ."],
  ["CouldDoApp", "A task tracker for ."],
  ["CouldDoApp", "A task tracker for ."],
  ["CouldDoApp", "A task tracker for ."],
  ["CouldDoApp", "A task tracker for h."],
  ["CouldDoApp", "A task tracker for hu."],
  ["CouldDoApp", "A task tracker for hum."],
  ["CouldDoApp", "A task tracker for huma."],
  ["CouldDoApp", "A task tracker for human."],
  ["CouldDoApp", "A task tracker for humans."],
  ["CouldDoApp", "A task tracker for humans."],
  ["CouldDoApp", "A task tracker for humans"],
  ["CouldDoApp", "A task tracker for humans!"],
];

// Specify largest string for both elements, independently
// const maxAnimationState = ["CouldDoApp", "A task tracker for procrastinators."];

const getIntroAnimationState = (frame: number) => {
  const out =
    introAnimationFrames[frame] ??
    introAnimationFrames[introAnimationFrames.length - 1];

  if (!out) throw new Error("introAnimationFrames is empty");

  return out;
};

const IntroAnimation = (): JSX.Element => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`animation tick`);

      if (frame >= introAnimationFrames.length) {
        clearInterval(interval);
        return;
      }

      setFrame(frame + 1);
    }, 120);

    return () => clearInterval(interval);
  });

  const [logoText, taglineText] = getIntroAnimationState(frame);

  // Add a hidden copy off to the side to fix the height and prevent the rest
  // of the page from jumping around on narrow screens
  return (
    <div className="h-64 md:h-48">
      <div className="text-8xl font-mono">{logoText}</div>
      <div className="text-6xl text-gray-400">{taglineText}</div>
    </div>
  );
};

// const LogoAndTagline = ({
//   logoText,
//   taglineText,
// }: {
//   logoText: React.ReactNode;
//   taglineText: React.ReactNode;
// }): JSX.Element => {
//   return (
//     <div>
//       <div className="text-8xl font-mono">{logoText}</div>
//       <div className="text-6xl text-gray-400">{taglineText}</div>
//     </div>
//   );
// };

export default Home;
