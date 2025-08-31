import React from 'react';

const LearnSection: React.FC = () => {
  const dayOne = [
    'Serve Bigger Scale Smarter',
    'AI Foundations for Business Owners',
    'Systems that Scale',
    'Marketing with Heart and AI',
    'The Money Multiplier',
    'Collaboration that Scales'
  ];

  const dayTwo = [
    'The Heart of Scaling',
    'AI in the Real World',
    'Systems + Partnerships = Legacy',
    'Legacy in Action',
    'Extended Learning Session 2nd half of day 2 with Jed Winegar, CLRP, VA Accredited Claims Agent and Hannah Turk, CLRP'
  ];

  return (
    <section id="learn" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What You'll Learn
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive curriculum designed to transform your business from the ground up, with actionable strategies you can implement immediately.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Day One: Building Your Foundation - HEART + SYSTEMS + COMMUNITY</h3>
            </div>
            <ul className="space-y-4">
              {dayOne.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-blue-900 font-bold text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Day Two: Heart + AI in Action</h3>
            </div>
            <ul className="space-y-4">
              {dayTwo.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-blue-900 font-bold text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Bonus Business Coaching Call
            </h3>
            <p className="text-lg mb-6 opacity-90">
              After the conference schedule your <span className="animate-pulse bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent font-bold text-xl drop-shadow-lg shadow-blue-400/50 glow-text">free call</span> with Robert for Building a business of value, with Lady for Business coaching and how to Scale your business or with Darsh for AI business integration
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🔥 Hot Seat Coaching</h4>
                <p className="text-sm opacity-90">Get personalized feedback on your biggest business challenges</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💡 Innovation Lab</h4>
                <p className="text-sm opacity-90">Brainstorm breakthrough ideas with fellow entrepreneurs</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Action Planning</h4>
                <p className="text-sm opacity-90">Create your 90-day roadmap with expert guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnSection;