
import { ColorOption } from './types';

export const HUMANE_COLORS: Record<string, string> = {
  pink: '#C51F84',
  purple: '#7C1653',
  dark_purple: '#3B2257',
  yellow: '#FBC619',
  orange: '#D36514',
};

export const COLOR_OPTIONS: ColorOption[] = [
  { name: 'Pink', displayName: 'Rose', hex: HUMANE_COLORS.pink },
  { name: 'Purple', displayName: 'Violet', hex: HUMANE_COLORS.purple },
  { name: 'Dark Purple', displayName: 'Violet Foncé', hex: HUMANE_COLORS.dark_purple },
  { name: 'Yellow', displayName: 'Jaune', hex: HUMANE_COLORS.yellow },
  { name: 'Orange', displayName: 'Orange', hex: HUMANE_COLORS.orange },
];
