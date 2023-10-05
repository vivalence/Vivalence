export const getTimeDifferenceFromNow = (dateTime, now = new Date()) => {
    const inputDate = new Date(dateTime);

    // Calculate the difference in milliseconds
    const difference = now - inputDate;

    // Convert difference into hours
    const hoursDifference = difference / 60 / 60 / 1000;
    return parseFloat(hoursDifference);
};

export const getDateTimeInXHours = (hoursFloat) => {
    const now = new Date();
    return new Date(now.getTime() + hoursFloat * 60 * 60 * 1000);
};
