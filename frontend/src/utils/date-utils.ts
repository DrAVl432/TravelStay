export const toISODateInput = (date: string | Date): string => {
  if (!date) return '';
  const _date = new Date(date);
  return _date.toISOString().split('T')[0]; // Год-месяц-день
};