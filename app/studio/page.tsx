import type { Metadata } from "next";
import StudioShell from "@/components/studio/StudioShell";

export const metadata: Metadata = {
  title: "Agent Studio",
  description: "Ten AI agents for CVs, SOPs, outreach, invoices, scheduling and social, in one glass workspace.",
};

export default function StudioPage() {
  return (
    <main style={{ paddingTop: 96 }}>
      <StudioShell />
    </main>
  );
}
