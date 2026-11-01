// ResultsSummary — expandable "More info" block on the results page:
// totals per option, rounded percentages (sum to 100), pie, and total SPML.

import React from 'react';
import type { Cart, Excess } from '../types';
import { MEAL_COLORS } from '../constants';
import { PieChart } from './PieChart';

/** Whole-number percentages that always add up to exactly 100 (largest remainder). */
export const roundedPercentages = (counts: number[]): number[] => {
  const total = counts.reduce((s, c) => s + c, 0);
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map(c => (c * 100) / total);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((s, f) => s + f, 0);
  const order = raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (const o of order) {
    if (left <= 0) break;
    floors[o.i] += 1;
    left -= 1;
  }
  return floors;
};

export const ResultsSummary: React.FC<{ carts: Cart[]; excess: Excess | null }> = ({ carts, excess }) => {
  if (carts.length === 0) return null;

  // Entered quantity per option = what went into the carts + what is left over by hand.
  const options = carts[0].content.map((item, idx) => {
    const inCarts = carts.reduce((s, c) => s + c.content[idx].count, 0);
    const inExcess = excess?.details.find(d => d.id === item.id)?.count ?? 0;
    return { id: item.id, name: item.name, total: inCarts + inExcess };
  });

  const pcts = roundedPercentages(options.map(o => o.total));
  const regularTotal = options.reduce((s, o) => s + o.total, 0);
  const spmlTotal = carts.reduce((s, c) => s + c.specialCount, 0);

  const row = (label: string, value: number, strong = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0' }}>
      <span className="t-serif" style={{ fontSize: 16, color: strong ? 'var(--ink)' : 'var(--ink-2)', fontWeight: strong ? 600 : 400 }}>
        {label}
      </span>
      <span className="t-num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ paddingTop: 22 }}>
      <span className="t-label" style={{ display: 'block', marginBottom: 14 }}>MEAL TOTALS</span>

      {/* Pie + per-option totals */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <PieChart size={104} slices={options.map((o, i) => ({ value: o.total, color: MEAL_COLORS[i % MEAL_COLORS.length] }))} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {options.map((o, i) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span className="pie-legend-dot" style={{ background: MEAL_COLORS[i % MEAL_COLORS.length] }} />
              <span className="t-serif" style={{ flex: 1, minWidth: 0, fontSize: 16, color: 'var(--ink)', overflowWrap: 'anywhere' }}>
                {o.name}
              </span>
              <span className="t-num" style={{ fontSize: 17, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{o.total}</span>
              <span className="t-num" style={{ fontSize: 14, color: 'var(--ink-3)', minWidth: 38, textAlign: 'right' }}>{pcts[i]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div>
        {row('Regular meals', regularTotal)}
        {row('Special meals (SPML)', spmlTotal)}
        <div style={{ borderTop: '1px solid var(--sep)', marginTop: 4, paddingTop: 4 }}>
          {row('All meals', regularTotal + spmlTotal, true)}
        </div>
      </div>

      <p className="t-serif" style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-3)', margin: '12px 0 0' }}>
        Percentages are rounded to whole numbers and add up to 100%.
      </p>
    </div>
  );
};
