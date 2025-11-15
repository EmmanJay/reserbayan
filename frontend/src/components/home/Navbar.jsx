'use client';

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignUpClick = () => {
    // Dispatch custom event to show signup container
    window.dispatchEvent(new CustomEvent('showSignUp'));
  };

  const handleLoginClick = () => {
    // Dispatch custom event to show login container
    window.dispatchEvent(new CustomEvent('showLogin'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <Image
            src="/reserbayan-logo.png"
            alt="ReserBayan Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-xl font-semibold text-gray-900">ReserBayan</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          
          {/* THIS IS YOUR MAIN HOMEPAGE (HeroSection) */}
          <Link href="/" className="text-gray-700 hover:text-gray-900 font-semibold">
            Home
          </Link>
          
          {/* THIS IS YOUR NEW GRID LAYOUT PAGE */}
          <Link href="/documents" className="text-gray-700 hover:text-gray-900 font-semibold">
            Documents 
          </Link>
          
          <Link href="/about" className="text-gray-700 hover:text-gray-900 font-semibold">
            About
          </Link>
          <Link href="/faq" className="text-gray-700 hover:text-gray-900 font-semibold">
            FAQ
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleLoginClick}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={handleSignUpClick}
            className="bg-[#004AAD] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#003A88] transition-colors"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-8 py-4 space-y-4">
            <Link href="/" className="block text-gray-700 hover:text-gray-900 font-semibold">
              Home
            </Link>
            <Link href="/documents" className="block text-gray-700 hover:text-gray-900 font-semibold">
              Documents
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-gray-900 font-semibold">
              About
            </Link>
            <Link href="/contacts" className="block text-gray-700 hover:text-gray-900 font-semibold">
              FAQ
            </Link>
            <div className="pt-4 space-y-2">
              <button
                onClick={handleLoginClick}
                className="block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 border border-gray-300 transition-colors text-center"
              >
                Log In
              </button>
              <button
                onClick={handleSignUpClick}
                className="block bg-[#004AAD] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#003A88] transition-colors text-center"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}