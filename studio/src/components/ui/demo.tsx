"use client";

import { AuthComponent } from "@/components/ui/sign-up";
import { useRouter } from "next/navigation";

// Placeholder custom logo
const CustomLogo = () => (
  <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-xl p-2 shadow-sm">
    <svg 
      className="h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export default function CustomAuthDemo() {
  const router = useRouter();

  return (
    <AuthComponent 
      logo={<CustomLogo />} 
      brandName="XSW Tools" 
      onSuccess={() => router.push("/app")}
    />
  );
}
