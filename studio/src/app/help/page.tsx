import type { Metadata } from "next";
import { PublicHelpCenter } from "@/components/help/PublicHelpCenter";

export const metadata: Metadata = {
  title: "Help Center | XSW Tools",
  description:
    "Search XSWTOOLS help articles, tool guides, plan details and payment support.",
};

export default function HelpPage() {
  return <PublicHelpCenter />;
}
