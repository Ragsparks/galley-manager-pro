// MealInputView — meal quantities + SPML per cart, notepad / editorial aesthetic.

import React from 'react';
import type { MealOption } from '../types';
import { Plus, Minus, X } from 'lucide-react';

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

  const addOption = () => {
    if (options.length >= 6) return;
    const id = `opt${Date.now()}`;
    setOptions([...options, { id, name: '', value: '', colorIdx: options.length % 4, count: 0, ratio: 0 }]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== idx));
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
      <span className="t-label" style={{ marginBottom: 8, display: 'block' }}>
        MENU ITEMS
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid var(--sep)' }}>
        {options.map((opt, idx) => (
          <div
            key={opt.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0',
              borderBottom: '1px solid var(--sep)',
            }}
          >
            {/* Name input (Newsreader) */}
            <input
              type="text"
              value={opt.name}
              onChange={e => updateOption(idx, 'name', e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="np-input"
              style={{ flex: 1, fontSize: 18 }}
            />

            {/* Count input (Public Sans, strictly non-italic) */}
            <input
              type="number"
              inputMode="numeric"
              value={opt.value}
              placeholder="0"
              onChange={e => handleValueChange(idx, e.target.value)}
              className="t-num"
              style={{
                width: 70, textAlign: 'right', fontSize: 22, fontWeight: 600,
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--sep)',
                color: 'var(--ink)', padding: '4px 0', outline: 'none'
              }}
            />

            {/* Remove button */}
            {options.length > 1 && (
              <button
                onClick={() => removeOption(idx)}
                style={{ color: 'var(--ink-3)', background: 'none', border: 'none', padding: 4, lineHeight: 1, flexShrink: 0 }}
                aria-label="Remove option"
              >
                <X size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add option button in Public Sans */}
      {options.length < 6 && (
        <button
          onClick={addOption}
          className="t-label"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 14,
            color: 'var(--accent)', cursor: 'pointer',
          }}
        >
          <Plus size={14} /> ADD MEAL OPTION
        </button>
      )}

      {/* ── SPML per cart ─────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <span className="t-label" style={{ marginBottom: 8, display: 'block' }}>
          SPECIAL MEALS (SPML) PER CART
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', borderTop: '1px solid var(--sep)' }}>
          {Array.from({ length: numCarts }).map((_, i) => {
            const id = i + 1;
            return (
              <div
                key={id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--sep)',
                }}
              >
                {/* Cart label / name */}
                <input
                  type="text"
                  value={cartNames[id] ?? `Cart ${id}`}
                  onChange={e => setCartNames(prev => ({ ...prev, [id]: e.target.value }))}
                  className="t-label"
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    color: 'var(--ink-2)', width: 60, flexShrink: 0,
                  }}
                />

                {/* Stepper with Public Sans digits */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                      width: 32, textAlign: 'center', background: 'none', border: 'none', outline: 'none',
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
