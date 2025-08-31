import React from 'react';

const HeroSection: React.FC = () => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="absolute inset-0 bg-black/20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756426101876_15cbf8f7.webp')`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Serve Bigger. <span className="text-yellow-400">Scale Faster.</span> Build a Legacy that Lasts.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              A two-day business event where purpose meets profit—and your service becomes your superpower.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-sm">✓</span>
                </div>
                <span className="text-lg">Proven playbooks you can implement immediately</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-sm">✓</span>
                </div>
                <span className="text-lg">Hands-on sessions with 7-figure builders</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-sm">✓</span>
                </div>
                <span className="text-lg">Actionable IntelliFlows included</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={scrollToPricing}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all transform hover:scale-105 shadow-lg"
              >
                Buy Tickets Now
              </button>
              <button 
                onClick={() => document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all"
              >
                Watch Video
              </button>
            </div>
          </div>

          <div className="lg:block">
            {/* Mobile version - shows below hero text */}
            <div className="lg:hidden mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-center text-white mb-6">
                <h3 className="text-xl font-bold mb-2">October 23-24, 2025</h3>
                <p className="text-blue-200">Hilton Ogden, Utah</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-white">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">500+</div>
                  <div className="text-xs text-blue-200">Member Companies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">12</div>
                  <div className="text-xs text-blue-200">Impactful Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">2</div>
                  <div className="text-xs text-blue-200">Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">Over $7,500</div>
                  <div className="text-xs text-blue-200">Value</div>
                </div>
              </div>
              
              {/* Logo and Donation Message */}
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <div className="mb-3">
                  <img 
                    src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756581711324_3917c748.png" 
                    alt="Rocky Mountain Service Dog Project Logo" 
                    className="w-16 h-16 mx-auto rounded-lg"
                  />
                </div>
                <p className="text-xs text-blue-200">
                  A portion of all proceeds go to<br />
                  <span className="font-semibold text-white">Rocky Mountain Service Dog Project</span>
                </p>
              </div>
            </div>

            {/* Desktop version - shows on right side */}
            <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center text-white mb-6">
                <h3 className="text-2xl font-bold mb-2">October 23-24, 2025</h3>
                <p className="text-blue-200">Hilton Ogden, Utah</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center text-white">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-blue-200">Member Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">12</div>
                  <div className="text-sm text-blue-200">Impactful Sessions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">2</div>
                  <div className="text-sm text-blue-200">Days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">Over $7,500</div>
                  <div className="text-sm text-blue-200">Value</div>
                </div>
              </div>
              
              {/* Logo and Donation Message */}
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <div className="mb-3">
                  <img 
                    src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756581711324_3917c748.png" 
                    alt="Rocky Mountain Service Dog Project Logo" 
                    className="w-20 h-20 mx-auto rounded-lg"
                  />
                </div>
                <p className="text-sm text-blue-200">
                  A portion of all proceeds go to<br />
                  <span className="font-semibold text-white">Rocky Mountain Service Dog Project</span>
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;