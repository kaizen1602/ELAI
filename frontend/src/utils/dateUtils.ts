import { format, parseISO, isToday, isThisWeek, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
};

export const calculateAge = (birthDate: string | Date): number => {
  const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
  return differenceInYears(new Date(), dateObj);
};

export const isRecentDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj) || isThisWeek(dateObj);
};

export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(dateObj)) return 'Hoy';
  const days = Math.floor((new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  return formatDate(dateObj);
};

export const getAgeCategory = (age: number): 'menor' | 'adulto' | 'mayor' => {
  if (age < 18) return 'menor';
  if (age >= 65) return 'mayor';
  return 'adulto';
};