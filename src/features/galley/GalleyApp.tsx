import { useState, useEffect, useCallback } from 'react';
import { calculateDistribution } from '../../utils/distribution';
import { DEFAULT_DIST_STRATEGY, INITIAL_OPTIONS, MAX_CAPACITY } from '../../constants';
import type { Cart, DistributionResult, DistStrategy, Excess, MealOption } from '../../types';

// ── Sub-view imports ──────────────────────────────────────
import { NpHeader }       from '../../components/NpHeader';
import { BottomNav }      from '../../components/BottomNav';
import { WelcomeView }    from '../../components/WelcomeView';
import { MealInputView }  from '../../components/MealInputView';
import { ResultsView }    from '../../components/ResultsView';
import { LearnView }      from '../../components/LearnView';
import { SettingsView }   from '../../components/SettingsView';

// ── Types ─────────────────────────────────────────────────
export type Tab = 'calculate' | 'learn' | 'settings';
export type CalcStep = 'welcome' | 'input' | 'results';

export interface AppSettings {
  darkMode: boolean;
  mealsPerCart: number;
  distStrategy: DistStrategy;
  rounding: 'up' | 'down' | 'nearest';
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  mealsPerCart: MAX_CAPACITY,
  distStrategy: DEFAULT_DIST_STRATEGY,
  rounding: 'up',
};

export const GalleyApp: React.FC = () => {
  // ── Navigation ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('calculate');
  const [calcStep, setCalcStep] = useState<CalcStep>('welcome');

  // ── Settings ────────────────────────────────────────────
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // ── Calculator data ──────────────────────────────────────
  const [numCarts, setNumCarts]       = useState<number>(4);
  const [options, setOptions]         = useState<MealOption[]>(INITIAL_OPTIONS);
  const [cartSpecials, setCartSpecials] = useState<Record<number, number>>({});
  const [cartNames, setCartNames]     = useState<Record<number, string>>({});
  const [cartRows, setCartRows]       = useState<Record<number, string>>({});

  // ── Results ──────────────────────────────────────────────
  const [carts, setCarts]             = useState<Cart[]>([]);
  const [excess, setExcess]           = useState<Excess | null>(null);
  const [calcError, setCalcError]     = useState<string | null>(null);

  // ── Dark mode effect ─────────────────────────────────────
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // ── Sync cart specials when numCarts changes ─────────────
  useEffect(() => {
    setCartSpecials(prev => {
      const next = { ...prev };
      for (let i = 1; i <= numCarts; i++) {
        if (next[i] === undefined) next[i] = 0;
      }
      return next;
    });
  }, [numCarts]);

  // ── Handle cart number selection → auto-advance ──────────
  const handleCartSelect = useCallback((n: number) => {
    setNumCarts(n);
    setCalcStep('input');
  }, []);

  // ── Handle calculate ─────────────────────────────────────
  const handleCalculate = useCallback(() => {
    setCalcError(null);
    try {
      const result: DistributionResult = calculateDistribution(
        options,
        cartSpecials,
        numCarts,
        settings.distStrategy,
        settings.mealsPerCart
      );
      setCarts(result.carts);
      setExcess(result.excess);
      setCalcStep('results');
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : 'Invalid input. Please check all quantities.');
    }
  }, [options, cartSpecials, numCarts, settings.distStrategy, settings.mealsPerCart]);

  // ── Reset to welcome ─────────────────────────────────────
  const handleReset = useCallback(() => {
    setCalcStep('welcome');
    setCarts([]);
    setExcess(null);
    setCalcError(null);
    setOptions(INITIAL_OPTIONS);
    setCartSpecials({});
    setCartNames({});
    setCartRows({});
  }, []);

  // ── Settings updater ─────────────────────────────────────
  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  }, []);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>

      {/* Shared header */}
      <NpHeader />

      {/* Main content area */}
      <div className="page-scroll" style={{ paddingTop: 0 }}>

        {/* ─── CALCULATE tab ─────────────────────────────── */}
        {activeTab === 'calculate' && calcStep === 'welcome' && (
          <WelcomeView onCartSelect={handleCartSelect} />
        )}
        {activeTab === 'calculate' && calcStep === 'input' && (
          <MealInputView
            numCarts={numCarts}
            options={options}
            setOptions={setOptions}
            cartSpecials={cartSpecials}
            setCartSpecials={setCartSpecials}
            cartNames={cartNames}
            setCartNames={setCartNames}
            onBack={() => setCalcStep('welcome')}
            onCalculate={handleCalculate}
            calcError={calcError}
          />
        )}
        {activeTab === 'calculate' && calcStep === 'results' && (
          <ResultsView
            carts={carts}
            excess={excess}
            cartNames={cartNames}
            onNameChange={(id, val) => setCartNames(prev => ({ ...prev, [id]: val }))}
            cartRows={cartRows}
            onRowChange={(id, val) => setCartRows(prev => {
              const next = { ...prev, [id]: val };
              const isOdd = id % 2 !== 0;
              const partner = isOdd ? id + 1 : id - 1;
              if (isOdd && (prev[partner] === undefined || prev[partner] === prev[id] || prev[partner] === '')) {
                next[partner] = val;
              }
              return next;
            })}
            onBack={() => setCalcStep('input')}
            onReset={handleReset}
          />
        )}

        {/* ─── LEARN tab ─────────────────────────────────── */}
        {activeTab === 'learn' && (
          <LearnView mealsPerCart={settings.mealsPerCart} />
        )}

        {/* ─── SETTINGS tab ──────────────────────────────── */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            updateSetting={updateSetting}
          />
        )}

      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
