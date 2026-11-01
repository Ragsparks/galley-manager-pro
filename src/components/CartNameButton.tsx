// CartNameButton — shows a cart's name and opens a quick-pick sheet
// (L3, R3, L4 …) with a custom-name field as the fallback.

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { CART_NAME_PRESETS } from '../constants';

interface CartNameButtonProps {
  cartId: number;
  /** Explicit name set by the user, or undefined / '' for the default. */
  name: string | undefined;
  /** Names already used by the other carts (these are greyed out). */
  takenNames: string[];
  onChange: (name: string) => void;
  /** 'compact' for the input page, 'large' for the results page. */
  size?: 'compact' | 'large';
}

const norm = (s: string) => s.trim().toUpperCase();

export const CartNameButton: React.FC<CartNameButtonProps> = ({
  cartId, name, takenNames, onChange, size = 'compact',
}) => {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');

  const label = (name && name.trim()) || `Cart ${cartId}`;
  const taken = new Set(takenNames.map(norm));

  const close = () => { setOpen(false); setCustom(''); };
  const pick = (val: string) => { onChange(val); close(); };

  const submitCustom = () => {
    const v = custom.trim();
    if (v) pick(v);
  };

  return (
    <>
      <button
        type="button"
        className={size === 'large' ? 'cart-name-large' : 'cart-name-pill'}
        onClick={() => setOpen(true)}
        aria-label={`Cart ${cartId} name: ${label}. Tap to change`}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', overflowWrap: 'anywhere' }}>{label}</span>
        {/* Hidden from the shared image */}
        <span data-html2canvas-ignore="true" style={{ display: 'flex', opacity: 0.55 }}>
          <ChevronDown size={size === 'large' ? 16 : 12} />
        </span>
      </button>

      {open && createPortal(
        <div className="sheet-overlay anim-fadein" onClick={close}>
          <div
            className="sheet-box anim-fadeup"
            role="dialog"
            aria-label={`Name for cart ${cartId}`}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                Name for cart <span className="t-num">{cartId}</span>
              </h3>
              <button type="button" onClick={close} aria-label="Close" style={{ color: 'var(--ink-3)', padding: 4, display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div className="chip-grid">
              {CART_NAME_PRESETS.map(p => {
                const isCurrent = norm(label) === p;
                const isTaken = !isCurrent && taken.has(p);
                return (
                  <button
                    key={p}
                    type="button"
                    className={`name-chip ${isCurrent ? 'active' : ''}`}
                    disabled={isTaken}
                    onClick={() => pick(p)}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <input
                type="text"
                value={custom}
                maxLength={14}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitCustom(); }}
                placeholder="Other name"
                className="field-name"
                style={{ background: 'var(--bg2)', padding: '12px 14px', fontSize: 17, flex: 1, minWidth: 0 }}
              />
              <button
                type="button"
                className="calc-btn"
                style={{ width: 'auto', padding: '0 20px' }}
                onClick={submitCustom}
                disabled={!custom.trim()}
              >
                SET
              </button>
            </div>

            {(name && name.trim()) && (
              <button
                type="button"
                className="t-label"
                style={{ display: 'block', margin: '16px auto 0', color: 'var(--ink-3)' }}
                onClick={() => pick('')}
              >
                USE DEFAULT (CART {cartId})
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
