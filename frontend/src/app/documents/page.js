'use client';

import Link from 'next/link';
import { useState } from 'react';
import documentsData from '@/lib/data.json';
import { ArrowRightCircle, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion'; // 👈 1. Import motion

export default function DocumentsGridPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    ...new Set(documentsData.map((doc) => doc.details.category)),
  ];

  const filteredDocuments = documentsData.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.details.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      className="pt-24 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >

      {/* Search Bar */}
      <motion.div
        className="mb-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* Category Filters */}
      <motion.div
        className="mb-8 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* No Results Message */}
      {filteredDocuments.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <h3 className="text-xl font-semibold text-gray-700">
            No Documents Found
          </h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or category filter.
          </p>
        </motion.div>
      )}

      {/* Document Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 items-stretch max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        {/* ⭐️ 2. MODIFIED: Added motion.div wrapper ⭐️ */}
        {filteredDocuments.map((doc) => (
          <motion.div
            layoutId={`card-container-${doc.id}`} // 👈 3. Add unique layoutId
            key={doc.id}
            className="h-full"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Link
              href={`/documents/${doc.id}?from=grid`}
              className="flex items-center justify-between bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-500 p-4 sm:p-5 group h-full"
            >
              {/* Left Icon */}
              <div className="bg-blue-800 text-white rounded-lg p-3 w-14 h-14 flex-shrink-0 flex items-center justify-center shadow-md transition-colors duration-200 ease-in-out group-hover:bg-blue-700">
                <FileText className="w-8 h-8" />
              </div>

              {/* Middle Text Section */}
              <div className="flex-1 px-4 min-w-0">
                <h3 className="font-montserrat font-extrabold text-blue-900 uppercase text-base sm:text-lg leading-tight">
                  {doc.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {doc.shortDescription}
                </p>
              </div>

              {/* Right Icon */}
              <ArrowRightCircle className="w-6 h-6 text-gray-400 flex-shrink-0 transition-colors duration-200 ease-in-out group-hover:text-blue-700" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}