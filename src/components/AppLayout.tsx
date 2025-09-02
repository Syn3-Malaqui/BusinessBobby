"use client";
import React, { useRef } from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import VideoSection, { VideoSectionRef } from './VideoSection';
import BenefitsSection from './BenefitsSection';
import LearnSection from './LearnSection';
import SpeakersSection from './SpeakersSection';
import PricingSection from './PricingSection';
import ContactSection from './ContactSection';
import FAQSection from './FAQSection';
import Footer from './Footer';

interface AppLayoutProps {
  isReturningFromCheckout?: boolean;
  resetCheckoutState: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ isReturningFromCheckout = false, resetCheckoutState }) => {
  const videoSectionRef = useRef<VideoSectionRef>(null);

  const handleVideoPlay = () => {
    // Scroll to video section
    document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' });
    // Play video after a short delay to ensure scrolling is complete
    setTimeout(() => {
      videoSectionRef.current?.playVideo();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation onVideoPlay={handleVideoPlay} />
      <HeroSection />
      <VideoSection ref={videoSectionRef} />
      <BenefitsSection />
      <LearnSection />
      <SpeakersSection />
      <PricingSection 
        isReturningFromCheckout={isReturningFromCheckout} 
        resetCheckoutState={resetCheckoutState}
      />
      <ContactSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default AppLayout;
