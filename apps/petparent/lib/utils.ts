import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind class merging helper used by React Native Reusables components.
 * Combines clsx (conditional classes) + tailwind-merge (deduplicates clashing
 * Tailwind classes). Standard shadcn / RNR pattern.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
