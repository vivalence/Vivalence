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
