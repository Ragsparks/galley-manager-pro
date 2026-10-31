import type { Tab } from '../features/galley/GalleyApp';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'calculate', label: 'Calculate' },
  { id: 'learn',     label: 'Learn' },
  { id: 'settings',  label: 'Settings' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => (
  <nav className="tab-bar">
    {TABS.map(t => (
      <button
        key={t.id}
        className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
        onClick={() => onTabChange(t.id)}
      >
        {t.label}
      </button>
    ))}
  </nav>
);
