'use client'; // 👈 Must be a client component for search/filter state

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { Search, FileText, LayoutGrid, PanelLeftOpen } from 'lucide-react'; // Import icons

// This component is the new, stateful sidebar
function DocumentSidebar({ isOpen, onClose }) {
  const { documentsData } = useDocumentTypes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname(); // Hook to get the current URL
  const searchParams = useSearchParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // --- Get categories and filter documents ---
  const categories = [
    'All',
    ...new Set(documentsData.map((doc) => doc.details?.category).filter(Boolean)),
  ];

  const filteredDocuments = documentsData.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'All' || doc.details?.category === selectedCategory;
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Check if coming from grid view and set animation state
  useEffect(() => {
    const from = searchParams.get('from');
    if (from === 'grid' && !hasAnimated) {
      setShouldAnimate(true);
      setIsVisible(true);
      setHasAnimated(true);
      // Remove the query param from URL after setting animation
      const url = new URL(window.location);
      url.searchParams.delete('from');
      window.history.replaceState({}, '', url);
    } else if (!from && !hasAnimated) {
      // If not coming from grid and hasn't animated, sidebar should be visible (no animation)
      setShouldAnimate(false);
      setIsVisible(true);
      setHasAnimated(true); // Mark as animated to prevent future animations
    }
  }, [searchParams, hasAnimated]);

  return (
    <>
      {/* Mobile Backdrop for closing */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`bg-white border-r p-6 space-y-4 transition-all duration-300 lg:transition-opacity lg:duration-500 ${
          isOpen
            ? 'fixed left-0 top-18 w-80 h-[calc(100vh-4.5rem)] z-50 transform translate-x-0 lg:static lg:z-auto lg:w-96 lg:flex-shrink-0 lg:transform-none lg:top-auto lg:h-auto'
            : 'hidden lg:block lg:w-96 lg:flex-shrink-0 lg:relative'
        } ${isVisible && !isFadingOut ? 'opacity-100' : 'opacity-0'}`}
        style={shouldAnimate ? { animation: 'slideInFromLeft 0.6s ease-out 0.2s both' } : {}}
      >


        {/* User Welcome Message */}
        {user && (
          <div className="px-4 py-3 bg-gray-100 rounded-lg mb-4">
            <p className="text-sm text-gray-700">Welcome, <span className="font-semibold">{user.firstName} {user.lastName}</span></p>
          </div>
        )}

        {/* 1. "Back to Grid" Button */}
        <Link
          href="/documents" // Link back to your main grid page
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          onClick={onClose} // Close mobile sidebar when navigating
        >
          <LayoutGrid className="w-5 h-5" />
          Back to All Documents
        </Link>

      {/* 2. Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search Documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 3. Category Filter Dropdown */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* 4. Document List */}
      <ul className="space-y-1 overflow-y-auto h-[calc(100vh-280px)]">
        {filteredDocuments.map((doc) => {
          const isActive = pathname === `/documents/${doc.id}`;
          return (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                onClick={onClose} // Close mobile sidebar when navigating
                // Dynamically change style if this link is active
                className={`flex items-center gap-3 p-3 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{doc.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    </>
  );
}

// This is the main layout
export default function DocumentsLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDetailPage = pathname.startsWith('/documents/') && pathname !== '/documents';

  if (isDetailPage) {
    return (
      // This div includes the navbar height (pt-18)
      <div className="flex min-h-screen bg-[#FAFAFA] pt-18">

        {/* The new stateful sidebar */}
        <DocumentSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* The 'children' prop is your detailed view page (page.js) */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`lg:hidden fixed top-20 left-4 z-30 p-2 bg-white rounded-md shadow-md border transition-all duration-300 ${isMobileSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <PanelLeftOpen className="w-6 h-6" />
          </button>

          {/* We center the content in a max-width container */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    );
  }

  // For the grid page, just return children without layout
  return children;
}