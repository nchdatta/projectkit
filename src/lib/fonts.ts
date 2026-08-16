import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

/**
 * SF Pro Display is not distributed on Google Fonts. Plus Jakarta Sans is
 * the closest geometric, rounded-terminal match and stands in for it.
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
});
