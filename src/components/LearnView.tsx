// LearnView — "How it works" page, matching the design image with Newsreader + Public Sans.

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface LearnViewProps {
  mealsPerCart: number;
}

interface AccordionItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: AccordionItem[] = [
  {
    q: 'Load every oven by cart',
    a: 'Always load each oven in cart order. Filling cart 1 fully before moving to cart 2 keeps your oven assignment predictable and speeds up service.',
  },
  {
    q: 'How many ovens?',
    a: 'The number of ovens depends on aircraft type. Long-haul narrow-bodies typically carry 2–4 ovens per galley. Check the galley configuration for your specific aircraft.',
  },
  {
    q: 'What are SPML?',
    a: 'SPML (Special Meals) are pre-ordered dietary options — Kosher, Vegan, Low-fat, etc. They occupy real slots inside the cart, so marking them prevents over-counting regular meals.',
  },
  {
    q: 'What does "excess" mean?',
    a: 'Excess is the quantity that could not fit into any cart because all slots were already filled. Distribute it by hand from the pantry area.',
  },
];

const PIE_COLORS = ['#b5772a', '#6b2f6b', '#3d7a3d'];

function MiniPie() {
  const r = 44;
  const cx = 50;
  const cy = 50;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  function slice(startDeg: number, endDeg: number, color: string) {
    const s = toRad(startDeg - 90);
    const e = toRad(endDeg - 90);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        key={color}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={color}
      />
    );
  }

  return (
    <svg width={100} height={100} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {slice(0, 180, PIE_COLORS[0])}
      {slice(180, 288, PIE_COLORS[1])}
      {slice(288, 360, PIE_COLORS[2])}
    </svg>
  );
}

interface AccordionProps {
  items: AccordionItem[];
}

function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.q}</span>
            <span style={{ color: 'var(--accent)', fontSize: 18, lineHeight: 1 }}>
              {open === i ? <Minus size={16} /> : <Plus size={16} />}
            </span>
          </button>
          {open === i && (
            <div className="accordion-content anim-fadein">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const LearnView: React.FC<LearnViewProps> = ({ mealsPerCart }) => {
  const spmExample = 5;
  const regular = mealsPerCart - spmExample;

  const menuItems = [
    { name: 'Chicken', pct: 50, color: PIE_COLORS[0] },
    { name: 'Beef', pct: 30, color: PIE_COLORS[1] },
    { name: 'Pasta', pct: 20, color: PIE_COLORS[2] },
  ];

  // Exact Hamilton/largest-remainder apportionment so the rounded numbers always sum to `regular`:
  const rawAllocations = menuItems.map(m => {
    const raw = (regular * m.pct) / 100;
    const floor = Math.floor(raw);
    const remainder = raw - floor;
    return { ...m, raw, floor, remainder };
  });

  const sumFloors = rawAllocations.reduce((sum, item) => sum + item.floor, 0);
  let extraNeeded = regular - sumFloors;

  // Priority queue by remainder descending, tie-broken by order index
  const priority = rawAllocations
    .map((item, index) => ({ index, remainder: item.remainder }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  const roundedAllocation = rawAllocations.map(item => item.floor);
  for (const p of priority) {
    if (extraNeeded <= 0) break;
    roundedAllocation[p.index] += 1;
    extraNeeded -= 1;
  }

  return (
    <div className="anim-fadeup px-5 pt-6 pb-6">
      {/* Title */}
      <h1 className="t-title" style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 8 }}>
        How it <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>works</em>
      </h1>

      <p className="t-body" style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 28 }}>
        Fair loads, cart by cart: every option keeps its share of the menu.
      </p>

      {/* ── The menu split ─────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 12, display: 'block' }}>
        THE MENU SPLIT
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
        <MiniPie />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="pie-legend-dot" style={{ background: m.color }} />
              <span className="t-serif" style={{ fontSize: 16, color: 'var(--ink)', minWidth: 65 }}>
                {m.name}
              </span>
              <span className="t-num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                {m.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sep-line" style={{ marginBottom: 24 }} />

      {/* ── Three steps ────────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 16, display: 'block' }}>
        THREE STEPS
      </span>

      {[
        {
          n: 1,
          title: 'Get the split',
          body: 'Ask the catering staff for the percentage of each option, or work it out yourself. It is usually close to 50 / 30 / 20.',
        },
        {
          n: 2,
          title: 'Count the specials',
          body: `Every cart holds ${mealsPerCart} meals. A cart with more special meals has fewer regular slots, so it gets fewer of each option.`,
        },
        {
          n: 3,
          title: 'Share and round',
          body: "Each cart keeps the same percentages, rounded up or down so it still adds up. We never invent meals that don\u2019t exist.",
        },
      ].map(s => (
        <div key={s.n} style={{ display: 'flex', gap: 16, marginBottom: 22 }}>
          {/* Step numbers strictly non-italic in Public Sans */}
          <span
            className="t-num"
            style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, flexShrink: 0 }}
          >
            {s.n}
          </span>
          <div>
            <p className="t-serif" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>
              {s.title}
            </p>
            <p className="t-body" style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
              {s.body}
            </p>
          </div>
        </div>
      ))}

      <div className="sep-line" style={{ marginBottom: 24 }} />

      {/* ── Example table ──────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 12, display: 'block' }}>
        EXAMPLE · A CART WITH <span className="t-num">{spmExample}</span> SPML
      </span>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--sep)' }}>
            <th className="t-label" style={{ textAlign: 'left', paddingBottom: 8, color: 'var(--ink-3)' }}>OPTION</th>
            <th className="t-label" style={{ textAlign: 'left', paddingBottom: 8, color: 'var(--ink-3)' }}>
              <span className="t-num">{regular}</span> × %
            </th>
            <th className="t-label" style={{ textAlign: 'right', paddingBottom: 8, color: 'var(--ink-3)' }}>ROUNDED</th>
          </tr>
        </thead>
        <tbody>
          {rawAllocations.map((item, idx) => {
            const rounded = roundedAllocation[idx];
            return (
              <tr key={item.name} style={{ borderBottom: '1px solid var(--sep)' }}>
                <td style={{ padding: '12px 0', color: 'var(--ink)' }}>
                  <div className="t-serif" style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</div>
                  <div className="t-num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.pct}%</div>
                </td>
                <td className="t-num" style={{ padding: '12px 0', color: 'var(--ink-2)', fontSize: 14 }}>
                  {regular}x{item.pct / 100}={item.raw}
                </td>
                <td className="t-num" style={{ padding: '12px 0', textAlign: 'right', fontSize: 20, fontWeight: 600, color: 'var(--accent)' }}>
                  {rounded}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p
        className="t-serif"
        style={{ fontStyle: 'italic', fontSize: 15, color: 'var(--ink-3)', marginBottom: 28 }}
      >
        <span className="t-num" style={{ fontStyle: 'normal' }}>{regular}</span> regular + <span className="t-num" style={{ fontStyle: 'normal' }}>{spmExample}</span> special = <span className="t-num" style={{ fontStyle: 'normal' }}>{mealsPerCart}</span> meals.
      </p>

      <div className="sep-line" style={{ marginBottom: 24 }} />

      {/* ── Pro tips ───────────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 6, display: 'block' }}>
        PRO TIPS
      </span>
      <p className="t-serif" style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 12, fontStyle: 'italic' }}>
        Tap a tip to open it.
      </p>

      <Accordion items={FAQ_ITEMS} />
    </div>
  );
};
