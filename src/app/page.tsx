import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Dashboard } from "@/components/Dashboard";
import { Landing } from "@/components/Landing";
import { courseJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Server-rendered so crawlers and no-JS clients get the full landing page —
// the previous client-side Clerk switch served them an empty div.
export default async function Home() {
  const { userId } = await auth();

  if (userId) return <Dashboard />;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Landing />
    </>
  );
}
