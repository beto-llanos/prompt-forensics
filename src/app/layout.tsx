import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PROMPT FORENSICS — find injection holes before attackers do",
  description:
    "Static analysis + AI forensic notes for production LLM prompts. Eight categories of vulnerability, severity-scored, with concrete remediations. Built for teams shipping LLMs into production.",
  openGraph: {
    title: "PROMPT FORENSICS",
    description: "find injection holes before attackers do",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROMPT FORENSICS",
    description: "find injection holes before attackers do",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="scanlines min-h-full">{children}</body>
    </html>
  );
}
