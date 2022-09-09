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
