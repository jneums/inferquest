import type { Metadata } from "next";
import { LIBRARY } from "@/data/library";
import { Library } from "@/components/Library";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Library — The Curriculum's Bibliography",
  description: `The ${LIBRARY.length} books, courses, posts, podcasts, and references the InferQuest roadmaps draw on — with why each source earns its place, which phases it serves, and what to skip.`,
  alternates: { canonical: "/library" },
};

export default function LibraryPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "InferQuest library",
    numberOfItems: LIBRARY.length,
    itemListElement: LIBRARY.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.title,
      url: `${SITE_URL}/library#${e.id}`,
    })),
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
        <p className="mt-1 max-w-2xl text-[var(--text-secondary)]">
          The sources the curriculum recommends without assigning: books that
          span phases, canon that serves the whole map, references you keep
          open rather than finish. No XP here — just why each one earns its
          shelf space.
        </p>
      </div>
      <Library />
    </div>
  );
}
