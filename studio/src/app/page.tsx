import { HomePageClient } from "@/components/home/HomePageClient";
import { getAuthContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const auth = await getAuthContext().catch(() => null);
  const isAuthenticated = !!auth?.user;

  return <HomePageClient isAuthenticated={isAuthenticated} />;
}
