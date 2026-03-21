import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AiAssistant } from "./AiAssistant";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [pinned, setPinned] = useState(() => localStorage.getItem("sidebar-pinned") === "true");

  useEffect(() => {
    const handler = () => setPinned(localStorage.getItem("sidebar-pinned") === "true");
    window.addEventListener("sidebar-pin-changed", handler);
    return () => window.removeEventListener("sidebar-pin-changed", handler);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col">
      <AppSidebar />
      <main className={cn("flex-1 overflow-auto transition-all duration-300", pinned ? "ml-[280px]" : "ml-[68px]")}>
        {children}
      </main>
      <AiAssistant />
    </div>
  );
}
