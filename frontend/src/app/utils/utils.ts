import moment from 'moment';

export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const toLocalDateString = (date: Date) => date.toLocaleDateString('en-CA');


// .##should take in startDate: Date, endDate: Date
// #then change in statsService and then in progress Controller
// then implement reflectionStats, and then change progressStats
export function formatDateRangeToDisplay(startDate: Date, endDate: Date): string {
   
  // ##
  const startParts = startDate.toDateString().split(" "); // ["Mon", "Feb", "10", "2025"]
  const endParts = endDate.toDateString().split(" ");
  
    const startFormatted = `<b>${startParts[0]} ${startParts[1]} ${startParts[2]}</b>`;
    const endFormatted = `<b>${endParts[0]} ${endParts[1]} ${endParts[2]}</b>`;
  
    return `${startFormatted} - ${endFormatted}`;
  }


export function formatDateToDisplayAsWeekMonthDay(date: Date): string {
    return `<b>${date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</b>`;
  }


export const calculateStartAndEndDate = (
  period: "week" | "month",
  offset: number,
) => {
  let startDate: Date;
  let endDate: Date;


  const startMoment = moment.utc().add(offset, period);

  const periodForMoment: "isoWeek" | "month" =
    period === "week" ? "isoWeek" : period;

  startDate = startMoment.startOf(periodForMoment).toDate(); // isoWeek starts on Monday
  endDate = startMoment.endOf(periodForMoment).endOf("day").toDate();

  return { startDate, endDate };
};





export function getRandomPhrase(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}
