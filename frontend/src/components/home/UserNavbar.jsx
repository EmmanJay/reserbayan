'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogOut, User, FileText, Bell, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    // Dispatch custom event to update navbar wrapper
    window.dispatchEvent(new CustomEvent('userLogout'));
    window.location.href = '/';
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

        {/* Desktop Navigation (after user logs in) */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/documents" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/documents' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/documents' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            <FileText size={18} />
            Documents
          </Link>
          <Link href="/notifications" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/notifications' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/notifications' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            <Bell size={18} />
            Notifications
          </Link>
          <Link href="/requests" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/requests' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/requests' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            <ClipboardList size={18} />
            Requests
          </Link>
          <Link href="/profile" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/profile' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/profile' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
            <User size={18} />
            My Profile
          </Link>
        </nav>

        {/* Desktop User Info and Logout */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="font-medium">{user.firstName} {user.lastName}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
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
            <Link href="/documents" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/documents' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/documents' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              <FileText size={18} />
              Documents
            </Link>
            <Link href="/notifications" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/notifications' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/notifications' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              <Bell size={18} />
              Notifications
            </Link>
            <Link href="/requests" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/requests' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/requests' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              <ClipboardList size={18} />
              Requests
            </Link>
            <Link href="/profile" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/profile' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/profile' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
              <User size={18} />
              My Profile
            </Link>
            {user && (
              <div className="flex items-center space-x-2 text-gray-700 py-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.firstName} {user.lastName}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="block bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors w-full flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}