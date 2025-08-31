import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface VideoSectionRef {
  playVideo: () => void;
}

const VideoSection = forwardRef<VideoSectionRef>((props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (iframeRef.current) {
        // Send play command to YouTube iframe
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          'https://www.youtube.com'
        );
      }
    }
  }));

  return (
    <section id="video" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See What You'll Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            <span className="font-black text-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-yellow-500 bg-clip-text text-transparent tracking-wide">AI + Strategy + Heart</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <div className="w-full h-0 pb-[56.25%] relative">
                <iframe 
                  ref={iframeRef}
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/Vy0SY5EG2Go?enablejsapi=1&autoplay=0&mute=0" 
                  title="Business Event Overview Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/68b0ef3ed0963ea6a6823e1a_1756582126898_40ade8c3.webp" alt="AI Learning" className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Focused Learning</h3>
              <p className="text-gray-600">Intensive workshops that merge human insight with AI Powered workflows giving you strategies you can apply instantly.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756593891727_e336014c.png" alt="Technology and Enhanced Community" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Technology Enhanced Community</h3>
              <p className="text-gray-600">Forge meaningful connections with innovators and leaders while leveraging AI to identify the right opportunities and partnerships.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src="https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756594091181_2e5385d7.png" 
                  alt="Purpose and Scale Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Purpose + Scale</h3>
              <p className="text-gray-600">Take smarter action harness the power of human expertise and AI innovation to implement changes that scale your business faster.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

VideoSection.displayName = 'VideoSection';

export default VideoSection;