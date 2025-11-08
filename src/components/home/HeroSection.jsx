'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import SignUpContainer from '@/components/auth/SignUpContainer';

export default function HeroSection() {
  const [showSignUp, setShowSignUp] = useState(false);

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  useEffect(() => {
    const handleShowSignUp = () => {
      setShowSignUp(true);
      // Switch to signup tab
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToSignup'));
      }, 100);
    };

    const handleShowLogin = () => {
      setShowSignUp(true);
      // Switch to login tab
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      }, 100);
    };

    window.addEventListener('showSignUp', handleShowSignUp);
    window.addEventListener('showLogin', handleShowLogin);

    return () => {
      window.removeEventListener('showSignUp', handleShowSignUp);
      window.removeEventListener('showLogin', handleShowLogin);
    };
  }, []);
  return (
    <section className="bg-[#FAF9F6] pt-32 pb-20 px-8 min-h-[100vh] relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column - Text Content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#1E2566] to-[#2F87C3] bg-clip-text text-transparent">
            Streamlined Document Requests for Every Residents
          </h1>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl" style={{letterSpacing:"-.1px"}}>
            Experience hassle-free government document processing with <span className="font-semibold">ReserBayan</span>. <span className="font-semibold">Quick</span>, <span className="font-semibold">secure</span> and designed for the community.
          </p>

          <p className="text-base text-g ray-600 font-medium leading-relaxed" style={{letterSpacing:"-.1px"}}>
            Documents such as <span className="font-semibold text-[#1E2566]">Cedula</span>, <span className="font-semibold text-[#1E2566]">Barangay Certificate</span>, <span className="font-semibold text-[#1E2566]">Certificate of Indigency</span> and many more!
          </p>

          <ul className="space-y-2">
            <li className="flex items-center space-x-3">
              <Check className="text-[#1CC88A] w-5 h-5" />
              <span className="text-gray-800 font-medium">On the day - 24 hours processing time</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="text-[#1CC88A] w-5 h-5" />
              <span className="text-gray-800 font-medium">Real time status checking</span>
            </li>
          </ul>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('showSignUp'))}
            className="bg-[#004AAD] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#003A88] transition-colors"
          >
            Start requesting now!
          </button>
        </div>

        {/* Right Column - Image Section */}
        <div className="relative min-h-[600px] flex items-center justify-center">
          {!showSignUp ? (
            <div className="flex justify-center items-end w-full transition-opacity duration-500 ease-in-out">
              <Image
                src="/documents/certificate-of-indigency.png"
                alt="Certificate of Indigency"
                className="w-[220px] md:w-[260px] -mr-35 rounded-xl shadow-lg z-10 transition-transform hover:scale-105"
                width={260}
                height={340}
              />
              <Image
                src="/documents/first-time-jobseeker.png"
                alt="First Time Job Seeker"
                className="w-[260px] md:w-[300px] -mr-35 rounded-xl shadow-xl z-20 transition-transform hover:scale-105"
                width={300}
                height={380}
              />
              <Image
                src="/documents/barangay-clearance.png"
                alt="Barangay Clearance"
                className="w-[300px] md:w-[360px] rounded-xl shadow-2xl z-30 transition-transform hover:scale-105"
                width={360}
                height={440}
                priority
              />
            </div>
          ) : (
            <div className="w-full max-w-[650px] transition-opacity duration-500 ease-in-out">
              <SignUpContainer onClose={handleCloseSignUp} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}