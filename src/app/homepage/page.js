'use client';

import Link from 'next/link';
import { useState } from 'react';
import documentsData from '@/lib/data.json';
import { ArrowRightCircle, FileText, Search } from 'lucide-react';

export default function DocumentsGridPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Category 1', 'Category 2', 'Category 3'];

  const filteredDocuments = documentsData.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.details.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] pb-16">

      {/* Search Bar */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        
        {filteredDocuments.map((doc) => (
          <Link
            href={`/homepage/${doc.id}`}
            key={doc.id}
            className="flex items-center justify-between bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-500 p-4 sm:p-5 hover:-translate-y-1 transition-transform duration-200 ease-in-out hover:[&>div:first-child]:bg-blue-700"
          >
            {/* Left Icon */}
            <div className="bg-blue-800 text-white rounded-lg p-3 w-14 h-14 flex-shrink-0 flex items-center justify-center shadow-md">
              <FileText className="w-8 h-8" />
            </div>

            {/* Middle Text Section */}
            <div className="flex-1 px-4">
              <h3 className="font-montserrat font-extrabold text-blue-900 uppercase text-base sm:text-lg leading-tight">{doc.name}</h3>
              <p className="text-sm text-gray-600">{doc.shortDescription}</p>
            </div>

            {/* Right Icon */}
            <ArrowRightCircle className="w-6 h-6 text-blue-700 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}