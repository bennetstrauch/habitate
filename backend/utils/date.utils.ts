export const localDateOnlyToString = (date: Date) => {
  return date.toLocaleDateString('en-CA');
};


export const getTodaysDateOnlyAsString = () => {
  console.log('getTodaysDateOnlyAsString', localDateOnlyToString(new Date()));
    return localDateOnlyToString(new Date());
    };

export const dateOnlyStringToUTCDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00.000Z');
    }