// ResultsView — "Service plan" results page, notepad aesthetic matching the design image.

import React, { useEffect, useRef, useState } from 'react';
import type { Cart, Excess } from '../types';
import html2canvas from 'html2canvas';
import { Share, Copy, ChevronDown } from 'lucide-react';
import { CartNameButton } from './CartNameButton';
import { ShareCard } from './ShareCard';
import { ResultsSummary } from './ResultsSummary';

interface ResultsViewProps {
  carts: Cart[];
  excess: Excess | null;
  cartNames: Record<number, string>;
  onNameChange: (id: number, val: string) => void;
  cartRows: Record<number, string>;
  onRowChange: (id: number, val: string) => void;
  onBack: () => void;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  carts,
  excess,
  cartNames,
  onNameChange,
  cartRows,
  onRowChange,
  onBack,
  onReset,
}) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  // Bring the expanded info into view so the person doesn't have to hunt for it.
  useEffect(() => {
    if (infoOpen) infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [infoOpen]);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();

  // ── Render canvas image ────────────────────────────────────
  const generateCanvasImage = async (): Promise<string | null> => {
    if (!exportRef.current) return null;
    // Wait for the web fonts: capturing with fallback fonts is what makes text get cut.
    try { await document.fonts.ready; } catch { /* older browsers: carry on */ }
    await new Promise(r => setTimeout(r, 60));
    // Follow the current theme so dark mode doesn't export light text on cream.
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#F3EDE2';
    // html2canvas 1.4 options (the installed @types package is for 0.5, so type loosely)
    const options = {
      backgroundColor: bg,
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      onclone: (_doc: Document, el: HTMLElement) => {
        // The card lives off-screen; bring its clone to the origin so nothing is cropped.
        const holder = el.parentElement;
        if (holder) { holder.style.left = '0px'; holder.style.top = '0px'; }
      },
    };
    const canvas = await html2canvas(exportRef.current, options as unknown as Parameters<typeof html2canvas>[1]);
    return canvas.toDataURL('image/png');
  };

  // ── Share / screenshot modal ───────────────────────────────
  const handleOpenShareModal = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setCopyFeedback(null);
    try {
      const dataUrl = await generateCanvasImage();
      if (dataUrl) {
        setPreviewImg(dataUrl);
      }
    } catch (err) {
      console.error('Screenshot generation failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (!previewImg) return;
    const a = document.createElement('a');
    a.href = previewImg;
    a.download = `GalleyPro-ServicePlan-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  const handleCopyToClipboard = async () => {
    if (!previewImg) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Passing a promise keeps Safari's "user gesture" valid while the blob loads.
        const blobPromise = fetch(previewImg).then(r => r.blob());
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
        setCopyFeedback('COPIED');
      } else {
        throw new Error('ClipboardItem API not supported');
      }
    } catch (err) {
      console.warn('Direct image copy failed, copying summary text fallback:', err);
      // Fallback: copy clean text breakdown for notes app
      let textSummary = `GALLEY MANAGER PRO - SERVICE PLAN (${dateLabel})\n\n`;
      carts.forEach(cart => {
        const label = cartNames[cart.id] || `CART ${cart.id}`;
        const row = cartRows[cart.id] ? ` (${cartRows[cart.id]})` : '';
        const spml = cart.specialCount > 0 ? ` [${cart.specialCount} SPML]` : '';
        textSummary += `${label}${row}${spml}:\n`;
        cart.content.forEach(item => {
          if (item.count > 0) textSummary += `  • ${item.name}: ${item.count}\n`;
        });
        textSummary += '\n';
      });
      if (excess && excess.total > 0 && excess.details.length > 0) {
        textSummary += `EXTRA MEALS, BY HAND:\n  ${excess.details.map(d => `${d.count} ${d.name}`).join(', ')}\n`;
      }
      try {
        await navigator.clipboard.writeText(textSummary);
        setCopyFeedback('COPIED AS TEXT');
      } catch (e) {
        setCopyFeedback('COULD NOT COPY');
      }
    }
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Opens the system share sheet (AirDrop, Messages, Save Image…). Falls back to a download on desktop.
  const handleNativeShare = async () => {
    if (!previewImg) return;
    try {
      const blob = await (await fetch(previewImg)).blob();
      const file = new File([blob], 'galley-service-plan.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Galley Manager Pro',
          text: `Galley Service Plan - ${dateLabel}`
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      // Closing the share sheet is not an error — don't trigger a surprise download.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error(err);
      handleDownload();
    }
  };

  return (
    <div className="anim-zoomin px-5 pt-5 pb-6">

      {/* Top action row: ← BACK  |  SHARE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button className="back-btn" onClick={onBack}>
          ← BACK
        </button>
        <button className="share-btn" onClick={handleOpenShareModal} disabled={isSharing}>
          <Share size={14} strokeWidth={2.4} />
          {isSharing ? 'PREPARING…' : 'SHARE'}
        </button>
      </div>

      {/* Exportable canvas area */}
      <div style={{ background: 'var(--bg)', padding: '4px 0' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2
            className="t-section-h"
            style={{ fontSize: 34, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}
          >
            Service plan
          </h2>
          <span className="t-label" style={{ color: 'var(--ink-2)', fontStyle: 'normal' }}>
            {dateLabel}
          </span>
        </div>

        {/* Cart grid with 1px subtle separator */}
        <div className="cart-grid">
          {carts.map(cart => {
            const rowLabel  = cartRows[cart.id]  || '';
            const hasSPML   = cart.specialCount > 0;

            return (
              <div key={cart.id} className="cart-cell">
                {/* Cart header — large name, tap to pick L3 / R3 / … */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 6px', marginBottom: 6 }}>
                  <CartNameButton
                    size="large"
                    cartId={cart.id}
                    name={cartNames[cart.id]}
                    takenNames={carts.filter(c => c.id !== cart.id).map(c => cartNames[c.id]).filter((n): n is string => !!n)}
                    onChange={val => onNameChange(cart.id, val)}
                  />
                  {hasSPML && (
                    <span className="spml-badge">
                      <span className="t-num">{cart.specialCount}</span> SPML
                    </span>
                  )}
                </div>

                {/* Row range */}
                <input
                  type="text"
                  value={rowLabel}
                  onChange={e => onRowChange(cart.id, e.target.value)}
                  placeholder="Rows …"
                  className="t-serif"
                  style={{
                    background: 'none', border: 'none', borderBottom: '1px solid var(--sep)',
                    outline: 'none', fontSize: 13, color: 'var(--ink-3)',
                    width: '100%', marginBottom: 12, paddingBottom: 2,
                  }}
                />

                {/* Meal counts — large digits in Public Sans, strictly non-italic */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cart.content.map((item, i) =>
                    item.count > 0 ? (
                      <span
                        key={i}
                        className="t-big-num t-num"
                        style={{ fontStyle: 'normal' }}
                      >
                        {item.count}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Excess meals management — Single clean line of text, no extra box/cart */}
        {excess && excess.total > 0 && excess.details.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: 'var(--ink-2)',
                lineHeight: 1.5,
              }}
            >
              <span className="t-label" style={{ color: 'var(--accent)', marginRight: 6 }}>
                EXTRA MEALS, BY HAND:
              </span>
              <span className="t-sans" style={{ fontStyle: 'normal', fontWeight: 600 }}>
                {excess.details.map(d => `${d.count} ${d.name}`).join(', ')}
              </span>
            </p>
          </div>
        )}

      </div>

      {/* New plan reset button */}
      <button
        onClick={onReset}
        className="ghost-btn"
        style={{ marginTop: 32 }}
      >
        START NEW PLAN
      </button>

      {/* Footer link: expands the totals right here, no page change */}
      <button
        type="button"
        className="t-label"
        onClick={() => setInfoOpen(v => !v)}
        aria-expanded={infoOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '22px auto 0', color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        {infoOpen ? 'LESS INFO' : 'MORE INFO'}
        <ChevronDown size={13} style={{ transform: infoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {infoOpen && (
        <div ref={infoRef} className="anim-fadein" style={{ scrollMarginTop: 12 }}>
          <ResultsSummary carts={carts} excess={excess} />
        </div>
      )}

      {/* Off-screen, fixed-width card that is captured for sharing (never visible) */}
      <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}>
        <ShareCard ref={exportRef} carts={carts} excess={excess} cartNames={cartNames} cartRows={cartRows} dateLabel={dateLabel} />
      </div>

      {/* Share sheet: full preview (scrolls if tall) + pinned actions */}
      {previewImg && (
        <div
          className="anim-fadein"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div style={{
            background: 'var(--bg)', maxWidth: 380, width: '100%',
            maxHeight: '100%', display: 'flex', flexDirection: 'column',
            padding: 18, gap: 12,
            borderTop: '2px solid var(--ink)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span className="t-label">SERVICE PLAN</span>
              <button
                onClick={() => { setPreviewImg(null); setCopyFeedback(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* The whole image is shown at full width; the area scrolls instead of cropping */}
            <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--sep)' }}>
              <img src={previewImg} alt="Service plan preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {copyFeedback && (
              <div style={{
                flexShrink: 0,
                padding: '8px 12px',
                background: 'rgba(110,18,48,0.08)',
                borderLeft: '2px solid var(--accent)',
                color: 'var(--accent)',
                fontSize: 11,
                fontFamily: 'Public Sans, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textAlign: 'center'
              }}>
                {copyFeedback}
              </div>
            )}

            {/* Two options only: copy, or the system share sheet (AirDrop, Save Image…) */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button className="calc-btn share-action" style={{ flex: 1, padding: 0 }} onClick={handleCopyToClipboard}>
                <Copy size={17} /> COPY
              </button>
              <button
                className="ghost-btn share-action"
                style={{ width: 64, padding: 0, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                onClick={handleNativeShare}
                aria-label="Share, AirDrop or save to Photos"
              >
                <Share size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
