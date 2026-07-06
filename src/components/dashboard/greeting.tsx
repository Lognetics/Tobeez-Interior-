"use client";

import * as React from "react";
import { useGreeting } from "@/lib/session";

export function DashboardGreeting() {
  const { greeting } = useGreeting();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return <>{mounted ? greeting : "Welcome back"} 👋</>;
}
