import React from "react";

export default function WelcomeHeader({ userName }) {
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const firstName = userName?.split(" ")[0] || "there";

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl text-[#2A1218]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {greeting}, <em className="not-italic italic">{firstName}.</em>
      </h1>
      <p className="text-sm text-[#6B6168] italic mt-1">Hope you feel centered today.</p>
    </div>
  );
}