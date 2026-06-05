import React from "react";

// Branded shell for the sign-in, register, and password screens. The Aligned
// Woman wordmark replaces the generic icon, and the type and colour come from
// the brand tokens. Layout and props are otherwise unchanged.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-body px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="font-display text-awburg-core text-lg mb-6">
            The Aligned <span className="italic">Woman</span> Co
          </p>
          <h1 className="font-display text-awburg-core text-3xl leading-tight">{title}</h1>
          {subtitle && (
            <p className="font-body text-awburg-core/70 text-sm mt-2">{subtitle}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-awburg-core/10 shadow-sm p-8">
          {children}
        </div>
        {footer && (
          <p className="font-body text-center text-sm text-awburg-core/70 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}