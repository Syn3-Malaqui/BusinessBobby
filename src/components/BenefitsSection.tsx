import React from 'react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756594332777_15849d08.webp',
      title: 'My Personal AI Assistant',
      description: 'Your business growth partner-Automated, Intelligent, and Unstoppable.'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756594333543_91f77a5b.webp',
      title: 'MoneyMaker Funnels',
      description: 'Install simple funnels, upsells, and referral engines that compound.'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756594334268_3fd5f18c.webp',
      title: 'IntelliFlows',
      description: 'Automations that save hours and keep your brand on-message.'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756594334971_0d5b9070.webp',
      title: 'Prospecting Cheat Code',
      description: 'Proven strategies to increase lead conversions and reduce wasted time on prospecting.'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756594335717_51f240a1.webp',
      title: 'MEGA Vault',
      description: 'we speak in terabytes not gigabytes, preserve and protect it all in your own personal vault.'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756594336472_2c9303a9.webp',
      title: 'My AI Army',
      description: 'Deploy your own army of AI Agents and delegate tasks to reduce personal workload and increase time efficiency.'
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Business in Just 2 Days
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Walk away with actionable strategies, proven systems, and the confidence to scale your impact and your income with the knowledge you will learn from our 7 figure Entrepreneurs and your new AI Suite.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center mb-6">
                <img src={benefit.icon} alt={benefit.title} className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">
              If you can imagine it, You can build it! Learn how to add our <span className="text-white">Imaginpreneur Studio</span> AI powered creator app
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>Web Apps</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>Phone Apps</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>Business Tools</span>
              </div>
            </div>
          </div>
          
          {/* Second S.W.O.T Analysis Section */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white mt-8">
            <h3 className="text-2xl font-bold mb-4">
              Plus, Get a free S.W.O.T Analysis on your business after the event
            </h3>
            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>STRENGTHS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>WEAKNESSES</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>OPPORTUNITIES</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold">✓</span>
                </div>
                <span>THREATS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;