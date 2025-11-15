'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardCheck, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import SignUpContainer from '@/components/auth/SignUpContainer';

export default function AboutSection() {
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

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold leading-tight bg-gradient-to-r from-[#1E2566] via-[#2F87C3] to-[#1E2566] bg-clip-text text-transparent mb-8 animate-fade-in">
            About ReserBayan
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed mb-4">
            Revolutionizing barangay document requests with digital innovation and community-focused solutions.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <div className="space-y-6 flex flex-col justify-center">
              <p className="text-xl leading-relaxed text-neutral-700 dark:text-neutral-300">
                ReserBayan is a cutting-edge online platform designed to streamline the process of requesting essential barangay documents for Filipino residents.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Born from the need to eliminate long queues and bureaucratic hurdles, our system empowers citizens with convenient, secure, and transparent access to government services.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                By leveraging digital technology, we bridge the gap between traditional administrative processes and modern expectations, ensuring that every resident can obtain necessary documents efficiently while promoting accountability and accessibility in local governance.
              </p>
            </div>
            <div className="relative flex items-center">
              <div className="bg-gradient-to-br from-[#1E2566] to-[#2F87C3] rounded-2xl p-8 text-white shadow-2xl w-full h-full flex items-center">
                <div className="text-center w-full">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h3 className="text-2xl font-bold mb-2">Digital Innovation</h3>
                  <p className="text-gray-200">Transforming traditional processes into modern digital experiences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-center mb-16 text-neutral-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Browse Documents</h3>
              <p className="text-neutral-600 leading-relaxed">Explore available barangay documents and select what you need.</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ClipboardCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Learn Requirements</h3>
              <p className="text-neutral-600 leading-relaxed">Review the specific requirements and documents needed for your request.</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Submit a Request</h3>
              <p className="text-neutral-600 leading-relaxed">Upload required documents and submit your request online.</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-[#004AAD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-800">Track Status</h3>
              <p className="text-neutral-600 leading-relaxed">Monitor your request progress in real-time from submission to completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-neutral-800 mb-4">Our Purpose</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">Driving innovation in local governance through technology and community empowerment</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-neutral-800">Vision</h2>
              </div>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                The platform aims to modernize barangay services by making government support accessible to all Filipino residents. We envision a future where digital innovation eliminates barriers, fosters transparency, and promotes efficient processes that serve the community's needs effectively.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[#2F87C3] to-[#1E2566] w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-neutral-800">Mission</h2>
              </div>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                To empower citizens through digital processing of barangay documents, providing fast, reliable, and optimized service delivery. We are committed to reducing time spent in physical queues and enhancing the overall experience of accessing essential government services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-r from-[#0B1D4E] via-[#1E2566] to-[#0B1D4E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of barangay documents and experience the convenience of digital processing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/homepage">
              <Button className="bg-gradient-to-r from-[#004AAD] to-[#2F87C3] hover:from-[#003A88] hover:to-[#1E2566] text-white px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                View Documents
              </Button>
            </Link>
            <Button
              onClick={handleSignUpClick}
              className="bg-white text-[#0B1D4E] hover:bg-gray-100 px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white hover:border-gray-200"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </section>

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50">
          <div className="flex items-center justify-center min-h-full p-4">
            <SignUpContainer onClose={handleCloseSignUp} />
          </div>
        </div>
      )}
    </div>
  );
}