/**
 * Combines multiple CSS class names into a single string.
 * A lightweight alternative to clsx + tailwind-merge to minimize bundle size.
 */
export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}

/**
 * Formats a numeric price into a premium currency string.
 * Example: 55 -> "55 EGP" or "55.00 EGP"
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0 EGP';
  
  // Return formatted price
  return `${num % 1 === 0 ? num : num.toFixed(2)} EGP`;
}

/**
 * Capitalizes a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
