import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <React.Fragment>
      <h1>AUTH LAYOUT</h1>
      {children}
    </React.Fragment>
  );
}
