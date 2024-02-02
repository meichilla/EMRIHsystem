function calculateDaysDifference(dateString: Date): number {
  // Convert the input string to a Date object
  const inputDate = new Date(dateString);

  // Get the current date
  const currentDate = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = inputDate.getTime() - currentDate.getTime();

  // Calculate the number of days
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

export default calculateDaysDifference;
