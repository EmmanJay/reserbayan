'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
          <Link href="/" className={`relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            Home
          </Link>

          {/* THIS IS YOUR NEW GRID LAYOUT PAGE */}
          <Link href="/documents" className={`relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/documents' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/documents' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            Documents
          </Link>

          <Link href="/about" className={`relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/about' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/about' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            About
          </Link>
          <Link href="/faq" className={`relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/faq' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/faq' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            FAQ
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleLoginClick}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 border border-gray-300 transition-colors"
            suppressHydrationWarning={true}
          >
            Log In
          </button>
          <button
            onClick={handleSignUpClick}
            className="bg-[#004AAD] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#003A88] transition-colors"
            suppressHydrationWarning={true}
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
            <Link href="/" className={`block relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              Home
            </Link>
            <Link href="/documents" className={`block relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/documents' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/documents' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              Documents
            </Link>
            <Link href="/about" className={`block relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/about' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/about' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              About
            </Link>
            <Link href="/faq" className={`block relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/faq' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/faq' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              FAQ
            </Link>
            <div className="pt-4 space-y-2">
              <button
                onClick={handleLoginClick}
                className="block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 border border-gray-300 transition-colors text-center"
                suppressHydrationWarning={true}
              >
                Log In
              </button>
              <button
                onClick={handleSignUpClick}
                className="block bg-[#004AAD] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#003A88] transition-colors text-center"
                suppressHydrationWarning={true}
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