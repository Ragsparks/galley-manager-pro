import type { Cart, DistributionResult, DistStrategy, MealOption } from '../types';
import { MAX_CAPACITY } from '../constants';

/** Parse an inventory field without silently truncating decimals or accepting junk. */
const parseWholeCount = (value: string, label: string): number => {
  const normalized = value.trim();
  if (normalized === '') return 0;
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${label}: enter a whole number (0 or greater).`);
  }
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${label}: the number is too large.`);
  }
  return parsed;
};

const validateInputs = (
  options: MealOption[],
  _cartSpecials: Record<number, number>,
  numCarts: number,
  distStrategy: DistStrategy
): MealOption[] => {
  if (!Number.isInteger(numCarts) || numCarts < 1 || numCarts > 10) {
    throw new Error('The number of carts must be between 1 and 10.');
  }
  if (distStrategy !== 'Equally' && distStrategy !== 'First Carts Full') {
    throw new Error('Unknown distribution strategy.');
  }

  return options.map((option, index) => {
    const name = option.name.trim() || `Meal option ${index + 1}`;
    const count = parseWholeCount(option.value, name);
    return { ...option, name, count, ratio: 0 };
  });
};

/**
 * Water-fill a set of carts as evenly as possible, never exceeding capacity.
 * Used globally for Equally and in pairs for First Carts Full.
 */
const allocateEvenly = (amount: number, capacities: number[]): number[] => {
  const result = capacities.map(() => 0);
  let remaining = Math.min(amount, capacities.reduce((sum, cap) => sum + cap, 0));
  const active = capacities.map((_, index) => index);

  while (remaining > 0 && active.length > 0) {
    const share = Math.floor(remaining / active.length);
    const step = share > 0 ? share : 1;
    let progressed = false;

    for (let position = 0; position < active.length && remaining > 0;) {
      const index = active[position];
      const room = capacities[index] - result[index];
      if (room <= 0) {
        active.splice(position, 1);
        continue;
      }
      const addition = Math.min(room, step, remaining);
      result[index] += addition;
      remaining -= addition;
      progressed ||= addition > 0;
      if (result[index] >= capacities[index]) active.splice(position, 1);
      else position++;
    }
    if (!progressed) break;
  }
  return result;
};

/**
 * Allocate one cart's target proportionally from the remaining meal types.
 * Hamilton/largest-remainder apportionment preserves exact integer counts and
 * can never assign a meal type more units than were entered.
 */
const allocateMealTypes = (target: number, remainingByType: number[]): number[] => {
  const totalRemaining = remainingByType.reduce((sum, count) => sum + count, 0);
  if (target <= 0 || totalRemaining <= 0) return remainingByType.map(() => 0);
  if (target > totalRemaining) throw new Error('Internal allocation error: target exceeds remaining inventory.');

  const denominator = BigInt(totalRemaining);
  const numerators = remainingByType.map(count => BigInt(target) * BigInt(count));
  const allocations = numerators.map(numerator => Number(numerator / denominator));
  let remainder = target - allocations.reduce((sum, count) => sum + count, 0);
  const priority = remainingByType
    .map((count, index) => ({
      index,
      fractionalNumerator: numerators[index] % denominator,
      available: count - allocations[index]
    }))
    .filter(item => item.available > 0)
    .sort((a, b) => {
      if (a.fractionalNumerator === b.fractionalNumerator) return a.index - b.index;
      return a.fractionalNumerator > b.fractionalNumerator ? -1 : 1;
    });

  for (const item of priority) {
    if (remainder === 0) break;
    allocations[item.index] += 1;
    remainder -= 1;
  }
  if (remainder !== 0) throw new Error('Internal allocation error: could not reconcile meal quantities.');
  return allocations;
};

export const calculateDistribution = (
  options: MealOption[],
  cartSpecials: Record<number, number>,
  numCarts: number,
  distStrategy: DistStrategy,
  maxCapacity: number = MAX_CAPACITY
): DistributionResult => {
  const finalOptions = validateInputs(options, cartSpecials, numCarts, distStrategy);
  const totalNormalMeals = finalOptions.reduce((sum, option) => sum + option.count, 0);
  if (!Number.isSafeInteger(totalNormalMeals)) {
    throw new Error('The combined meal quantity is too large to calculate safely.');
  }

  const carts: Cart[] = Array.from({ length: numCarts }, (_, index) => {
    const id = index + 1;
    const specialCount = cartSpecials[id] ?? 0;
    if (!Number.isSafeInteger(specialCount) || specialCount < 0 || specialCount > maxCapacity) {
      throw new Error(`Cart ${id}: SPML quantity must be between 0 and ${maxCapacity}.`);
    }
    return {
      id,
      specialCount,
      effectiveCapacity: maxCapacity - specialCount,
      normalAssigned: 0,
      content: finalOptions.map(option => ({ ...option, count: 0 }))
    };
  });

  // Determine each cart's normal-meal target before assigning meal types.
  if (distStrategy === 'Equally') {
    const targets = allocateEvenly(totalNormalMeals, carts.map(cart => cart.effectiveCapacity));
    carts.forEach((cart, index) => { cart.normalAssigned = targets[index]; });
  } else if (numCarts > 2 && numCarts % 2 === 0) {
    // For an even fleet larger than two, fill carts in pairs:
    // balance within the current pair, then move to the next pair.
    let remaining = totalNormalMeals;
    for (let index = 0; index < carts.length && remaining > 0; index += 2) {
      const group = carts.slice(index, index + 2);
      const targets = allocateEvenly(remaining, group.map(cart => cart.effectiveCapacity));
      group.forEach((cart, offset) => { cart.normalAssigned = targets[offset]; });
      remaining -= targets.reduce((sum, count) => sum + count, 0);
    }
  } else {
    // For an odd fleet, and for exactly two carts, the pair rule is disabled:
    // fill each cart in order before moving to the next one.
    let remaining = totalNormalMeals;
    carts.forEach(cart => {
      const assigned = Math.min(remaining, cart.effectiveCapacity);
      cart.normalAssigned = assigned;
      remaining -= assigned;
    });
  }

  // Fill each cart's target using only the remaining quantities of each type.
  const remainingByType = finalOptions.map(option => option.count);
  carts.forEach(cart => {
    const allocation = allocateMealTypes(cart.normalAssigned, remainingByType);
    cart.content.forEach((item, index) => {
      item.count = allocation[index];
      remainingByType[index] -= allocation[index];
    });
  });

  // Reconcile every invariant before exposing results to the UI.
  carts.forEach(cart => {
    const contentTotal = cart.content.reduce((sum, item) => sum + item.count, 0);
    if (contentTotal !== cart.normalAssigned) {
      throw new Error(`Internal validation failed: Cart ${cart.id} contents do not match its assigned total.`);
    }
    if (cart.normalAssigned + cart.specialCount > maxCapacity) {
      throw new Error(`Internal validation failed: Cart ${cart.id} exceeds its physical capacity.`);
    }
  });

  finalOptions.forEach((option, index) => {
    const assigned = carts.reduce((sum, cart) => sum + cart.content[index].count, 0);
    if (assigned + remainingByType[index] !== option.count || remainingByType[index] < 0) {
      throw new Error(`Internal validation failed: ${option.name} quantities do not reconcile.`);
    }
  });

  const excessDetails = finalOptions
    .map((option, index) => ({ ...option, count: remainingByType[index] }))
    .filter(option => option.count > 0);
  const excessTotal = excessDetails.reduce((sum, option) => sum + option.count, 0);

  return {
    carts,
    excess: excessTotal > 0 ? { total: excessTotal, details: excessDetails } : null
  };
};
