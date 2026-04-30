import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SESSION_KEY = "aw_region_cache";

export default function useRegion() {
  const [state, setState] = useState({
    countryCode: null,
    regionName: null,
    regionalPricing: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      setState({ ...JSON.parse(cached), loading: false });
      return;
    }

    async function detect() {
      let countryCode = null;
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        countryCode = data.country_code || null;
      } catch {
        // geo-IP failed — fall through to default
      }

      try {
        const allPricing = await base44.entities.RegionalPricing.filter({ is_active: true });
        let match = null;

        if (countryCode && allPricing.length > 0) {
          match = allPricing.find(
            (r) => Array.isArray(r.country_codes) && r.country_codes.includes(countryCode)
          );
        }

        // Fallback: first active pricing record
        if (!match && allPricing.length > 0) {
          match = allPricing[0];
        }

        const result = {
          countryCode,
          regionName: match?.region_name || null,
          regionalPricing: match || null,
          loading: false,
          error: null,
        };

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
        setState(result);
      } catch (err) {
        setState({ countryCode, regionName: null, regionalPricing: null, loading: false, error: err.message });
      }
    }

    detect();
  }, []);

  return state;
}