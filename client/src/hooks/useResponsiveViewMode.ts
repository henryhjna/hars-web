import { useState, useEffect } from 'react';

export type ViewMode = 'table' | 'card';

export function useResponsiveViewMode(breakpoint = 768): [ViewMode, (m: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth >= breakpoint ? 'table' : 'card'
  );

  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth >= breakpoint ? 'table' : 'card');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return [viewMode, setViewMode];
}
