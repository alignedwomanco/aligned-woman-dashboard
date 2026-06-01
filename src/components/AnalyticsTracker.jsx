import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Analytics from "analytics";
import googleAnalytics from "@analytics/google-analytics";

// Get measurement ID from environment or use the configured value
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-2KVNX7CDX7";

// Check if GA is properly configured
const isGAConfigured = GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" && GA_MEASUREMENT_ID !== "G-2KVNX7CDX7";

if (!isGAConfigured) {
  console.warn("Google Analytics not configured. Please set GA_MEASUREMENT_ID secret in Dashboard Settings > Integrations.");
}

// Initialize analytics instance
const analytics = Analytics({
  app: "Aligned Woman Blueprint",
  plugins: [
    googleAnalytics({
      measurementIds: [GA_MEASUREMENT_ID],
      // Track page views automatically
      trackPages: true,
      // Enable debug mode in development
      debug: import.meta.env.DEV,
    }),
  ],
});

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    if (location.pathname) {
      analytics.page({
        path: location.pathname,
        url: window.location.href,
        title: document.title,
      });
    }
  }, [location]);

  return null;
}

export { analytics };