import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearText",
  description: "Quickly understand, organize, or improve pasted text.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
