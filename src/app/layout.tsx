import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Nav } from "@/components/Nav";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · InferQuest",
  },
  description: SITE_DESCRIPTION,
  applicationName: "InferQuest",
  keywords: [
    "inference engineer",
    "inference engineering",
    "LLM inference",
    "inference engineer roadmap",
    "inference engineering course",
    "LLM serving",
    "vLLM",
    "SGLang",
    "KV cache",
    "CUDA kernels",
    "Triton kernels",
    "GPU programming",
    "quantization",
    "continuous batching",
    "MLSys",
  ],
  category: "education",
  openGraph: {
    type: "website",
    siteName: "InferQuest",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>
          <ProgressProvider>
            <Nav />
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-8 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-[var(--hairline)] py-6 text-center text-sm text-[var(--text-muted)]">
              <p>
                InferQuest — an open, gamified path into inference
                engineering, with verified quests.
              </p>
              <p className="mt-2 space-x-4">
                <a href="/privacy" className="hover:text-[var(--text-secondary)]">
                  Privacy
                </a>
                <a href="/terms" className="hover:text-[var(--text-secondary)]">
                  Terms
                </a>
                <a
                  href="https://github.com/jneums/inferquest"
                  className="hover:text-[var(--text-secondary)]"
                >
                  GitHub
                </a>
              </p>
            </footer>
          </ProgressProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
