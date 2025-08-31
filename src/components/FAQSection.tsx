import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Who should attend Serve to Scale?",
    answer: "Business owners, healthcare and financial professionals, and veteran/senior service leaders who want to scale faster using the power of AI tools + human expertise. If you serve seniors, veterans, or families and want to grow with purpose, this event is for you."
  },
  {
    question: "How is this event different from other business workshops?",
    answer: "Most workshops teach theory. Serve to Scale blends hands-on AI strategies with real-world human expertise from top entrepreneurs and industry leaders. You'll leave with systems, scripts, and tech you can implement right away."
  },
  {
    question: "Do I need to be tech-savvy to benefit?",
    answer: "Not at all. We designed the sessions so any business owner can implement AI, even if you're not \"techy.\" You'll be guided step by step with examples and support."
  },
  {
    question: "What do I get with my ticket?",
    answer: "Depending on your ticket tier, you'll receive:\n\n• Access to AI-powered sales & marketing workshops\n• NCPC mastermind sessions (for members)\n• Leadership + AI impact panels\n• Media & branding opportunities\n• AI-enhanced headshots & swag\n• Networking with experts and peers\n• The chance to give back — every ticket supports the Rocky Mountain Service Dog Project"
  },
  {
    question: "Will there be opportunities to connect with speakers and peers?",
    answer: "Yes! You'll have live networking sessions with senior and veteran experts, plus opportunities to connect directly with AI strategists, business leaders, and fellow attendees."
  },
  {
    question: "Can I attend virtually?",
    answer: "Yes. We offer hybrid options so you can join in person at Hilton Garden Inn, Ogden, UT, or online from anywhere."
  },
  {
    question: "Will AI replace the human element?",
    answer: "No — and that's the point. We believe AI should amplify human expertise, not replace it. At Serve to Scale, you'll learn how to combine AI automation with the heart, wisdom, and personal touch that clients truly value."
  },
  {
    question: "Why is Serve to Scale partnered with the Rocky Mountain Service Dog Project?",
    answer: "Because we believe scaling with purpose means giving back. The Rocky Mountain Service Dog Project trains and provides service dogs to veterans and individuals with disabilities, empowering them to live with independence, confidence, and dignity. Every ticket sold at Serve to Scale helps fund this mission."
  },
  {
    question: "How does my ticket make an impact?",
    answer: "A portion of every ticket purchased goes directly to the Rocky Mountain Service Dog Project. That means when you attend, you're not just growing your business — you're also supporting veterans and community members who depend on service dogs for daily life."
  },
  {
    question: "Will I get to meet the Service Dogs at the event?",
    answer: "Yes! The Rocky Mountain Service Dog Project will have a presence at Serve to Scale, and you'll have the chance to see firsthand the amazing work they do. It's a reminder that business growth isn't just about profit — it's about creating lasting impact."
  }
];

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🔹 Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  ❓ {item.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;