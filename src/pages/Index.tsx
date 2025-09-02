"use client";
import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

const Index: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // If user is returning from canceled Stripe checkout, clear the URL parameter
    // to prevent any unwanted modal popups
    if (searchParams.get('canceled') === 'true') {
      // Remove the canceled parameter from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('canceled');
      
      // Replace the current URL without the canceled parameter
      // This prevents the modal from showing and gives a clean landing page experience
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;
