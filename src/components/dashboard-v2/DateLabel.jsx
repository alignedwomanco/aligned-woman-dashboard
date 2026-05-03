import React from "react";

export default function DateLabel() {
  const now = new Date();
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const date = now.getDate();

  return (
    <p className="font-body font-bold text-xs tracking-eyebrow text-awrose-core uppercase">
      TODAY · {dayName} {date} {monthName}
    </p>
  );
}