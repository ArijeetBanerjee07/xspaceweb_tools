"use client";

import { AuthComponent } from "@/components/ui/sign-up";

export default function LoginPage() {
  return (
    <AuthComponent
      brandName="XSW Tools"
      initialMode="signin"
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
