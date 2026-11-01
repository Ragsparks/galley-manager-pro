// ShareCard — a static, text-only copy of the service plan that is captured for sharing.
// It is rendered off-screen at a fixed width and deliberately avoids anything that
// html2canvas clips: no inputs, no overflow:hidden, no ellipsis, wrapping allowed everywhere.

import React from 'react';
import type { Cart, Excess } from '../types';

interface ShareCardProps {
  carts: Cart[];
  excess: Excess | null;
  cartNames: Record<number, string>;
  cartRows: Record<number, string>;
  dateLabel: string;
}

export const SHARE_CARD_WIDTH = 390;

export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ carts, excess, cartNames, cartRows, dateLabel }, ref) => (
    <div
      ref={ref}
      style={{
        width: SHARE_CARD_WIDTH,
        padding: 20,
        background: 'var(--bg)',
        color: 'var(--ink)',
        boxSizing: 'border-box',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <span className="t-section-h" style={{ fontSize: 34, fontStyle: 'italic', lineHeight: 1.2 }}>
          Service plan
        </span>
        <span className="t-label" style={{ color: 'var(--ink-2)', whiteSpace: 'nowrap', paddingBottom: 2 }}>
          {dateLabel}
        </span>
      </div>

      {/* Cart grid */}
      <div className="cart-grid">
        {carts.map(cart => {
          const name = (cartNames[cart.id] || '').trim() || `Cart ${cart.id}`;
          const rows = (cartRows[cart.id] || '').trim();
          return (
            <div key={cart.id} className="cart-cell" style={{ padding: '14px 14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 8px', marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: "'Public Sans', system-ui, sans-serif",
                    fontSize: 22, fontWeight: 700, letterSpacing: '0.03em',
                    textTransform: 'uppercase', lineHeight: 1.25,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {name}
                </span>
                {cart.specialCount > 0 && (
                  <span className="spml-badge" style={{ lineHeight: 1.5, padding: '2px 6px' }}>
                    <span className="t-num">{cart.specialCount}</span> SPML
                  </span>
                )}
              </div>

              {rows && (
                <div className="t-serif" style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.4, marginBottom: 10, overflowWrap: 'anywhere' }}>
                  {rows}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: rows ? 0 : 10 }}>
                {cart.content.map((item, i) =>
                  item.count > 0 ? (
                    <span key={i} className="t-big-num t-num" style={{ lineHeight: 1.1 }}>
                      {item.count}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>

      {excess && excess.total > 0 && excess.details.length > 0 && (
        <p style={{ margin: '18px 0 0', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          <span className="t-label" style={{ color: 'var(--accent)', marginRight: 6 }}>
            EXTRA MEALS, BY HAND:
          </span>
          <span className="t-sans" style={{ fontWeight: 600 }}>
            {excess.details.map(d => `${d.count} ${d.name}`).join(', ')}
          </span>
        </p>
      )}
    </div>
  )
);
ShareCard.displayName = 'ShareCard';
