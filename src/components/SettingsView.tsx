// SettingsView — SETTINGS page matching the notepad/editorial design image with safety modal.

import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../features/galley/GalleyApp';
import type { DistStrategy } from '../types';
import { ChevronRight } from 'lucide-react';
import QRCode from 'qrcode';

interface SettingsViewProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
}

type SubPage = 'none' | 'how-it-works' | 'about';

const MPC_OPTIONS = [30, 35, 40, 45, 50];
const DIST_OPTS: DistStrategy[] = ['First Carts Full', 'Equally'];
const ROUNDING_OPTS: Array<'up' | 'down' | 'nearest'> = ['up', 'down', 'nearest'];

interface PendingChange {
  key: keyof AppSettings;
  val: any;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, updateSetting }) => {
  const [subPage, setSubPage] = useState<SubPage>('none');
  const [mpcOpen, setMpcOpen] = useState(false);
  const [distOpen, setDistOpen] = useState(false);
  const [roundingOpen, setRoundingOpen] = useState(false);

  // Safety confirmation modal state for critical settings
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL('https://galleypro.vercel.app', {
      width: 180,
      margin: 1,
      color: {
        dark: '#2A1B1F',
        light: '#00000000'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, []);

  const requestSettingChange = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    if (settings[key] === val) return;
    setPendingChange({ key, val });
  };

  const handleConfirmChange = () => {
    if (pendingChange) {
      updateSetting(pendingChange.key, pendingChange.val);
      setPendingChange(null);
    }
  };

  const handleCancelChange = () => {
    setPendingChange(null);
  };

  // ── Sub-page: About GalleyPro (matching screenshot precisely) ─────────
  if (subPage === 'about') {
    return (
      <div className="anim-fadeup px-5 pt-5 pb-8">
        <button
          className="back-btn"
          onClick={() => setSubPage('none')}
          style={{ marginBottom: 28 }}
        >
          ← BACK
        </button>

        <h1
          className="t-title"
          style={{ fontSize: 44, marginBottom: 16 }}
        >
          About <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>GalleyPro</em>
        </h1>

        <h2
          className="t-subtitle"
          style={{ fontSize: 24, fontStyle: 'italic', marginBottom: 28, color: 'var(--ink)' }}
        >
          An app made by crew, for crew.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p className="t-body" style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>
            GalleyPro is free, and it always will be.
          </p>

          <p className="t-body" style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>
            After four years in economy class, I wanted to share what I've learned and make my colleagues' lives a little easier.
          </p>

          <p className="t-body" style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>
            I've also included a few personal tips. They're the ones that work for me, but everyone is free to work the way they like.
          </p>
        </div>

        <p className="t-serif" style={{ margin: '36px 0 0', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-3)' }}>
          Designed by: Ruben Alvarez
        </p>
      </div>
    );
  }

  // ── Sub-page: How it works ─────────────────────────────
  if (subPage === 'how-it-works') {
    return (
      <div className="anim-fadeup px-5 pt-5 pb-8">
        <button
          className="back-btn"
          onClick={() => setSubPage('none')}
          style={{ marginBottom: 24 }}
        >
          ← BACK
        </button>

        <h1
          className="t-title"
          style={{ fontSize: 38, marginBottom: 12 }}
        >
          How it <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>works</em>
        </h1>

        <p className="t-body" style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 20 }}>
          Galley Manager Pro automatically calculates precise meal distributions so that each cart carries an exact proportional share of every menu choice, respecting physical slot constraints.
        </p>

        <div className="sep-line" style={{ marginBottom: 20 }} />

        <h3 className="t-serif" style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>
          Hamilton Largest-Remainder Apportionment
        </h3>
        <p className="t-body" style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 20 }}>
          Instead of naive fractional approximations that create phantom meals, the engine uses integer quota distribution with remainder priority. Every single regular meal entered is accounted for — nothing is invented, nothing disappears.
        </p>

        <h3 className="t-serif" style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>
          Special Meals (SPML) Deduction
        </h3>
        <p className="t-body" style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 20 }}>
          Pre-ordered special diets occupy real slots within a cart. A cart holding <span className="t-num">5</span> SPML has <span className="t-num">{settings.mealsPerCart - 5}</span> slots remaining for standard service.
        </p>

        <h3 className="t-serif" style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>
          Extra Meals by Hand
        </h3>
        <p className="t-body" style={{ fontSize: 16, lineHeight: 1.65, margin: 0 }}>
          Any meals exceeding the maximum capacity of all carts are displayed in a clean single-line breakdown to be distributed by hand from the galley.
        </p>
      </div>
    );
  }

  // ── Main settings page ─────────────────────────────────
  return (
    <div className="anim-fadeup px-5 pt-6 pb-6">

      {/* Title */}
      <h1
        className="t-title"
        style={{ fontSize: 44, fontStyle: 'italic', marginBottom: 28 }}
      >
        Settings
      </h1>

      {/* ── APPEARANCE ─────────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 10, display: 'block' }}>
        APPEARANCE
      </span>

      <div className="theme-toggle" style={{ marginBottom: 32 }}>
        <button
          className={`theme-btn ${!settings.darkMode ? 'active' : ''}`}
          onClick={() => updateSetting('darkMode', false)}
        >
          LIGHT
        </button>
        <button
          className={`theme-btn ${settings.darkMode ? 'active' : ''}`}
          onClick={() => updateSetting('darkMode', true)}
        >
          DARK
        </button>
      </div>

      {/* ── ADVANCED OPTIONS ───────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 10, display: 'block' }}>
        ADVANCED OPTIONS
      </span>

      <div style={{ borderTop: '1px solid var(--sep)', marginBottom: 32 }}>
        {/* Distribution strategy */}
        <div className="settings-row" style={{ position: 'relative' }}>
          <span style={{ fontSize: 18 }}>Distribution strategy</span>
          <button
            onClick={() => setDistOpen(v => !v)}
            className="t-label"
            style={{
              color: 'var(--ink-2)', cursor: 'pointer',
              borderBottom: '1px solid var(--sep)', paddingBottom: 2,
            }}
          >
            {settings.distStrategy === 'First Carts Full' ? 'FIRST CARTS FULL' : 'EQUALLY'}
          </button>

          {distOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%',
              background: 'var(--bg)', border: '1px solid var(--sep)',
              zIndex: 50, minWidth: 190, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              {DIST_OPTS.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    setDistOpen(false);
                    requestSettingChange('distStrategy', opt);
                  }}
                  className="t-sans"
                  style={{
                    display: 'block', width: '100%', padding: '12px 16px',
                    background: opt === settings.distStrategy ? 'var(--bg2)' : 'transparent',
                    border: 'none', textAlign: 'left',
                    fontSize: 12, fontWeight: opt === settings.distStrategy ? 700 : 400,
                    color: 'var(--ink)', cursor: 'pointer',
                  }}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Change meals per cart */}
        <div className="settings-row" style={{ position: 'relative' }}>
          <span style={{ fontSize: 18 }}>Change meals per cart</span>
          <button
            onClick={() => setMpcOpen(v => !v)}
            className="t-num"
            style={{
              fontSize: 22, fontWeight: 600, color: 'var(--ink)',
              borderBottom: '1px solid var(--sep)', padding: '0 4px',
            }}
          >
            {settings.mealsPerCart}
          </button>

          {mpcOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%',
              background: 'var(--bg)', border: '1px solid var(--sep)',
              zIndex: 50, minWidth: 120, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              {MPC_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setMpcOpen(false);
                    requestSettingChange('mealsPerCart', n);
                  }}
                  className="t-num"
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    background: n === settings.mealsPerCart ? 'var(--bg2)' : 'transparent',
                    border: 'none', textAlign: 'right',
                    fontSize: 16, fontWeight: n === settings.mealsPerCart ? 700 : 400,
                    color: 'var(--ink)', cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rounding rule */}
        <div className="settings-row" style={{ position: 'relative' }}>
          <span style={{ fontSize: 18 }}>Rounding</span>
          <button
            onClick={() => setRoundingOpen(v => !v)}
            className="t-label"
            style={{
              color: 'var(--ink-2)', cursor: 'pointer',
              borderBottom: '1px solid var(--sep)', paddingBottom: 2,
            }}
          >
            {settings.rounding.toUpperCase()}
          </button>

          {roundingOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%',
              background: 'var(--bg)', border: '1px solid var(--sep)',
              zIndex: 50, minWidth: 130, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              {ROUNDING_OPTS.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setRoundingOpen(false);
                    requestSettingChange('rounding', r);
                  }}
                  className="t-sans"
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    background: r === settings.rounding ? 'var(--bg2)' : 'transparent',
                    border: 'none', textAlign: 'left',
                    fontSize: 12, fontWeight: r === settings.rounding ? 700 : 400,
                    color: 'var(--ink)', cursor: 'pointer',
                  }}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MORE ───────────────────────────────────────────── */}
      <span className="t-label" style={{ marginBottom: 10, display: 'block' }}>
        MORE
      </span>

      <div style={{ borderTop: '1px solid var(--sep)' }}>
        <button
          className="settings-row"
          onClick={() => setSubPage('how-it-works')}
          style={{ width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: 18 }}>How it works</span>
          <ChevronRight size={18} color="var(--ink-3)" />
        </button>

        <button
          className="settings-row"
          onClick={() => setSubPage('about')}
          style={{ width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: 18 }}>About GalleyPro</span>
          <span className="t-label" style={{ color: 'var(--ink-3)' }}>V2.1</span>
        </button>
      </div>

      {/* ── SHARE WITH CREW (QR) ───────────────────────────── */}
      <div style={{ marginTop: 36, textAlign: 'center' }}>
        <span className="t-label" style={{ marginBottom: 14, display: 'block' }}>
          SHARE WITH CREW
        </span>

        <div style={{
          display: 'inline-block',
          padding: 12,
          background: '#ffffff',
          borderRadius: 6,
          border: '1px solid var(--sep)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code for https://galleypro.vercel.app"
              style={{ width: 150, height: 150, display: 'block' }}
            />
          ) : (
            <div style={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="t-sans" style={{ fontSize: 11, color: '#6B5B55' }}>Loading QR...</span>
            </div>
          )}
        </div>

        <p className="t-sans" style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 12, fontWeight: 500 }}>
          https://galleypro.vercel.app
        </p>
        <p className="t-serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ink-3)', margin: '4px 0 0' }}>
          Scan with any phone camera to open.
        </p>
      </div>

      {/* ── SAFETY CONFIRMATION MODAL ───────────────────────── */}
      {pendingChange && (
        <div className="modal-overlay anim-fadein">
          <div className="modal-box anim-zoomin">
            <h3 className="modal-title">
              Confirm Configuration Change
            </h3>
            <p className="modal-body">
              Are you sure you want to make this change? These settings modify the standard calculation behavior.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={handleCancelChange}>
                CANCEL
              </button>
              <button className="modal-confirm" onClick={handleConfirmChange}>
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
