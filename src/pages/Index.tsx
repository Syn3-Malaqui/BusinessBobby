"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

const Index: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReturningFromCheckout, setIsReturningFromCheckout] = useState(false);

  useEffect(() => {
    // Check if user is returning from Stripe checkout (multiple detection methods)
    let returningFromCheckout = false;

    // Method 1: Check URL parameter (when Stripe redirects with canceled=true)
    if (searchParams.get('canceled') === 'true') {
      console.log('User returned from canceled Stripe checkout (URL parameter detected)');
      returningFromCheckout = true;
      
      // Remove the canceled parameter from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('canceled');
      
      // Replace the current URL without the canceled parameter
      router.replace(newUrl.pathname + newUrl.search);
    }

    // Method 2: Check referrer (when browser back button is used)
    if (document.referrer && document.referrer.includes('checkout.stripe.com')) {
      console.log('User returned from Stripe checkout (referrer detected)');
      returningFromCheckout = true;
    }

    // Method 3: Check if we came from a checkout page in the same session
    const wasOnCheckoutPage = sessionStorage.getItem('wasOnCheckoutPage');
    if (wasOnCheckoutPage === 'true') {
      console.log('User returned from checkout page (session storage detected)');
      returningFromCheckout = true;
      // Clear the flag
      sessionStorage.removeItem('wasOnCheckoutPage');
    }

    // Method 3.5: Check URL parameter for checkout navigation
    if (searchParams.get('goingToCheckout') === 'true') {
      console.log('User is going to checkout (URL parameter detected)');
      // Clear this parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('goingToCheckout');
      router.replace(newUrl.pathname + newUrl.search);
    }

    // Method 4: Check browser history length to detect back navigation
    if (window.history.length > 1 && !returningFromCheckout) {
      // If we have history and no other method detected, check if we might be returning from checkout
      const currentUrl = window.location.href;
      const hasCheckoutInHistory = sessionStorage.getItem('checkoutUrl');
      
      if (hasCheckoutInHistory && hasCheckoutInHistory !== currentUrl) {
        console.log('User likely returned from checkout (history analysis)');
        returningFromCheckout = true;
        sessionStorage.removeItem('checkoutUrl');
      }
    }

    setIsReturningFromCheckout(returningFromCheckout);
  }, [searchParams, router]);

  return (
    <AppProvider>
      <AppLayout isReturningFromCheckout={isReturningFromCheckout} />
    </AppProvider>
  );
};

export default Index;
