// MealInputView — meal quantities + SPML per cart, notepad / editorial aesthetic.

import React from 'react';
import type { MealOption } from '../types';
import { Plus, Minus } from 'lucide-react';
import { CartNameButton } from './CartNameButton';

interface MealInputViewProps {
  numCarts: number;
  options: MealOption[];
  setOptions: (opts: MealOption[]) => void;
  cartSpecials: Record<number, number>;
  setCartSpecials: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  cartNames: Record<number, string>;
  setCartNames: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onBack: () => void;
  onCalculate: () => void;
  calcError: string | null;
}

export const MealInputView: React.FC<MealInputViewProps> = ({
  numCarts,
  options,
  setOptions,
  cartSpecials,
  setCartSpecials,
  cartNames,
  setCartNames,
  onBack,
  onCalculate,
  calcError,
}) => {
  // ── Meal option handlers ─────────────────────────────────
  const updateOption = (idx: number, field: keyof MealOption, value: string | number) => {
    setOptions(options.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const handleValueChange = (idx: number, raw: string) => {
    // Allow only digits
    const cleaned = raw.replace(/[^0-9]/g, '');
    updateOption(idx, 'value', cleaned);
  };

  // ── SPML handlers ────────────────────────────────────────
  const handleSpecialChange = (id: number, raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    const val = cleaned === '' ? 0 : Math.min(parseInt(cleaned, 10), 40);
    setCartSpecials(prev => ({ ...prev, [id]: val }));
  };

  const stepSpecial = (id: number, delta: number) => {
    setCartSpecials(prev => {
      const cur = prev[id] ?? 0;
      const next = Math.max(0, Math.min(40, cur + delta));
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="anim-fadeup px-5 pt-5 pb-6">

      {/* Back button + cart counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="back-btn" onClick={onBack}>
          ← BACK
        </button>
        <span className="t-label" style={{ color: 'var(--ink-3)' }}>
          <span className="t-num">{numCarts}</span> CARTS SELECTED
        </span>
      </div>

      {/* Title */}
      <h2
        className="t-section-h"
        style={{ fontSize: 36, fontStyle: 'italic', marginBottom: 24 }}
      >
        Meal options
      </h2>

      {/* ── Meal options ──────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 6, display: 'block' }}>
        MENU ITEMS
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt, idx) => (
          <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Name input (Newsreader) */}
            <input
              type="text"
              value={opt.name}
              onChange={e => updateOption(idx, 'name', e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="field-name"
              style={{ flex: 1, minWidth: 0 }}
            />

            {/* Count input (Public Sans, strictly non-italic) */}
            <input
              type="number"
              inputMode="numeric"
              value={opt.value}
              placeholder="0"
              onChange={e => handleValueChange(idx, e.target.value)}
              className="field-count"
              aria-label={`${opt.name || `Option ${idx + 1}`} quantity`}
            />
          </div>
        ))}
      </div>

      {/* ── SPML per cart ─────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <span className="t-label" style={{ marginBottom: 8, display: 'block' }}>
          SPECIAL MEALS (SPML) PER CART
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          {Array.from({ length: numCarts }).map((_, i) => {
            const id = i + 1;
            const taken = Array.from({ length: numCarts }, (_, k) => k + 1)
              .filter(other => other !== id)
              .map(other => cartNames[other])
              .filter((n): n is string => !!n);
            return (
              <div
                key={id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, minWidth: 0 }}
              >
                {/* Cart name — tap to pick L3, R3, L4 … */}
                <CartNameButton
                  cartId={id}
                  name={cartNames[id]}
                  takenNames={taken}
                  onChange={val => setCartNames(prev => {
                    const next = { ...prev };
                    if (val.trim()) next[id] = val.trim(); else delete next[id];
                    return next;
                  })}
                />

                {/* Stepper with Public Sans digits */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button className="qty-step-btn" onClick={() => stepSpecial(id, -1)} aria-label="Decrease SPML">
                    <Minus size={13} />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={cartSpecials[id] ?? 0}
                    onChange={e => handleSpecialChange(id, e.target.value)}
                    className="t-num"
                    style={{
                      width: 28, textAlign: 'center', background: 'none', border: 'none', outline: 'none',
                      fontSize: 18, fontWeight: 600, color: 'var(--accent)',
                    }}
                  />
                  <button className="qty-step-btn" onClick={() => stepSpecial(id, +1)} aria-label="Increase SPML">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error display */}
      {calcError && (
        <div className="error-box" style={{ marginTop: 20 }}>
          {calcError}
        </div>
      )}

      {/* Calculate CTA button */}
      <button className="calc-btn" style={{ marginTop: 30 }} onClick={onCalculate}>
        CALCULATE DISTRIBUTION
      </button>
    </div>
  );
};
