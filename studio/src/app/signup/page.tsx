"use client";

import { useRouter } from "next/navigation";
import { AuthComponent } from "@/components/ui/sign-up";

export default function SignupPage() {
  return (
    <AuthComponent
      brandName="XSW Tools"
      initialMode="signup"
      logo={
        <img
          src="/brand/xswtools_logo.png"
          alt="XSW Tools"
          className="h-8 w-auto object-contain"
        />
      }
      onSuccess={() => {
        window.location.href = "/app";
      }}
    />
  );
}
