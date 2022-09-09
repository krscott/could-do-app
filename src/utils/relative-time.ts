import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(relativeTime);
dayjs.extend(isToday);

export const fromNow = (date: Date): string => {
  return dayjs(date).fromNow();
};

export const futureDay = (date: Date): string => {
  if (new Date() >= date || dayjs(date).isToday()) {
    return "today";
  }
  return fromNow(date);
};
