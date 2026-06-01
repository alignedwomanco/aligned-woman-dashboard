import React from "react";

export default function PendingApproval({ firstName }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs tracking-eyebrow text-awrose-core uppercase mb-4">
          The Aligned Woman
        </p>
        <h1 className="font-display text-3xl text-awburg-core mb-4">
          You are on the list{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="font-body text-awburg-core/80 leading-relaxed">
          Thank you for signing in. Your place is being reviewed, and you will
          receive an email from us the moment your access opens. There is
          nothing you need to do right now.
        </p>
      </div>
    </div>
  );
}