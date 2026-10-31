// ResultsView — "Service plan" results page, notepad aesthetic matching the design image.

import React, { useRef, useState } from 'react';
import type { Cart, Excess } from '../types';
import html2canvas from 'html2canvas';

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

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();

  // ── Render canvas image ────────────────────────────────────
  const generateCanvasImage = async (): Promise<string | null> => {
    if (!exportRef.current) return null;
    await new Promise(r => setTimeout(r, 60));
    const canvas = await html2canvas(exportRef.current, {
      // @ts-ignore
      backgroundColor: '#F3EDE2',
      scale: 2,
      useCORS: true,
    });
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
      const blob = await (await fetch(previewImg)).blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopyFeedback('COPIED TO CLIPBOARD! PASTE INTO NOTES.');
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
        setCopyFeedback('PLAN SUMMARY COPIED TO CLIPBOARD!');
      } catch (e) {
        setCopyFeedback('COULD NOT COPY. PLEASE USE DOWNLOAD PNG.');
      }
    }
    setTimeout(() => setCopyFeedback(null), 3500);
  };

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
          {isSharing ? 'PREPARING…' : 'SHARE'}
        </button>
      </div>

      {/* Exportable canvas area */}
      <div ref={exportRef} style={{ background: 'var(--bg)', padding: '4px 0' }}>

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
            const cartLabel = cartNames[cart.id] || `CART ${cart.id}`;
            const rowLabel  = cartRows[cart.id]  || '';
            const hasSPML   = cart.specialCount > 0;

            return (
              <div key={cart.id} className="cart-cell">
                {/* Cart header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                  <input
                    type="text"
                    value={cartLabel}
                    onChange={e => onNameChange(cart.id, e.target.value)}
                    className="t-label"
                    style={{
                      background: 'none', border: 'none', outline: 'none',
                      color: 'var(--ink)', flex: 1, minWidth: 0,
                    }}
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

      {/* Screenshot / Share options modal */}
      {previewImg && (
        <div
          className="anim-fadein"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: 'var(--bg)', maxWidth: 360, width: '100%',
            padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
            borderTop: '2px solid var(--ink)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="t-label">SHARE SERVICE PLAN</span>
              <button
                onClick={() => { setPreviewImg(null); setCopyFeedback(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ border: '1px solid var(--sep)', background: 'var(--bg)', overflow: 'hidden' }}>
              <img src={previewImg} alt="Service plan preview" style={{ width: '100%', maxHeight: '45vh', objectFit: 'contain', display: 'block' }} />
            </div>

            {copyFeedback && (
              <div style={{
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {/* Copy image / text to clipboard to save into Notes */}
              <button className="calc-btn" onClick={handleCopyToClipboard}>
                📋 COPY TO CLIPBOARD (SAVE IN NOTES)
              </button>

              {/* Download photo as PNG */}
              <button className="ghost-btn" onClick={handleDownload}>
                📥 DOWNLOAD PHOTO (PNG)
              </button>

              {/* Native share if available */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="t-label"
                  style={{
                    padding: '8px 0',
                    textAlign: 'center',
                    color: 'var(--ink-3)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  SEND VIA AIRDROP / MESSAGES
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
