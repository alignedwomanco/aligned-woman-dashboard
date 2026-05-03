import React from "react";

export default function AccountStatusFooter({ joinedDate, membershipLabel }) {
  if (!joinedDate || !membershipLabel) return null;

  return (
    <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 uppercase">
      MEMBER SINCE {joinedDate} · {membershipLabel}
    </p>
  );
}