
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified Auth page on the login route with registration mode active
    router.replace("/login?mode=register");
  }, [router]);

  return null;
}
