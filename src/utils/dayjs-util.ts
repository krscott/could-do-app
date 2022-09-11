import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);

export const fromNow = (date: Date): string => {
  return dayjs(date).fromNow();
};

export const futureDay = (date: Date): string => {
  if (new Date() >= date || dayjs(date).isToday()) {
    return "today";
  }
  return fromNow(date);
};

export const futureGroup = (date: Date): [string, number] => {
  const today = dayjs().startOf("day");
  const d = dayjs(date).startOf("day");

  if (d <= today) return ["today", 0];
  if (d.subtract(1, "day") <= today) return ["tomorrow", 1];
  if (d.subtract(1, "week") <= today) return ["this week", 2];
  if (d.subtract(1, "month") <= today) return ["this month", 3];
  if (d.subtract(1, "year") <= today) return ["this year", 4];

  return ["more than a year out", 5];
};

export const today = (): Date => {
  return dayjs(new Date()).startOf("day").toDate();
};
