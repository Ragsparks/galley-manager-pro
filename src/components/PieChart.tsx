// PieChart — small SVG pie used for the meal split.

import React from 'react';

export interface PieSlice { value: number; color: string; }

export const PieChart: React.FC<{ slices: PieSlice[]; size?: number }> = ({ slices, size = 100 }) => {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 44, cx = 50, cy = 50;
  const visible = slices.filter(s => s.value > 0);

  if (total <= 0) return null;

  // A single slice is a full circle (an arc can't start and end on the same point).
  if (visible.length === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', flexShrink: 0 }} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill={visible[0].color} />
      </svg>
    );
  }

  let angle = 0;
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', flexShrink: 0 }} aria-hidden>
      {visible.map((s, i) => {
        const sweep = (s.value / total) * 360;
        const a1 = toRad(angle), a2 = toRad(angle + sweep);
        angle += sweep;
        const large = sweep > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)} Z`}
            fill={s.color}
          />
        );
      })}
    </svg>
  );
};
