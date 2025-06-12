"use client";
import { usePathname } from "next/navigation";
import Agent from "./Agent";

export default function ConditionalAgent() {
  const pathname = usePathname();

  // Don't show agent on home page
  if (pathname === "/") {
    return null;
  }

  return <Agent />;
}
