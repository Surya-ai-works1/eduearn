import React from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "../providers";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { constructMetadata } from "../config/metadata";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable}`}
    >
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Providers>
          <React.Suspense fallback={<div className="h-16 w-full bg-background border-b border-border/40" />}>
            <Navbar />
          </React.Suspense>
          <div className="flex-grow w-full">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
