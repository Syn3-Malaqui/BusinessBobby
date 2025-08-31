"use client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const content = (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );

  // Only render content in the browser to avoid SSR issues
  return isClient ? content : null;
}


