import React, { useState, useEffect } from "react";
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