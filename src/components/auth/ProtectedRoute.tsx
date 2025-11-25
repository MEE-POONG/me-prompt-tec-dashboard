// src/components/ProtectedRoute.tsx
"use client"; // ถ้าใช้ Next.js 13+ app router
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/router";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login"); // redirect ไป login ถ้ายังไม่ได้ login
    }
  }, [router]);

  return <>{children}</>;
}
