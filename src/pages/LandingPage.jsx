import React, { useState, useEffect } from "react";
import HeroSection from "@/components/landing2/HeroSection";
import RealityCheckSection from "@/components/landing2/RealityCheckSection";
import ChooseExperienceSection from "@/components/landing2/ChooseExperienceSection";
import AlignedWomanSection from "@/components/landing2/AlignedWomanSection";
import FounderQuoteSection from "@/components/landing2/FounderQuoteSection";
import BlueprintIntroSection from "@/components/landing2/BlueprintIntroSection";
import WhatChangesSection from "@/components/landing2/WhatChangesSection";
import EthosSection from "@/components/landing2/EthosSection";
import LandingFooter from "@/components/landing2/LandingFooter";
import WaitlistModal from "@/components/landing/WaitlistModal";

export default function LandingPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");

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
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} affiliateCode={affiliateCode} />}
      <HeroSection onWaitlist={() => setShowWaitlist(true)} />
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