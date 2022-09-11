import dayjs from "dayjs";

export enum RepeatUnit {
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
}

export const repeatUnits: RepeatUnit[] = [
  RepeatUnit.Day,
  RepeatUnit.Week,
  RepeatUnit.Month,
  RepeatUnit.Year,
];

export const toRepeatUnit = (
  s: string | null | undefined,
): RepeatUnit | null => {
  const ru = repeatUnits[repeatUnits.indexOf(s as RepeatUnit)];

  if (ru) {
    return ru;
  }

  return null;
};

export const repeatView = (
  repeatAmount: number | null,
  repeatUnit: string | null,
) => {
  let u: string | undefined = undefined;

  if (repeatUnit === RepeatUnit.Day) u = "d";
  else if (repeatUnit === RepeatUnit.Week) u = "w";
  else if (repeatUnit === RepeatUnit.Month) u = "mo";
  else if (repeatUnit === RepeatUnit.Year) u = "y";

  if (!repeatAmount || !u) return "";

  return `${repeatAmount} ${u}`;
};

export const datePlusRepeat = (
  date: Date,
  repeatAmount: number | null,
  repeatUnit: string | null,
): Date | null => {
  if (!repeatAmount) return null;

  const u = toRepeatUnit(repeatUnit);
  if (!u) return null;

  return dayjs(date).add(repeatAmount, u).toDate();
};
