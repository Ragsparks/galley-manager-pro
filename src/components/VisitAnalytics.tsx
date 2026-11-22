import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';

/**
 * The analytics script needs the network. When the app is opened offline
 * (e.g. in flight), wait for a connection so the visit is still counted
 * if it comes back while the app is open.
 */
export const VisitAnalytics = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (online) return;
    const handleOnline = () => setOnline(true);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [online]);

  return online ? <Analytics /> : null;
};
