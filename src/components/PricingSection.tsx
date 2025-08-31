import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PricingSection: React.FC = () => {
  const tiers = [
    {
      name: 'General Admission',
      price: '$199',
      originalPrice: '$797',
      description: 'Perfect for entrepreneurs ready to scale',
      features: [
        'Full Access to 2-Day Event Sessions & Workshops',
        'Networking with 200+ Business Owners Serving Seniors & Veterans',
        'Digital Workbook + Event Materials',
        'Partner Showcase Expo Access',
        'Free Lunch Both Days'
      ],
      popular: false,
      cta: 'Get General Access'
    },
    {
      name: 'VIP Experience',
      price: '$349',
      originalPrice: '$1,497',
      description: 'Maximum value with exclusive access',
      features: [
        'Professional Business Photo Shoot (1 edited headshot)',
        'NCPC SEO Statewide Membership Listing (Value $300)',
        'Preferred Seating in VIP Section',
        'Invitation to Evening Networking Mixer',
        'Full Access to 2-Day Event Sessions & Workshops',
        'Networking with 200+ Business Owners Serving Seniors & Veterans',
        'Digital Workbook + Event Materials',
        'Partner Showcase Expo Access',
        'Free Lunch Both Days'
      ],
      popular: true,
      cta: 'Go VIP Now'
    },
    {
      name: 'Platinum Elite',
      price: '$499',
      originalPrice: '$2,997',
      description: 'Ultimate transformation experience',
      features: [
        'AI Mastermind Certification Ticket (exclusive to Platinum)',
        'Professional Business Photo Shoot (3 edited headshots)',
        '2 Months of Mastermind Business Builder Membership (Value $798)',
        'NCPC SEO Nationwide Membership Listing (Value $700)',
        'VIP Lunch with Founders + Multi-Million Business Coaches',
        'Reserved Front-Row Seating & Early Access Check-in',
        'Exclusive Platinum Networking Hour with speakers & sponsors',
        'NCPC SEO Statewide Membership Listing (Value $300)',
        'Invitation to Evening Networking Mixer',
        'Full Access to 2-Day Event Sessions & Workshops',
        'Networking with 200+ Business Owners Serving Seniors & Veterans',
        'Digital Workbook + Event Materials',
        'Partner Showcase Expo Access',
        'Free Lunch Both Days'
      ],
      popular: false,
      cta: 'Join Elite Level'
    }
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');

  const isFormValid = useMemo(() => {
    const hasName = fullName.trim().length > 1;
    const hasPhone = contactNumber.trim().length > 6;
    const hasEmail = /.+@.+\..+/.test(email);
    return hasName && hasPhone && hasEmail;
  }, [fullName, contactNumber, email]);

  const handleOpenForTier = (tierName: string) => {
    setSelectedTier(tierName);
    setIsDialogOpen(true);
  };

  const handleProceed = () => {
    const origin = window.location.origin;
    const tierKey = (selectedTier || '').toLowerCase();
    let tier: 'general' | 'vip' | 'platinum' | null = null;
    if (tierKey.includes('general')) tier = 'general';
    else if (tierKey.includes('vip')) tier = 'vip';
    else if (tierKey.includes('platinum')) tier = 'platinum';

    if (!tier) {
      setIsDialogOpen(false);
      return;
    }

    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier,
        fullName,
        contactNumber,
        email,
        origin,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to create session');
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url as string;
        } else {
          setIsDialogOpen(false);
        }
      })
      .catch(() => {
        setIsDialogOpen(false);
      });
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Transformation Level
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Early bird pricing ends soon, book before October 1st and SAVE!
          </p>
          <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
            ⏰ Limited Time: Save up to 10%
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:transform hover:-translate-y-2 ${
                tier.popular ? 'ring-4 ring-yellow-400 relative' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="p-8">
                {tier.popular && <div className="mb-6"></div>}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-xl text-gray-500 line-through ml-2">{tier.originalPrice}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">One-time payment</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-white font-bold text-xs">✓</span>
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleOpenForTier(tier.name)}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    tier.popular 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700' 
                      : 'bg-gradient-to-r from-blue-900 to-blue-800 text-white hover:from-blue-800 hover:to-blue-700'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-5xl mx-auto border-2 border-yellow-200">
            <h3 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Our Sponsors
            </h3>
            <p className="text-xl text-gray-600 mb-10 font-medium">
              Powered by Partners who believe in purpose
            </p>
            
            {/* Scrolling sponsors container */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll-left space-x-8">
                {/* First set of sponsors */}
                <div className="flex space-x-8 min-w-max">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756589977435_c3fd9721.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756508260223_71498d57.png" 
                        alt="Affinity Advisory Network LLC" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Affinity Advisory</h4>
                    <p className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-serif tracking-wide">Gold Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756566856640_066296a2.png" 
                        alt="Rocky Mountain Service Dog Project" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Rocky Mountain Service Dog</h4>
                    <p className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-serif tracking-wide">Gold Sponsor/Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590955948_e64a907a.webp" 
                        alt="Pledge.AI Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Pledge.AI</h4>
                    <p className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-serif tracking-wide">Gold Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756591090996_f90c2b2d.png" 
                        alt="Beach Town Real Estate" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Beach Town Real Estate</h4>
                    <p className="text-base bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent font-semibold">Silver Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756591533093_d4d693d3.webp" 
                        alt="Commonwealth Insurance Advisors" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Commonwealth Insurance</h4>
                    <p className="text-base bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent font-semibold">Bronze Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590196692_4fa9a9bc.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590196692_4fa9a9bc.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590198399_7bd7cdeb.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590200183_8a39d5bc.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                </div>
                
                {/* Duplicate set for seamless loop */}
                <div className="flex space-x-8 min-w-max">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590201950_59820938.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756508260223_71498d57.png" 
                        alt="Affinity Advisory Network LLC" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Affinity Advisory</h4>
                    <p className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-serif tracking-wide">Gold Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756566856640_066296a2.png" 
                        alt="Rocky Mountain Service Dog Project" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Rocky Mountain Service Dog</h4>
                     <p className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-serif tracking-wide">Gold Sponsor/Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590955948_e64a907a.webp" 
                        alt="Pledge.AI Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Pledge.AI</h4>
                    <p className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-serif tracking-wide">Gold Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756591090996_f90c2b2d.png" 
                        alt="Beach Town Real Estate" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Beach Town Real Estate</h4>
                    <p className="text-base bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent font-semibold">Silver Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756591533093_d4d693d3.webp" 
                        alt="Commonwealth Insurance Advisors" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Commonwealth Insurance</h4>
                    <p className="text-base bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent font-semibold">Bronze Sponsor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590196692_4fa9a9bc.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590198399_7bd7cdeb.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590200183_8a39d5bc.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756590201950_59820938.webp" 
                        alt="Coming Soon Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">Coming Soon</h4>
                    <p className="text-base text-gray-600">New Partner</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

      {/* Purchase dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your purchase</DialogTitle>
            <DialogDescription>
              {selectedTier ? `Selected: ${selectedTier}` : 'Select a tier to continue.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" placeholder="(555) 123-4567" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleProceed} disabled={!isFormValid}>
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PricingSection;