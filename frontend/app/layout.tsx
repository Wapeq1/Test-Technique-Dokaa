import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dakoo Restaurant Search",
  description: "Search for restaurants and read reviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
