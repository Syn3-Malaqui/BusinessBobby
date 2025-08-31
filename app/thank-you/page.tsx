"use client";
import Providers from "../providers";
import ThankYou from "../../src/pages/ThankYou";
import React from "react";

export default function ThankYouPage() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <Providers>
      <ThankYou />
    </Providers>
  );
}


