import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HeroSection from "@/components/home/HeroSection";
import RealityCheckSection from "@/components/home/RealityCheckSection";
import ChooseExperienceSection from "@/components/home/ChooseExperienceSection";
import AlignedWomanSection from "@/components/home/AlignedWomanSection";
import FounderQuoteSection from "@/components/home/FounderQuoteSection";
import BlueprintIntroSection from "@/components/home/BlueprintIntroSection";
import WhatChangesSection from "@/components/home/WhatChangesSection";
import EthosSection from "@/components/home/EthosSection";
import LandingFooter from "@/components/home/LandingFooter";

export default function Home() {
  const navigate = useNavigate();
  const [affiliateCode, setAffiliateCode] = useState("");

  // A paid, logged-in member should land on their dashboard, not the marketing page.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed || !active) return;
        const me = await base44.auth.me();
        const tags = Array.isArray(me?.access_tags) ? me.access_tags : [];
        const isPaid = me?.membership_type === "paid" || tags.includes("blueprint_paid");
        if (isPaid && active) navigate("/Dashboard", { replace: true });
      } catch (e) {
        // Not logged in or the check failed: leave them on the marketing page.
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff");
    if (aff) {
      setAffiliateCode(aff);
      sessionStorage.setItem("aff", aff);
    } else {
      const stored = sessionStorage.getItem("aff");
      if (stored) setAffiliateCode(stored);
    }
  }, []);

  return (
    <div className="overflow-x-hidden scroll-smooth">
      <HeroSection onWaitlist={() => {}} />
      <RealityCheckSection />
      <ChooseExperienceSection />
      <AlignedWomanSection />
      <FounderQuoteSection />
      <BlueprintIntroSection />
      <WhatChangesSection />
      <EthosSection />
      <LandingFooter />
    </div>
  );
}