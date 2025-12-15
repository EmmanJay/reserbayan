'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDocumentsPage() {
  const [documentsData, setDocumentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/document-types', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocumentsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document type?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/document-types/${id}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to delete document');
      setDocumentsData(documentsData.filter(doc => doc.typeId !== id));
    } catch (err) {
      alert('Error deleting document: ' + err.message);
    }
  };

  const categories = [
    'All',
    ...new Set(documentsData.map((doc) => doc.details?.category).filter(Boolean)),
  ];

  const filteredDocuments = documentsData.filter((doc) => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.details?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading documents: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pt-24 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header with Add Button */}
      <motion.div
        className="mb-8 flex justify-between items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Manage Document Types</h1>
        <Link
          href="/admin/documents/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Document Type
        </Link>
      </motion.div>

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
            suppressHydrationWarning={true}
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
            suppressHydrationWarning={true}
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
        {filteredDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            className="h-full"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 p-4 sm:p-5 h-full flex flex-col">
              {/* Clickable Content */}
              <Link
                href={`/documents/${doc.id}?from=grid`}
                className="flex-1 flex flex-col cursor-pointer"
              >
                {/* Icon */}
                <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg p-3 w-14 h-14 flex-shrink-0 flex items-center justify-center shadow-md mb-4">
                  <FileText className="w-8 h-8" />
                </div>

                {/* Text Section */}
                <div className="flex-1 min-w-0 mb-4">
                  <h3 className="font-montserrat font-extrabold text-blue-900 uppercase text-base sm:text-lg leading-tight mb-2">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {doc.shortDescription}
                  </p>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Link
                  href={`/admin/documents/edit/${doc.typeId}`}
                  className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <Edit size={14} />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(doc.typeId)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}