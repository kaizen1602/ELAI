import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para optimizar búsquedas y filtros en tiempo real
 * @param value - Valor a debounce
 * @param delay - Delay en ms (default: 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}