// src/hooks/usePageTitle.js
// Sets <title> on every page change for screen readers + browser tabs.
import { useEffect } from 'react';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Trusted Ideas HR';

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
    return () => { document.title = prev; };
  }, [title]);
}
