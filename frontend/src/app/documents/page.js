'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileBadge2,
  FileCheck2,
  FileText,
  Filter,
  Grid3X3,
  Home,
  LayoutList,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';

const categoryStyles = {
  'Financial Assistance': {
    icon: Banknote,
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    activeClassName: 'from-blue-600 to-sky-600 text-white shadow-blue-200',
  },
  Residency: {
    icon: Home,
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
    activeClassName: 'from-sky-600 to-blue-700 text-white shadow-sky-200',
  },
  Clearance: {
    icon: ShieldCheck,
    className: 'bg-blue-50 text-blue-800 ring-blue-200',
    activeClassName: 'from-blue-700 to-indigo-800 text-white shadow-blue-200',
  },
  'Permits & Tax': {
    icon: BriefcaseBusiness,
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
    activeClassName: 'from-sky-600 to-cyan-700 text-white shadow-sky-200',
  },
  'Infrastructure & Zoning': {
    icon: Building2,
    className: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
    activeClassName: 'from-indigo-600 to-blue-900 text-white shadow-indigo-200',
  },
};

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'time-asc', label: 'Fastest processing' },
  { value: 'requirements-asc', label: 'Fewest requirements' },
];

const processingFilters = [
  { value: 'All', label: 'Any timeline' },
  { value: 'quick', label: 'Same day' },
  { value: 'multi-day', label: 'Multi-day' },
  { value: 'variable', label: 'Variable' },
];

function getCategoryConfig(category) {
  return categoryStyles[category] || {
    icon: FileText,
    className: 'bg-slate-50 text-slate-700 ring-slate-200',
    activeClassName: 'from-slate-700 to-slate-900 text-white shadow-slate-200',
  };
}

function getProcessingMinutes(processingTime = '') {
  const normalizedProcessingTime = processingTime.toLowerCase().replace(/\s+/g, ' ').trim();

  if (!normalizedProcessingTime || normalizedProcessingTime.includes('varies')) {
    return Number.POSITIVE_INFINITY;
  }

  const numbers = normalizedProcessingTime.match(/\d+/g)?.map(Number) || [];
  const highestNumber = numbers.length ? Math.max(...numbers) : 0;

  if (normalizedProcessingTime.includes('working day') || normalizedProcessingTime.includes('day')) {
    return highestNumber * 24 * 60;
  }

  if (normalizedProcessingTime.includes('hour')) {
    return highestNumber * 60;
  }

  return highestNumber;
}

function getProcessingBucket(processingTime = '') {
  const normalizedProcessingTime = processingTime.toLowerCase();

  if (normalizedProcessingTime.includes('varies')) {
    return 'variable';
  }

  return getProcessingMinutes(processingTime) <= 24 * 60 ? 'quick' : 'multi-day';
}

function sortDocuments(documents, sortBy) {
  return [...documents].sort((firstDocument, secondDocument) => {
    if (sortBy === 'name-asc') {
      return firstDocument.name.localeCompare(secondDocument.name);
    }

    if (sortBy === 'name-desc') {
      return secondDocument.name.localeCompare(firstDocument.name);
    }

    if (sortBy === 'time-asc') {
      return getProcessingMinutes(firstDocument.details?.processingTime) - getProcessingMinutes(secondDocument.details?.processingTime);
    }

    if (sortBy === 'requirements-asc') {
      return (firstDocument.details?.requirements?.length || 0) - (secondDocument.details?.requirements?.length || 0);
    }

    return 0;
  });
}

function DocumentIcon() {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#111A54] via-[#1E4A92] to-[#2F87C3] text-white shadow-[0_16px_30px_rgba(30,74,146,0.22)]">
      <div className="absolute inset-1 rounded-[1rem] border border-white/20" />
      <FileBadge2 className="h-7 w-7" strokeWidth={1.8} />
    </div>
  );
}

