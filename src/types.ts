export type DistStrategy = 'Equally' | 'First Carts Full';

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
  value: string; // Input value (always integer quantity now)
  colorIdx: number;
  count: number; // Parsed integer count
  ratio: number; // Internal distribution ratio
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