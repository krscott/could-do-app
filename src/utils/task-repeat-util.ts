import type { Task } from "@prisma/client";
import { DurationUnit } from "@prisma/client";
import assertNever from "assert-never";
import dayjs from "dayjs";

export const repeatView = (
  repeatAmount: number | null,
  repeatUnit: DurationUnit | null,
) => {
  if (!repeatAmount || !repeatUnit) return "";

  let abbrev: string;

  if (repeatUnit === DurationUnit.DAY) abbrev = "d";
  else if (repeatUnit === DurationUnit.WEEK) abbrev = "w";
  else if (repeatUnit === DurationUnit.MONTH) abbrev = "mo";
  else if (repeatUnit === DurationUnit.YEAR) abbrev = "y";
  else assertNever(repeatUnit);

  return `${repeatAmount} ${abbrev}`;
};

export const durationToDayJsUnit = (
  unit: DurationUnit,
): dayjs.ManipulateType => {
  // Note: Do not use short version ("d", "w", etc). This function is also used in view.
  if (unit === DurationUnit.DAY) return "day";
  if (unit === DurationUnit.WEEK) return "week";
  if (unit === DurationUnit.MONTH) return "month";
  if (unit === DurationUnit.YEAR) return "year";
  assertNever(unit);
};

export const datePlusRepeat = (
  date: Date,
  repeatAmount: number | null,
  repeatUnit: DurationUnit | null,
): Date | null => {
  if (!repeatAmount || !repeatUnit) return null;

  return dayjs(date)
    .add(repeatAmount, durationToDayJsUnit(repeatUnit))
    .toDate();
};

export const isRepeating = (task: Task): boolean => {
  return !!(task.repeatAmount && task.repeatUnit);
};
