import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InferQuest",
  description:
    "A gamified open curriculum for becoming an inference engineer — transformers, GPUs, and serving frameworks as a quest line.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ProgressProvider>
          <Nav />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-[var(--hairline)] py-6 text-center text-sm text-[var(--text-muted)]">
            An open, gamified path into inference engineering. Progress lives in
            your browser.
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
