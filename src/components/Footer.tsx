import React from 'react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl">BusinessEvent</span>
            </div>
            <p className="text-gray-400 mb-6">
              Transforming businesses through purpose-driven events and actionable strategies.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors">
                <span>🐦</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors">
                <span>📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors">
                <span>💼</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><button onClick={() => document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors">Event Video</button></li>
              <li><button onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors">Benefits</button></li>
              <li><button onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors">Curriculum</button></li>
              <li><button onClick={() => document.getElementById('speakers')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors">Speakers</button></li>
              <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Event Info</h4>
            <ul className="space-y-3 text-gray-400">
              <li>📅 October 23-24, 2025</li>
              <li>📍 Hilton Ogden, Utah</li>
              <li>⏰ 10:00 AM - 5:00 PM</li>
              <li>🎫 Limited Seating</li>
              <li>🏨 Hotel Partnerships Available</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li>📧 hannah@longtermcarelink.net</li>
              <li>📞 1-800-989-8137</li>
              <li>💬 24/7 Live Chat</li>
              <li>📍 2271 S. Washington Blvd., Ogden, Utah 84401</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 text-sm text-gray-400 mb-4 md:mb-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 BusinessEvent. All rights reserved.
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={scrollToTop}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all"
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;