import type { ColorOption, MealOption } from './types';

export const MAX_CAPACITY = 40;

export const COLOR_OPTIONS: ColorOption[] = [
  { key: 'orange', label: '🟠', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-200' },
  { key: 'purple', label: '🟣', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-200' },
  { key: 'green',  label: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-200' },
  { key: 'blue',   label: '🔵', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-200' },
];

// Default operating mode when the app starts or is reset.
export const DEFAULT_DIST_STRATEGY = 'First Carts Full' as const;

export const INITIAL_OPTIONS: MealOption[] = [
  { id: 'opt1', name: 'Chicken', value: '', colorIdx: 0, count: 0, ratio: 0 },
  { id: 'opt2', name: 'Beef',    value: '', colorIdx: 1, count: 0, ratio: 0 },
  { id: 'opt3', name: 'Pasta',   value: '', colorIdx: 2, count: 0, ratio: 0 },
];

// Quick-pick names for carts (door position). Laid out in rows of 6 so
// left/right pairs line up: L3 R3 L4 R4 L5 R5 / L3A R3A L4A R4A L5A R5A.
export const CART_NAME_PRESETS: string[] = [
  'L3', 'R3', 'L4', 'R4', 'L5', 'R5',
  'L3A', 'R3A', 'L4A', 'R4A', 'L5A', 'R5A',
];
