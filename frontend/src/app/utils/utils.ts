export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const toLocalDateString = (date: Date) => date.toLocaleDateString('en-CA');