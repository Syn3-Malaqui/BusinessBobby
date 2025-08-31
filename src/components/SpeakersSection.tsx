import React from 'react';

const SpeakersSection: React.FC = () => {
  const speakers = [
    {
      name: 'Robert L. Hall, CRFA',
      title: 'CEO & Partner, National Care Planning Council',
      bio: 'Robert L. Hall, CRFA is a self-made entrepreneur and financial strategist who has more than a Billion Dollars of financial sales under his belt! He started his first company at the age of 19 and has successfully built and exited many times over. With nearly two decades of experience, he now mentors entrepreneurs and professionals on creating financial freedom, building scalable businesses, and leaving lasting legacies.',
      image: 'https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756443571452_a8d3adf9.png',
      expertise: 'Scaling & Operations'
    },
    {
      name: 'Lady Bautista, FAACM, CEEAA, RPT, GN, NDCCP, CLRP, NDCCPT, MBA',
      title: 'CMO & Partner, National Care Planning Council',
      bio: 'Lady Michelle Servillas, RPT, GN, FAACM, NCCDP, CEAA, CLRP, is a world-renowned Physical Therapist turned entrepreneur and AI strategist who built multiple successful home health companies before pioneering the use of AI to help healthcare and senior service businesses scale. A three-time Force for Good Awardee, she empowers entrepreneurs, healthcare professionals, and  leaders to integrate AI into marketing, operations, and engagement — proving her mantra true: "If you\'re not using AI, you\'re not scaling."',
      image: 'https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756433539819_32e509fc.jpg',
      expertise: 'Business Coach and HHC Compliance & Consulting'
    },
    {
      name: 'Darshpreet Singh, MBA',
      title: 'CEO and AI Strategist Pledge.ai, Optume.ai',
      bio: 'Darshpreet Singh is a dynamic entrepreneur and accomplished executive, steering innovation at the intersection of AI, technology, and business operations. Darsh empowers businesses and individuals to optimize their online presence through cutting-edge AI Engine Optimization (AEO) tools and strategies.\n\nFounder of pledge.ai, optume.ai, with over 17 years of professional experience spanning corporates and startups, Darshpreet brings a unique blend of strategic vision, operational excellence, and data-driven decision-making. His expertise in Agile methodologies has driven seamless transitions and operational improvements for globally recognized organizations like Oracle and Bell, where he served in pivotal program management and agile consulting roles.\n\nCertified in SAFe Agile, Scrum Master, and Six Sigma Green Belt, Darshpreet has mastered the art of blending technical acumen with leadership finesse. His MBA, combined with various certifications including instructional design, underscores his passion for continuous learning and impactful communication.',
      image: 'https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756444885685_1ad49f6a.png',
      expertise: 'Leadership, Mindset and the AI Opportunity'
    },
    {
      name: 'Hannah Turk, CLRP',
      title: 'Director of external operations, National Care Planning Council',
      bio: 'Hannah Turk is a nationally recognized veteran advocate, nonprofit leader, and business strategist, serving as the Co-Owner and Executive Leader of the National Care Planning Council. She is deeply committed to honoring veterans and strengthening the communities that support them, leveraging both her professional expertise and her heart for service.\n\nHannah currently serves as Vice President, Board Member, and Fundraising Lead of the Utah Agent Orange Veterans Foundation, where she works tirelessly to raise awareness and resources for Vietnam-era veterans and their families. She is also the Co-Founder and Vice President of The Rivetin\' Rosies Project, empowering women to lead initiatives that improve the lives of veterans and seniors.\n\nIn addition, Hannah sits on the Board of Directors for the Rocky Mountain Service Dog Project as Family Liaison, helping veterans and families access service dogs that restore freedom and independence. Her community leadership also extends to civic service as a Member of the Sunset City Veterans Day Program Planning Commission.\n\nDedicated to suicide prevention, Hannah is a Licensed QPR Instructor and QPR Certified, offering free training through her nonprofits to veterans and first responders. Recognized for her visionary leadership and unwavering advocacy, Hannah continues to inspire others by showing how purpose-driven leadership can transform communities, uplift families, and honor those who have served our nation.',
      image: 'https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756507600442_14a962f1.png',
      expertise: 'Network & Marketing'
    },
    {
      name: 'Jed Winegar, CLRP, VA Accredited Claims Agent',
      title: 'Director of Operations, National Care Planning Council',
      bio: 'Jed Winegar is the Director of Operations for the National Care Planning Council, where he streamlines systems and strategies to help members grow and scale. With a passion for efficiency and mission-driven impact, he ensures NCPC\'s work empowers businesses serving seniors and veterans nationwide.',
      image: 'https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756586020282_50de64ca.png',
      expertise: 'Operations & Systems'
    },
    {
      name: 'Laura Fish',
      title: 'Director of Advertising, Affinity Advisory Network',
      bio: 'Laura Fish is the Director of Advertising for Affinity Advisory Network with over 25 years of marketing and branding experience. For more than a decade, she has led Affinity\'s advertising strategy, using the power of storytelling to help families and business owners secure their futures and build lasting legacies.',
      image: 'https://d64gsuwffb70l.cloudfront.net/6823d61ae55277534067f436_1756587026227_742c736a.png',
      expertise: 'Marketing & Advertising'
    }
  ];

  return (
    <section id="speakers" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Learn from Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get direct access to successful entrepreneurs and experts who've built, scaled, and exited multiple businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakers.map((speaker, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2"
            >
              <div className="text-center mb-6">
                <img 
                  src={speaker.image}
                  alt={speaker.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {speaker.name}
                </h3>
                <p className="text-blue-900 font-semibold mb-2">
                  {speaker.title}
                </p>
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {speaker.expertise}
                </span>
              </div>
              <p className="text-gray-600 text-center leading-relaxed">
                {speaker.bio}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default SpeakersSection;