import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-GVHHRHTQ12";

// Initialize gtag
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll manually track page views
  });
}

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    if (typeof window !== 'undefined' && location.pathname) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return null;
}

export { GA_MEASUREMENT_ID };