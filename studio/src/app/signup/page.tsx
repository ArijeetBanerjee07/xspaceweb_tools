"use client";

import { AuthComponent } from "@/components/ui/sign-up";

export default function SignupPage() {
  return (
    <AuthComponent
      brandName="XSW Tools"
      initialMode="signup"
      logo={
        <img
          src="/logo.png"
          alt="XSW Tools"
          className="h-8 w-auto object-contain"
        />
      }
      onSuccess={() => {
        const params = new URLSearchParams(window.location.search);
        const destination = params.get("callbackUrl") || params.get("redirect") || "/app";
        window.location.href = destination;
      }}
    />
  );
}
