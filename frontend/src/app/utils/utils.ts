export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

//## move in date class?
export const toLocalDateString = (date: Date) => date.toLocaleDateString('en-CA');


export function formatDateRangeToDisplay(startDate: string, endDate: string): string {
    const startParts = startDate.split(" "); // ["Mon", "Feb", "10", "2025"]
    const endParts = endDate.split(" "); // ["Sun", "Feb", "16", "2025"]
  
    const startFormatted = `<b>${startParts[0]} ${startParts[1]} ${startParts[2]}</b>`;
    const endFormatted = `<b>${endParts[0]} ${endParts[1]} ${endParts[2]}</b>`;
  
    return `${startFormatted} - ${endFormatted}`;
  }


export function formatDateToDisplayAsWeekMonthDay(date: Date): string {
    return `<b>${date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</b>`;
  }





