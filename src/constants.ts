import type { ColorOption, MealOption } from './types';

export const MAX_CAPACITY = 40;

export const COLOR_OPTIONS: ColorOption[] = [
  { key: 'orange', label: '🟠', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-200' },
  { key: 'purple', label: '🟣', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-200' },
  { key: 'green', label: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-200' },
  { key: 'blue', label: '🔵', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-200' }
];

export const INITIAL_OPTIONS: MealOption[] = [
  { id: 'opt1', name: 'Chicken', value: '', colorIdx: 0, count: 0, ratio: 0 },
  { id: 'opt2', name: 'Beef', value: '', colorIdx: 1, count: 0, ratio: 0 },
  { id: 'opt3', name: 'Veggie', value: '', colorIdx: 2, count: 0, ratio: 0 }
];