export const getTodayKey = (date = new Date()): string => {
  return date.toISOString().slice(0, 10);
};

export const toIsoString = (value = new Date()): string => value.toISOString();

export const truncateText = (value: string, maxLength = 280): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
};
