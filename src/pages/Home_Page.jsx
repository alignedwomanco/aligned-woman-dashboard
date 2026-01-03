import React from "react";
import CompanyHeroSection from "@/components/landing/CompanyHeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import GapSection from "@/components/landing/GapSection";
import FoundationalEducationSection from "@/components/landing/FoundationalEducationSection";
import WhatWeDoDifferentlySection from "@/components/landing/WhatWeDoDifferentlySection";
import ALIVEMethodSection from "@/components/landing/ALIVEMethodSection";
import TopicsSection from "@/components/landing/TopicsSection";
import WhoIsForSectionCompany from "@/components/landing/WhoIsForSectionCompany";

export default function Home_Page() {
  return (
    <div className="bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-indigo-50/30">
      <CompanyHeroSection />
      <FoundationalEducationSection />
      <ProblemSection />
      <GapSection />
      <WhatWeDoDifferentlySection />
      <ALIVEMethodSection />
      <TopicsSection />
      <WhoIsForSectionCompany />
    </div>
  );
}