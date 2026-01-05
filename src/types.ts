export type DistStrategy = 'Equally' | 'First Carts Full';
export type InputMode = 'quantities' | 'percentage';

export interface ColorOption {
  key: string;
  label: string;
  bg: string;
  text: string;
  border: string;
  ring: string;
}

export interface MealOption {
  id: string;
  name: string;
  value: string; // Keep as string for input handling
  colorIdx: number;
  count: number; // Calculated integer count
  ratio: number;
}

export interface Cart {
  id: number;
  specialCount: number;
  effectiveCapacity: number;
  normalAssigned: number;
  content: MealOption[];
}

export interface Excess {
  total: number;
  details: MealOption[];
}

export interface DistributionResult {
  carts: Cart[];
  excess: Excess | null;
}