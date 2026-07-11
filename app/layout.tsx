import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "600", "800"],
});

export const metadata: Metadata = {
  title: "SeatScanner — Any ticket. Best price.",
  description:
    "Search and compare tickets across every major platform in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-midnight font-sans">
        {children}
      </body>
    </html>
  );
}
