"use client";

import { useRouter } from "next/navigation";
import { AuthComponent } from "@/components/ui/sign-up";

export default function LoginPage() {
  return (
    <AuthComponent
      brandName="XSW Tools"
      initialMode="signin"
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
