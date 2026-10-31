// WelcomeView — "Welcome on board, crew." landing with number-of-carts grid.
// Tapping a number auto-advances to the next page instantly.
import React from 'react';

const CART_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

interface WelcomeViewProps {
  onCartSelect: (n: number) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onCartSelect }) => {
  const now = new Date();
  const dayStr = now.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="anim-fadeup px-5 pt-7 pb-4">
      {/* Date stamp in Public Sans uppercase */}
      <p className="t-label" style={{ color: 'var(--ink-2)', marginBottom: 12 }}>
        {dayStr} · {dateStr}
      </p>

      {/* Welcome heading in Newsreader */}
      <h1
        className="t-title"
        style={{ fontSize: 44, lineHeight: 1.08, marginBottom: 16 }}
      >
        Welcome on<br />
        board, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>crew.</em>
      </h1>

      {/* Editorial subtitle in Newsreader */}
      <p
        className="t-body"
        style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--ink-2)', marginBottom: 32 }}
      >
        Let's plan today's service. How many carts are you loading?
      </p>

      {/* Section label in Public Sans */}
      <span className="t-label" style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}>
        NUMBER OF CARTS
      </span>

      {/* Number grid — 3 columns, clean 1px borders, Public Sans digits, strictly non-italic */}
      <div className="num-grid" style={{ marginBottom: 32 }}>
        {CART_NUMBERS.map(n => (
          <button
            key={n}
            className="num-btn t-num"
            onClick={() => onCartSelect(n)}
            aria-label={`${n} carts`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Hint in Newsreader italic */}
      <p
        className="t-serif"
        style={{
          textAlign: 'center',
          fontSize: 16,
          fontStyle: 'italic',
          color: 'var(--ink-3)',
          margin: '0 auto',
        }}
      >
        Tap a number to begin.
      </p>
    </div>
  );
};
