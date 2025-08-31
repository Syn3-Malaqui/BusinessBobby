import React from 'react';

const ContactSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Event Details & Location
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in the heart of Los Angeles for two days that will transform your business forever.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">📅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Date & Time</h4>
                    <p className="text-gray-600">October 23-24, 2025</p>
                    <p className="text-gray-600">10:00 AM - 5:00 PM both days</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Venue</h4>
                    <p className="text-gray-600">Hilton Ogden, Utah</p>
                    <p className="text-gray-600">2271 S. Washington Blvd.</p>
                    <p className="text-gray-600">Ogden, UT 84401</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">🚗</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Parking</h4>
                    <p className="text-gray-600">Complimentary parking available</p>
                    <p className="text-gray-600">Multiple nearby parking structures</p>
                  </div>
                </div>


              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Questions?</h3>
              <p className="mb-4">Our team is here to help make your experience amazing.</p>
              <div className="space-y-2">
                <p>📧 hannah@longtermcarelink.net</p>
                <p>📞 1-800-989-8137</p>
                <p>💬 Live chat available 24/7</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 rounded-2xl p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Location Map</h3>
              <div className="rounded-lg h-64 mb-6 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3030.123!2d-111.9734!3d41.2230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x875293e8b8b8b8b8%3A0x1234567890abcdef!2sHilton%20Garden%20Inn%20Ogden%20Downtown%2C%202271%20S%20Washington%20Blvd%2C%20Ogden%2C%20UT%2084401!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus&markers=color:red%7Clabel:H%7C41.2230,-111.9734"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hilton Ogden Utah - 2271 S. Washington Blvd., Ogden, UT 84401"
                ></iframe>
              </div>
              
              <button
                onClick={() => {
                  const destination = "2271 S. Washington Blvd., Ogden, UT 84401";
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
                  window.open(url, '_blank');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mb-6"
              >
                <span>🧭</span>
                <span>Get Directions</span>
              </button>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Transportation Options</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl mb-2">✈️</div>
                     <p className="text-sm font-semibold">SLC</p>
                    <p className="text-xs text-gray-600">39 min drive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-gray-600 mb-6">
              Don't wait - seats are filling up fast and early bird pricing ends soon.
            </p>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105"
            >
              Secure Your Spot Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;