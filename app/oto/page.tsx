"use client";
import Providers from "../providers";
import OTO from "../../src/pages/OTO";
import React from "react";

export default function OtoPage() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <Providers>
      <OTO />
    </Providers>
  );
}