function CategoryBadge({ category }) {
  const { icon: CategoryIcon, className } = getCategoryConfig(category);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${className}`}>
      <CategoryIcon className="h-3.5 w-3.5" />
      {category || 'General'}
    </span>
  );
}

function CategoryCornerBadge({ category }) {
  const { icon: CategoryIcon } = getCategoryConfig(category);

  return (
    <span
      title={category || 'General'}
      aria-label={category || 'General'}
      className="absolute left-0 top-0 z-0 inline-flex h-11 w-11 items-start justify-start rounded-br-[2.5rem] bg-gradient-to-br from-blue-600/16 via-sky-300/16 to-transparent p-2.5 text-blue-700/55 ring-1 ring-blue-100/50"
    >
      <CategoryIcon className="h-4 w-4" />
    </span>
  );
}

function CustomDropdown({ icon: Icon, options, value, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`flex h-[3.25rem] w-full items-center gap-3 rounded-2xl border bg-slate-50/80 px-4 text-left text-sm font-bold text-slate-700 outline-none transition-all ${
          isOpen
            ? 'border-blue-400 bg-white ring-4 ring-blue-100'
            : 'border-slate-200 hover:border-blue-200 hover:bg-white'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[120] overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc, viewMode, href }) {
  const requirementsCount = doc.details?.requirements?.length || 0;
  const processingTime = doc.details?.processingTime || 'Timeline to be confirmed';

  if (viewMode === 'list') {
    return (
      <motion.div
        layoutId={`card-container-${doc.id}`}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Link
          href={href}
          className="group grid min-h-[7.25rem] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_20px_44px_rgba(37,99,235,0.12)]"
        >
          <div className="[&>div]:h-12 [&>div]:w-12 [&_svg]:h-6 [&_svg]:w-6">
            <DocumentIcon />
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CategoryBadge category={doc.details?.category} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <Clock3 className="h-3.5 w-3.5" />
                {processingTime}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 sm:hidden">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {requirementsCount} requirements
              </span>
            </div>
            <h3 className="truncate font-montserrat text-lg font-extrabold uppercase tracking-tight text-[#0F2A6B]">
              {doc.name}
            </h3>
            <p className="mt-1 line-clamp-1 max-w-4xl text-sm leading-5 text-slate-600">
              {doc.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-slate-500 sm:inline-flex">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {requirementsCount} requirements
            </span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`card-container-${doc.id}`}
      className="h-full"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link
        href={href}
        className="group relative flex h-full min-h-[9.5rem] items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 pl-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_22px_46px_rgba(37,99,235,0.13)]"
      >
        <CategoryCornerBadge category={doc.details?.category} />
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[3.5rem] bg-gradient-to-br from-blue-50 to-sky-100 opacity-80 transition-transform duration-300 group-hover:scale-110" />
        <div className="relative z-10 shrink-0">
          <DocumentIcon />
        </div>

        <div className="relative z-10 min-w-0 flex-1">
          <h3 className="font-montserrat text-base font-extrabold uppercase leading-tight tracking-tight text-[#0F2A6B] sm:text-[1.05rem]">
            {doc.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
            {doc.shortDescription}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <Clock3 className="h-3.5 w-3.5 text-blue-600" />
              {processingTime}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
              {requirementsCount} items
            </span>
          </div>
        </div>

        <span className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-400 shadow-sm transition-all group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function DocumentsGridPage() {
  const { documentsData, loading, error } = useDocumentTypes();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All');
  const [processingFilter, setProcessingFilter] = useState(() => searchParams.get('timeline') || 'All');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'recommended');
  const [viewMode, setViewMode] = useState(() => searchParams.get('view') || 'grid');

  const categories = useMemo(() => [
    'All',
    ...new Set(documentsData.map((doc) => doc.details?.category).filter(Boolean)),
  ], [documentsData]);
  const categoryOptions = useMemo(() => categories.map((category) => ({
    value: category,
    label: category === 'All' ? 'All categories' : category,
  })), [categories]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearchQuery = searchQuery.toLowerCase().trim();

    const documents = documentsData.filter((doc) => {
      const searchableText = [
        doc.name,
        doc.shortDescription,
        doc.details?.category,
        doc.details?.processingTime,
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !normalizedSearchQuery || searchableText.includes(normalizedSearchQuery);
      const matchesCategory = selectedCategory === 'All' || doc.details?.category === selectedCategory;
      const matchesProcessing = processingFilter === 'All' || getProcessingBucket(doc.details?.processingTime) === processingFilter;

      return matchesSearch && matchesCategory && matchesProcessing;
    });

    return sortDocuments(documents, sortBy);
  }, [documentsData, processingFilter, searchQuery, selectedCategory, sortBy]);

  const totalCategories = Math.max(categories.length - 1, 0);
  const activeFiltersCount = [selectedCategory !== 'All', processingFilter !== 'All', searchQuery.trim() !== ''].filter(Boolean).length;

  const documentQueryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set('from', 'grid');
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (processingFilter !== 'All') params.set('timeline', processingFilter);
    if (sortBy !== 'recommended') params.set('sort', sortBy);
    if (viewMode !== 'grid') params.set('view', viewMode);

    return params.toString();
  }, [processingFilter, searchQuery, selectedCategory, sortBy, viewMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-8 pt-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-b-blue-600" />
          <p className="mt-4 font-medium text-slate-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-8 pt-24">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <p className="font-semibold text-red-600">Error loading documents: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(47,135,195,0.16),transparent_34%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_40%,#F6F8FC_100%)] px-4 pb-16 pt-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl">
        

        <motion.section
          className="sticky top-1 z-20 mt-4 rounded-3xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.09)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_210px_190px_190px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by document, purpose, or category..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-[3.25rem] w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm font-medium text-slate-700 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                suppressHydrationWarning={true}
              />
            </label>

            <CustomDropdown
              icon={Tags}
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              ariaLabel="Filter documents by category"
            />

            <CustomDropdown
              icon={Filter}
              options={processingFilters}
              value={processingFilter}
              onChange={setProcessingFilter}
              ariaLabel="Filter documents by processing timeline"
            />

            <CustomDropdown
              icon={SlidersHorizontal}
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              ariaLabel="Sort documents"
            />

            <div className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList className="h-4 w-4" />
                List
              </button>
            </div>
          </div>
        </motion.section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setProcessingFilter('All');
                }}
                className="mt-1 text-sm font-bold text-blue-700 hover:text-blue-900"
              >
                Clear {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
         
        </div>

        {filteredDocuments.length === 0 ? (
          <motion.div
            className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/85 p-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-bold text-slate-800">No documents found</h3>
            <p className="mt-2 text-slate-500">Try a different keyword, category, or timeline filter.</p>
          </motion.div>
        ) : (
          <motion.div
            className={viewMode === 'grid'
              ? 'mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              : 'mt-5 space-y-2.5'}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
          >
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                viewMode={viewMode}
                href={`/documents/${doc.id}?${documentQueryString}`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
