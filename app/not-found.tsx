"use client";
import Providers from "./providers";
import NotFound from "../src/pages/NotFound";
import React from "react";

export default function NotFoundPage() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <Providers>
      <NotFound />
    </Providers>
  );
}


