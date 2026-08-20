"use client";

import { useUser } from "@clerk/nextjs";
import { Dashboard } from "@/components/Dashboard";
import { Landing } from "@/components/Landing";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  // Until Clerk resolves, render nothing contentful — avoids a landing-page
  // flash for signed-in users (and vice versa).
  if (!isLoaded) return <div className="min-h-[60vh]" />;

  return isSignedIn ? <Dashboard /> : <Landing />;
}
