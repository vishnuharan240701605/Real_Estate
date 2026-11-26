import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures the viewport instantly scrolls to the top on every route transition.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}
