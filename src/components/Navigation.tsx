import React, { useState, useEffect } from 'react';

interface NavigationProps {
  onVideoPlay?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onVideoPlay }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleVideoClick = () => {
    setIsOpen(false);
    if (onVideoPlay) {
      onVideoPlay();
    } else {
      scrollToSection('video');
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg py-2' : 'bg-white py-4'
    }`}>
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-xl text-gray-900">BusinessEvent</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button onClick={handleVideoClick} className="text-gray-700 hover:text-blue-900 transition-colors">
            Video
          </button>
          <button onClick={() => scrollToSection('benefits')} className="text-gray-700 hover:text-blue-900 transition-colors">
            Benefits
          </button>
          <button onClick={() => scrollToSection('learn')} className="text-gray-700 hover:text-blue-900 transition-colors">
            What You'll Learn
          </button>
          <button onClick={() => scrollToSection('speakers')} className="text-gray-700 hover:text-blue-900 transition-colors">
            Speakers
          </button>
          <button onClick={() => scrollToSection('pricing')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all">
            Buy Tickets Now
          </button>
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-gray-900 transition-all ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-900 mt-1 transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-900 mt-1 transition-all ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden">
            <div className="flex flex-col p-4 space-y-4">
              <button onClick={handleVideoClick} className="text-left text-gray-700 hover:text-blue-900">Video</button>
              <button onClick={() => scrollToSection('benefits')} className="text-left text-gray-700 hover:text-blue-900">Benefits</button>
              <button onClick={() => scrollToSection('learn')} className="text-left text-gray-700 hover:text-blue-900">What You'll Learn</button>
              <button onClick={() => scrollToSection('speakers')} className="text-left text-gray-700 hover:text-blue-900">Speakers</button>
              <button onClick={() => scrollToSection('pricing')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold text-center">
                Buy Tickets Now
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
