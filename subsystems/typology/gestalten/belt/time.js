// getTimeDifferenceFromNow
export const hoursBetween = (from, to = new Date()) => {
  const difference = to - new Date(from);
  return parseFloat(difference / 60 / 60 / 1000);
};

// getDateTimeInXHours
export const futureDatetime = (hoursFloat, now = new Date()) => {
  return new Date(now.getTime() + hoursFloat * 60 * 60 * 1000);
};

export const hoursBetweenDates = (fromAt, toAt = new Date()) => {
  return (new Date(toAt) - new Date(fromAt)) / (1000 * 60 * 60);
};

export const since = (from, now = new Date()) => {
  if (!from) return "";
  const milliseconds = now - new Date(from);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "now";
  const minutes = milliseconds / 60000;
  if (minutes < 1) return "now";
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d`;
  const weeks = days / 7;
  if (weeks < 5) return `${Math.floor(weeks)}w`;
  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}mo`;
  return `${Math.floor(days / 365)}y`;
};

export const sameDay = (from, now = new Date()) => {
  const then = new Date(from);
  return (
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  );
};

export const bucket = (from, now = new Date()) => (sameDay(from, now) ? "today" : "earlier");
