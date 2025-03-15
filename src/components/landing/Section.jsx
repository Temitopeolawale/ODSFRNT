import React from "react";

export function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`w-full py-12 md:py-24 lg:py-32 ${className}`}>
      {children}
    </section>
  );
}