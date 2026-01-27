import type { Cart, DistributionResult, DistStrategy, MealOption } from '../types';
import { MAX_CAPACITY } from '../constants';

export const calculateDistribution = (
  options: MealOption[],
  cartSpecials: Record<number, number>,
  numCarts: number,
  distStrategy: DistStrategy
): DistributionResult => {
  // 1. Parse Inputs (Strict Integer Only)
  const finalOptions: MealOption[] = options.map(o => {
    const rawVal = parseInt(o.value) || 0;
    return {
      ...o,
      count: Math.max(0, rawVal)
    };
  });

  const totalNormalMeals = finalOptions.reduce((acc, curr) => acc + curr.count, 0);

  // Calculate Ratios for internal distribution (proportion of total meal load)
  // Prevent division by zero
  const ratios = finalOptions.map(o => ({
    ...o,
    ratio: totalNormalMeals > 0 ? o.count / totalNormalMeals : 0
  }));

  // 2. Initialize Carts
  let cartConfig: Cart[] = [];
  for (let i = 1; i <= numCarts; i++) {
    const sCount = cartSpecials[i] || 0;
    // Capacity for normal meals is MAX - specials. 
    // If specials > MAX, effective is 0.
    const effectiveCap = Math.max(0, MAX_CAPACITY - sCount);

    cartConfig.push({
      id: i,
      specialCount: sCount,
      effectiveCapacity: effectiveCap,
      normalAssigned: 0,
      content: finalOptions.map(opt => ({ ...opt, count: 0 }))
    });
  }

  // 3. Distribute Total Counts to Carts using Strategy
  let mealsToDistribute = totalNormalMeals;

  if (distStrategy === 'First Carts Full') {
    let i = 0;
    while (i < cartConfig.length && mealsToDistribute > 0) {
      const cartA = cartConfig[i];
      const cartB = cartConfig[i + 1];

      // Pair Logic (e.g. Cart 1 & 2) if next cart exists
      if (cartB) {
        const totalPairCap = cartA.effectiveCapacity + cartB.effectiveCapacity;

        if (mealsToDistribute >= totalPairCap) {
          // Fill both completely
          cartA.normalAssigned = cartA.effectiveCapacity;
          cartB.normalAssigned = cartB.effectiveCapacity;
          mealsToDistribute -= totalPairCap;
        } else {
          // Split remaining between pair
          const half = Math.floor(mealsToDistribute / 2);
          const remainder = mealsToDistribute % 2;

          // Distribute half to A, rest to B (or vice versa, but keeping it balanced)
          // Ensure we don't exceed individual effective capacities
          const fillA = Math.min(half + remainder, cartA.effectiveCapacity);
          // If A couldn't take all (half+rem), the overflow goes to B? 
          // Actually, 'mealsToDistribute' is total left.
          // Better logic: Try to balance, but respect individual caps.

          cartA.normalAssigned = fillA;
          const remainingForB = mealsToDistribute - fillA;
          cartB.normalAssigned = Math.min(remainingForB, cartB.effectiveCapacity);

          mealsToDistribute = 0; // Distributed all we could to this pair
          // Note: if even B couldn't fit the rest, it remains in mealsToDistribute?
          // The block above sets mealsToDistribute = 0, assuming it fits. 
          // Let's be safer:
          mealsToDistribute -= (cartA.normalAssigned + cartB.normalAssigned);
        }
        i += 2;
      } else {
        // Single last cart
        cartA.normalAssigned = Math.min(mealsToDistribute, cartA.effectiveCapacity);
        mealsToDistribute -= cartA.normalAssigned;
        i++;
      }
    }
  } else {
    // 'Equally' Strategy
    // Calculate base per cart (considering only active carts with capacity > 0?)
    // Simplification: Divide by total carts.
    // Issue: If some carts are full of specials, they shouldn't pull down the average for others?
    // Standard 'Equally' usually implies "Spread as evenly as possible".
    // Let's use a "water filling" approach or simple division with overflow?
    // For simplicity and consistency with previous app:

    // Simple approach: Total / NumCarts
    const baseAmount = Math.floor(totalNormalMeals / numCarts);
    let extraOnes = totalNormalMeals % numCarts;

    cartConfig.forEach(cart => {
      // Each cart gets base + 1 (if extra)
      const targetAssigned = baseAmount + (extraOnes > 0 ? 1 : 0);

      // But limited by effective capacity
      const actualAssigned = Math.min(targetAssigned, cart.effectiveCapacity);

      cart.normalAssigned = actualAssigned;
      mealsToDistribute -= actualAssigned;

      if (extraOnes > 0) extraOnes--;
    });
    // Note: If capacity restricted us, mealsToDistribute will convert to Excess later.
  }

  // 4. Distribute Specific Meal Types within each Cart's 'normalAssigned'
  // We need to track how many of each meal type have been assigned *globally* so we can reconcile later.
  let globalAssignedCounts = finalOptions.map(() => 0);

  cartConfig.forEach(cart => {
    if (cart.normalAssigned === 0) return;

    let cartAssignedSoFar = 0;

    cart.content.forEach((item, idx) => {
      // For the last item in the list, just give it the rest of the assigned space
      // This prevents minor rounding gaps within the cart itself
      if (idx === cart.content.length - 1) {
        item.count = cart.normalAssigned - cartAssignedSoFar;
      } else {
        // Assign based on global ratio
        const proportion = Math.floor(cart.normalAssigned * ratios[idx].ratio);
        item.count = proportion;
      }

      cartAssignedSoFar += item.count;
      globalAssignedCounts[idx] += item.count;
    });
  });

  // 5. Reconcile Global Counts (The "Diff" Loop)
  // Because of Math.floor during the ratio distribution, we might have assigned FEWER of a specific meal type
  // than the user requested, even if carte space exists.
  // We need to push the "unassigned but requested" meals into any available space.

  finalOptions.forEach((opt, idx) => {
    let missing = opt.count - globalAssignedCounts[idx];

    // While we still have missing meals of this type...
    while (missing > 0) {
      // Find a cart that has remaining capacity (Physical Space)
      // AND (Optional but good) matches the strategy flow? 
      // For now, just fill any hole.

      const candidateCart = cartConfig.find(c =>
        (c.normalAssigned + c.specialCount) < MAX_CAPACITY
      );

      if (candidateCart) {
        candidateCart.content[idx].count += 1;
        candidateCart.normalAssigned += 1; // Increment this to keep track of fullness
        globalAssignedCounts[idx] += 1;
        missing--;
      } else {
        // No space left in ANY cart. Stop trying to assign this meal type.
        break;
      }
    }
  });

  // 6. Calculate Excess
  // Any meal requested by user but NOT in globalAssignedCounts is excess.
  const excessTotal = finalOptions.reduce((a, b, idx) => a + (b.count - globalAssignedCounts[idx]), 0);
  const excessDetails = finalOptions
    .map((opt, idx) => ({ ...opt, count: opt.count - globalAssignedCounts[idx] }))
    .filter(x => x.count > 0);

  return {
    carts: cartConfig,
    excess: excessTotal > 0 ? { total: excessTotal, details: excessDetails } : null
  };
};