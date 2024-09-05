import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <h1>ADMIN LAYOUT</h1>
        {children}
      </body>
    </html>
  );
}
