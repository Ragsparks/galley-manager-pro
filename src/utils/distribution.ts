import type { Cart, DistributionResult, DistStrategy, InputMode, MealOption } from '../types';
import { MAX_CAPACITY } from '../constants';

export const calculateDistribution = (
  options: MealOption[],
  cartSpecials: Record<number, number>,
  numCarts: number,
  distStrategy: DistStrategy,
  inputMode: InputMode,
  totalLoadInput: string
): DistributionResult => {
  let finalOptions: MealOption[] = [];
  let totalNormalMeals = 0;

  // Calculate total active specials first as they are needed for load calculation in percentage mode
  let totalActiveSpecials = 0;
  for (let i = 1; i <= numCarts; i++) {
    totalActiveSpecials += (cartSpecials[i] || 0);
  }

  // 1. Calculate Total Meals based on Mode
  if (inputMode === 'quantities') {
    finalOptions = options.map(o => ({ 
      ...o, 
      count: Math.max(0, parseInt(o.value) || 0) 
    }));
    totalNormalMeals = finalOptions.reduce((acc, curr) => acc + curr.count, 0);
  } else {
    // In percentage mode, the totalLoadInput includes special meals.
    // We must subtract specials to find the pool available for standard meal distribution.
    const rawTotalLoad = Math.max(0, parseInt(totalLoadInput) || 0);
    totalNormalMeals = Math.max(0, rawTotalLoad - totalActiveSpecials);
    
    let distributedCount = 0;
    
    finalOptions = options.map((o, idx) => {
      // If it's the last item, take the remainder to ensure totals match exactly
      if (idx === options.length - 1) {
        return { ...o, count: Math.max(0, totalNormalMeals - distributedCount) };
      }
      const val = Math.floor(totalNormalMeals * ((parseFloat(o.value) || 0) / 100));
      distributedCount += val;
      return { ...o, count: val };
    });
  }

  // Calculate Ratios for distribution
  const ratios = finalOptions.map(o => ({
    ...o,
    ratio: totalNormalMeals > 0 ? o.count / totalNormalMeals : 0
  }));

  // 2. Initialize Carts
  let cartConfig: Cart[] = [];
  for (let i = 1; i <= numCarts; i++) {
    const sCount = cartSpecials[i] || 0;
    cartConfig.push({
      id: i,
      specialCount: sCount,
      effectiveCapacity: Math.max(0, MAX_CAPACITY - sCount),
      normalAssigned: 0,
      content: finalOptions.map(opt => ({ ...opt, count: 0 }))
    });
  }

  // 3. Distribute Total Counts to Carts (High Level)
  let mealsToDistribute = totalNormalMeals;

  if (distStrategy === 'First Carts Full') {
    let i = 0;
    while (i < cartConfig.length && mealsToDistribute > 0) {
      const cartA = cartConfig[i];
      const cartB = cartConfig[i + 1];

      // Logic for Pairs (e.g. Cart 1 & 2)
      if (cartB) {
        const totalPairCap = cartA.effectiveCapacity + cartB.effectiveCapacity;
        
        if (mealsToDistribute >= totalPairCap) {
          // Fill both
          cartA.normalAssigned = cartA.effectiveCapacity;
          cartB.normalAssigned = cartB.effectiveCapacity;
          mealsToDistribute -= totalPairCap;
        } else {
          // Split remaining between pair
          const half = Math.floor(mealsToDistribute / 2);
          const remainder = mealsToDistribute % 2;
          
          cartA.normalAssigned = Math.min(half + remainder, cartA.effectiveCapacity);
          cartB.normalAssigned = Math.min(mealsToDistribute - cartA.normalAssigned, cartB.effectiveCapacity);
          mealsToDistribute = 0;
        }
        i += 2;
      } else {
        // Single cart remaining
        cartA.normalAssigned = Math.min(mealsToDistribute, cartA.effectiveCapacity);
        mealsToDistribute -= cartA.normalAssigned;
        i++;
      }
    }
  } else {
    // Equal Distribution
    // First pass: integer division
    const baseAmount = Math.floor(totalNormalMeals / numCarts);
    let extraOnes = totalNormalMeals % numCarts;

    cartConfig.forEach(cart => {
      const added = baseAmount + (extraOnes > 0 ? 1 : 0);
      const canTake = Math.min(added, cart.effectiveCapacity); // Respect capacity
      cart.normalAssigned = canTake;
      mealsToDistribute -= canTake;
      if (extraOnes > 0) extraOnes--;
    });
  }

  // 4. Distribute Specific Meal Types within Carts
  let globalAssigned = finalOptions.map(() => 0);

  cartConfig.forEach(cart => {
    let cartAssignedSoFar = 0;
    cart.content.forEach((item, idx) => {
      if (idx === cart.content.length - 1) {
        // Last item takes the rest of the cart's assigned capacity
        item.count = cart.normalAssigned - cartAssignedSoFar;
      } else {
        const proportion = Math.floor(cart.normalAssigned * ratios[idx].ratio);
        item.count = proportion;
        cartAssignedSoFar += proportion;
      }
      globalAssigned[idx] += item.count;
    });
  });

  // 5. Reconcile Rounding Errors (The "Diff" Loop)
  // If we under-assigned due to Math.floor, add to available carts
  finalOptions.forEach((opt, idx) => {
    let diff = opt.count - globalAssigned[idx];
    
    while (diff > 0) {
      // Find a cart that has capacity
      const targetCart = [...cartConfig]
        .filter(c => (c.normalAssigned + c.specialCount) < MAX_CAPACITY)
        .sort((a, b) => (a.normalAssigned + a.specialCount) - (b.normalAssigned + b.specialCount))[0];

      if (targetCart) {
        targetCart.content[idx].count += 1;
        targetCart.normalAssigned += 1;
        globalAssigned[idx] += 1;
        diff--;
      } else {
        // Cannot fit anywhere
        break;
      }
    }
  });

  // 6. Calculate Excess
  const excessTotal = finalOptions.reduce((a, b, idx) => a + (b.count - globalAssigned[idx]), 0);
  const excessDetails = finalOptions
    .map((opt, idx) => ({ ...opt, count: Math.max(0, opt.count - globalAssigned[idx]) }))
    .filter(x => x.count > 0);

  return {
    carts: cartConfig,
    excess: excessTotal > 0 ? { total: excessTotal, details: excessDetails } : null
  };
};