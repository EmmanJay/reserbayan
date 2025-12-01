'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogOut, User, FileText, Bell, ClipboardList, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function UserNavbar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setRole(role);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // Dispatch custom event to update navbar wrapper
    window.dispatchEvent(new CustomEvent('userLogout'));
    window.location.href = '/';
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
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
          {role === 'SUPER_ADMIN' ? (
            <>
              <Link href="/superadmin/dashboard" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/superadmin/dashboard' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/dashboard' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                <LayoutDashboard size={18} />
                SuperAdmin Dashboard
              </Link>
              <Link href="/superadmin/admins" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/superadmin/admins' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/admins' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                <User size={18} />
                Admin Management
              </Link>
              <Link href="/superadmin/residents" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/superadmin/residents' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/residents' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                <User size={18} />
                Resident Management
              </Link>
              <Link href="/superadmin/requests" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/superadmin/requests' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/requests' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                <ClipboardList size={18} />
                Request Management
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={`relative px-3 py-2 font-semibold flex items-center gap-2 transition-all duration-300 ${pathname === '/dashboard' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/dashboard' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
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
            </>
          )}
        </nav>

        {/* Desktop Profile Dropdown */}
        <div className="hidden md:flex items-center relative">
          {user && (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-[#1E2566] transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="font-medium">{user.firstName} {user.lastName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Dropdown Menu */}
          {dropdownOpen && user && (
            <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1E2566] transition-colors first:rounded-t-lg"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>View Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-b-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
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
            {role === 'SUPER_ADMIN' ? (
              <>
                <Link href="/superadmin/dashboard" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/superadmin/dashboard' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/dashboard' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                  <LayoutDashboard size={18} />
                  SuperAdmin Dashboard
                </Link>
                <Link href="/superadmin/admins" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/superadmin/admins' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/admins' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                  <User size={18} />
                  Admin Management
                </Link>
                <Link href="/superadmin/residents" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/superadmin/residents' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/residents' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                  <User size={18} />
                  Resident Management
                </Link>
                <Link href="/superadmin/requests" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/superadmin/requests' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/superadmin/requests' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                  <ClipboardList size={18} />
                  Request Management
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`flex items-center gap-2 relative px-3 py-2 font-semibold transition-all duration-300 ${pathname === '/dashboard' ? 'text-[#1E2566]' : 'text-gray-700 hover:text-[#1E2566]'} ${pathname === '/dashboard' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#1E2566] after:to-[#2F87C3]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300'}`}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
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
              </>
            )}
            {/* Mobile Profile Dropdown */}
            {user && (
              <div ref={dropdownRef} className="space-y-2">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:text-[#1E2566] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#1E2566] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-8">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    performLogout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}