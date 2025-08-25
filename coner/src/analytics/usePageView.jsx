import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageView() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_location: location.origin + pathname + search,
      });
    }
  }, [pathname, search]);
}
