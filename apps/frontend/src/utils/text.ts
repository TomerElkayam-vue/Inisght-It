export const nameToDisplay = (name: string, maxLength: number = 18): string => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 1) + '…';
};
