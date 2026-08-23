import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spaced Review",
  description:
    "Daily spaced-repetition review of LLM inference and training concepts — questions from completed tasks return on an expanding schedule.",
  alternates: { canonical: "/review" },
};

export default function ReviewLayout({ children }: LayoutProps<"/review">) {
  return children;
}
