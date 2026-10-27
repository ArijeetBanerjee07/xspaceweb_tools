import { HomePageClient } from "@/components/home/HomePageClient";

export const revalidate = 120;

export default function Home() {
  return <HomePageClient isAuthenticated={false} />;
}
