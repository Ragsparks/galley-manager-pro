import { useState } from 'react';
import { Dashboard } from './features/dashboard/Dashboard';
import { GalleyApp } from './features/galley/GalleyApp';
import { SafetyApp } from './features/safety/SafetyApp';
import { LayoverApp } from './features/layover/LayoverApp';

type AppView = 'dashboard' | 'galley' | 'safety' | 'layover';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');


  // We need to handle dark mode at the top level to ensure consistency across apps if desired,
  // OR we let each app handle its own. GalleyApp handles its own.
  // But Dashboard needs it too. Ideally, we lift it up.
  // For now, let's keep it simple: separate concerns as mostly requested, but Dashboard supports dark mode classes.
  // To make Dashboard dark mode work, we might need a global toggler or just rely on 'dark' class on html.
  // GalleyApp toggles 'dark' class on document.documentElement. Use that.

  const renderView = () => {
    switch (currentView) {
      case 'galley':
        return <GalleyApp onBack={() => setCurrentView('dashboard')} />;
      case 'safety':
        return <SafetyApp onBack={() => setCurrentView('dashboard')} />;
      case 'layover':
        return <LayoverApp onBack={() => setCurrentView('dashboard')} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  return (
    <>
      {renderView()}
    </>
  );
};

export default App;